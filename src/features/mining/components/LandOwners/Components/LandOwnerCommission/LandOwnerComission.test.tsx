import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockStore, renderWithChakra } from 'features/mining/testUtils/mockStore'

import { NFTLandOwnerCommission } from './LandOwnerComission'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
jest.mock('@alien-worlds/uikit', () => ({
  ...jest.requireActual('@alien-worlds/uikit'),
  Button: ({ children, onClick, disabled }: any) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}))
jest.mock('features/syndicates/components/LoadingSpinner/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}))

const mockUsePlanetDetail = jest.fn()
jest.mock('graphql/hooks/usePlanetDetail', () => ({
  usePlanetDetail: (planet: string) => mockUsePlanetDetail(planet),
}))

const trySetCommission = jest.fn()

const landCard = (overrides: Record<string, any> = {}) => ({
  type: { name: 'Land' },
  commission: { name: 10 },
  assetId: { name: '42' },
  isUserOwner: true,
  ...overrides,
})

const setup = (asset = landCard(), override: any = null) => {
  mockUsePlanetDetail.mockReturnValue({
    planetDetails: { land_commission_override: override },
    loading: false,
  })
  mockStore({ actions: { wax: { trySetCommission } } })
  return renderWithChakra(
    <NFTLandOwnerCommission
      asset={asset}
      landAsset={{ data: { name: 'Plains on Kavian' } } as any}
    />
  )
}

const input = () => screen.getByRole('spinbutton')

const typeCommission = (value: string) => fireEvent.change(input(), { target: { value } })

beforeEach(() => jest.clearAllMocks())

describe('NFTLandOwnerCommission', () => {
  it('renders nothing for NFTs that are not land', () => {
    setup(landCard({ type: { name: 'Tool' } }))

    expect(screen.queryByText('Landowner commission')).not.toBeInTheDocument()
  })

  it('looks up the commission limits for the land planet', () => {
    setup()

    expect(mockUsePlanetDetail).toHaveBeenCalledWith('kavian')
    expect(input()).toHaveValue('10')
  })

  it('sets the commission as an on-chain integer', async () => {
    setup()

    typeCommission('2.55')
    await userEvent.click(screen.getByRole('button', { name: 'Set' }))

    expect(trySetCommission).toHaveBeenCalledWith({ landId: '42', commission: '255' })
  })

  it('rejects a commission above the 25% default maximum', async () => {
    setup()

    typeCommission('30')
    await userEvent.click(screen.getByRole('button', { name: 'Set' }))

    expect(screen.getByText('Commission cannot be greater than 25%')).toBeInTheDocument()
    expect(trySetCommission).not.toHaveBeenCalled()
  })

  it('uses the planet commission limits', async () => {
    setup(landCard(), { min_commission: 500, max_commission: 1500 })

    typeCommission('3')
    expect(screen.getByText('Commission cannot be less than 5%')).toBeInTheDocument()

    typeCommission('16')
    expect(screen.getByText('Commission cannot be greater than 15%')).toBeInTheDocument()

    typeCommission('12')
    await userEvent.click(screen.getByRole('button', { name: 'Set' }))
    expect(trySetCommission).toHaveBeenCalledWith({ landId: '42', commission: '1200' })
  })

  it('treats a max of 0 as the 25% default', () => {
    setup(landCard(), { min_commission: 0, max_commission: 0 })

    typeCommission('26')

    expect(screen.getByText('Commission cannot be greater than 25%')).toBeInTheDocument()
  })

  it('is read-only for players who do not own the land', () => {
    setup(landCard({ isUserOwner: false }))

    expect(input()).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Set' })).toBeDisabled()
  })

  it('shows a spinner while the planet loads', () => {
    mockStore({ actions: { wax: { trySetCommission } } })
    mockUsePlanetDetail.mockReturnValue({ planetDetails: null, loading: true })

    renderWithChakra(
      <NFTLandOwnerCommission asset={landCard()} landAsset={{ data: { name: 'x on y' } } as any} />
    )

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })
})
