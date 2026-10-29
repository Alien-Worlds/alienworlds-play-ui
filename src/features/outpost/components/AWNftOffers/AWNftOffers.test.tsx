import { render, screen } from '@testing-library/react'
import { DateTime } from 'luxon'

import { AWNftOffers } from './AWNftOffers'

const mockUseAWNftOffers = jest.fn()
jest.mock('features/outpost/hooks/queries/useAWNftOffers', () => ({
  useAWNftOffers: () => mockUseAWNftOffers(),
}))

const mockUserPointsOffer = jest.fn()
jest.mock('features/outpost/components/UserPointsOffer/UserPointsOffer', () => ({
  UserPointsOfferType: { CURRENT: 0, UPCOMING: 1 },
  UserPointsOffer: (props) => {
    mockUserPointsOffer(props)
    return <span>{`${props.type === 0 ? 'current' : 'upcoming'} ${props.pointsOffer.id}`}</span>
  },
}))

jest.mock('features/syndicates/components/LoadingSpinner', () => ({
  LoadingSpinner: () => <span>loading</span>,
}))

const iso = (hoursFromNow: number) =>
  DateTime.utc().plus({ hours: hoursFromNow }).toISO({ includeOffset: false })
const offer = (id: number, startInHours: number, endInHours: number) => ({
  id,
  start: iso(startInHours),
  end: iso(endInHours),
})

describe('AWNftOffers', () => {
  const showRedeemModal = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  it('shows a spinner while the offers load', () => {
    mockUseAWNftOffers.mockReturnValue({ pointsOffers: [], isLoading: true })
    render(<AWNftOffers showRedeemModal={showRedeemModal} />)

    expect(screen.getByText('loading')).toBeInTheDocument()
  })

  it('shows current offers, then upcoming ones below a divider', () => {
    mockUseAWNftOffers.mockReturnValue({
      pointsOffers: [offer(1, -24, 48), offer(2, 3, 72), offer(3, -2, 10)],
      isLoading: false,
    })
    render(<AWNftOffers showRedeemModal={showRedeemModal} />)

    const shown = Array.from(document.querySelectorAll('span, hr')).map((el) =>
      el.tagName === 'HR' ? 'divider' : el.textContent
    )
    expect(shown).toEqual(['current 1', 'current 3', 'divider', 'upcoming 2'])
  })

  it('has no upcoming section without upcoming offers', () => {
    mockUseAWNftOffers.mockReturnValue({ pointsOffers: [offer(1, -24, 48)], isLoading: false })
    render(<AWNftOffers showRedeemModal={showRedeemModal} />)

    expect(screen.getByText('current 1')).toBeInTheDocument()
    expect(document.querySelector('hr')).toBeNull()
  })

  it('lets each offer open the redeem modal', () => {
    mockUseAWNftOffers.mockReturnValue({ pointsOffers: [offer(1, -24, 48)], isLoading: false })
    render(<AWNftOffers showRedeemModal={showRedeemModal} />)

    expect(mockUserPointsOffer).toHaveBeenCalledWith(
      expect.objectContaining({ redeem: showRedeemModal })
    )
  })
})
