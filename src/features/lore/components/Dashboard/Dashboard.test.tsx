import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

let mockUseLoreDashboardResult: any
let mockLoreFilter: any
const mockSetLoreFilter = jest.fn()

jest.mock('features/lore/hooks/useLoreDashboard', () => ({
  useLoreDashboard: () => mockUseLoreDashboardResult,
}))

jest.mock('store', () => ({
  useAppState: () => ({
    wax: { loreFilter: mockLoreFilter },
  }),
  useActions: () => ({
    wax: { setLoreFilter: mockSetLoreFilter },
  }),
}))

jest.mock('features/lore/components/LoreDrawer/LoreDrawer', () => ({
  LoreDrawer: ({ isOpen }: any) => (isOpen ? <div data-testid="lore-drawer" /> : null),
}))

jest.mock('features/syndicates/components/LoadingSpinner/LoadingSpinner', () => ({
  LoadingSpinner: () => <div data-testid="loading-spinner" />,
}))

import { Dashboard, loreStatusColorFinder } from './Dashboard'
import { LoreStatus } from '../../types/loreTypes'

const makeLore = (overrides: any = {}) => ({
  proposal_id: 1,
  title: 'A Lore Proposal',
  proposer: 'alice',
  submitted: '2024-01-01T00:00:00.000Z',
  expires: '2024-02-01T00:00:00.000Z',
  earliest_exec: '2024-01-15T00:00:00.000Z',
  total_yes_votes: 10,
  total_no_votes: 2,
  status: 'open',
  ...overrides,
})

describe('Dashboard', () => {
  beforeEach(() => {
    mockLoreFilter = { sortBy: 0, reversed: false }
    mockUseLoreDashboardResult = {
      isLoading: false,
      sortedLores: [makeLore()],
      selectedLore: null,
      selectedProposalId: null,
      handleSelectLore: jest.fn(),
      clearSelection: jest.fn(),
    }
    jest.clearAllMocks()
  })

  it('shows a loading spinner while lores are loading', () => {
    mockUseLoreDashboardResult = { ...mockUseLoreDashboardResult, isLoading: true }
    render(<Dashboard currentNumber={5} />)
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
  })

  it('renders the vote power and a row per proposal', () => {
    render(<Dashboard currentNumber={5} />)

    expect(screen.getByText('5 VP Available')).toBeInTheDocument()
    expect(screen.getByText('A Lore Proposal')).toBeInTheDocument()
    expect(screen.getByText('alice')).toBeInTheDocument()
  })

  it('selects a proposal when its row is clicked', async () => {
    render(<Dashboard currentNumber={5} />)

    await userEvent.click(screen.getByText('A Lore Proposal'))

    expect(mockUseLoreDashboardResult.handleSelectLore).toHaveBeenCalledWith(1)
  })

  it('opens the drawer once a lore is selected', () => {
    mockUseLoreDashboardResult = {
      ...mockUseLoreDashboardResult,
      selectedLore: makeLore(),
    }
    render(<Dashboard currentNumber={5} />)

    expect(screen.getByTestId('lore-drawer')).toBeInTheDocument()
  })

  it('changes the sort column when a header is clicked', async () => {
    render(<Dashboard currentNumber={5} />)

    await userEvent.click(screen.getByText('Title'))

    expect(mockSetLoreFilter).toHaveBeenCalledWith(
      expect.objectContaining({ sortBy: expect.anything() })
    )
  })
})

describe('loreStatusColorFinder', () => {
  it('returns a color for every known status', () => {
    Object.values(LoreStatus).forEach((status) => {
      expect(loreStatusColorFinder(status)).toBeTruthy()
    })
  })

  it('returns undefined for an unknown status', () => {
    expect(loreStatusColorFinder('unknown-status')).toBeUndefined()
  })
})
