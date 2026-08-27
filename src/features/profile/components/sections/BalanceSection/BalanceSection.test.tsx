import { render, screen } from '@testing-library/react'

import { BalanceSection } from './BalanceSection'

const mockUseProfileContext = jest.fn()
jest.mock('../../../context/ProfileContext', () => ({
  useProfileContext: () => mockUseProfileContext(),
}))

describe('BalanceSection', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders nothing when balanceData is not yet available', () => {
    mockUseProfileContext.mockReturnValue({ state: { balanceData: null } })
    const { container } = render(<BalanceSection />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders the WAX TLM balance and shards cards', () => {
    mockUseProfileContext.mockReturnValue({
      state: { balanceData: { tlmBalance: 12.5, stakedAmount: 0, shards: 100 } },
    })

    render(<BalanceSection />)

    expect(screen.getByText('WAX TLM Balance')).toBeInTheDocument()
    expect(screen.getByText('12.5000')).toBeInTheDocument()
    expect(screen.getByText('Shards')).toBeInTheDocument()
  })
})
