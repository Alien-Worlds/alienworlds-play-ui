import { render, screen } from '@testing-library/react'
import { mockStore } from 'features/mining/testUtils/mockStore'

import { LandInfo } from './LandInfo'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
jest.mock('features/mining/components/LandOwners/Components/LandImage/LandImage', () => ({
  LandImage: () => null,
}))
jest.mock('features/inventory/utils/NFTCardOverlayRender', () => ({
  NFTCardOverlayRender: ({ asset }: any) => <div data-testid="land-card">{asset.id}</div>,
}))

const setup = (data: Record<string, any>) => {
  mockStore({
    state: {
      wax: {
        managingLandDetails: { name: 'Mountains on Kavian', owner: 'owner.wam', data },
        nftLandCardProperties: { id: 'card-42' },
      },
    },
  })
  return render(<LandInfo />)
}

describe('LandInfo', () => {
  it('shows the managed land', () => {
    setup({ x: 3, y: 8, landrating: 2500000 })

    expect(screen.getByText('Mountains')).toBeInTheDocument()
    expect(screen.getByText('Kavian')).toBeInTheDocument()
    expect(screen.getByText(/\(3:8/)).toBeInTheDocument()
    expect(screen.getByText('250')).toBeInTheDocument()
    expect(screen.getByText('owner.wam')).toBeInTheDocument()
    expect(screen.getByTestId('land-card')).toHaveTextContent('card-42')
  })

  it('uses the default land rating when the land has none', () => {
    setup({ x: 3, y: 8 })

    expect(screen.getByText('100')).toBeInTheDocument()
  })
})
