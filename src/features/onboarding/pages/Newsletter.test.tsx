import { fireEvent, screen } from '@testing-library/react'
import { mockStore, renderMissions } from 'features/missions/testUtils/mockStore'

import { Newsletter } from './Newsletter'

// The onboarding newsletter step reads the missions newsletter flag.

jest.mock('store', () => jest.requireActual('features/missions/testUtils/mockStore').storeMock)
jest.mock('features/onboarding/components/OnboardingNewsletterSubscription', () => ({
  OnboardingNewsletterSubscription: ({ onClose }: { onClose: () => void }) => (
    <button type="button" onClick={onClose}>
      close
    </button>
  ),
}))

const mockNavigate = jest.fn()
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}))

const showOnboardingPage = jest.fn()
const storeOnboardingNewsletterWasShown = jest.fn()

const setup = (newsletterWasShown: boolean) => {
  mockStore({
    state: { missions: { newsletterWasShown } },
    actions: { main: { showOnboardingPage, storeOnboardingNewsletterWasShown } },
  })
  return renderMissions(<Newsletter />, { at: '/onboarding/newsletter' })
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('Newsletter', () => {
  it('reports the onboarding page visit when the missions newsletter was already shown', () => {
    setup(true)

    expect(showOnboardingPage).toHaveBeenCalled()
  })

  it("doesn't otherwise", () => {
    setup(false)

    expect(showOnboardingPage).not.toHaveBeenCalled()
  })

  it('remembers the onboarding newsletter was shown and continues onboarding', () => {
    setup(false)

    fireEvent.click(screen.getByRole('button', { name: 'close' }))

    expect(storeOnboardingNewsletterWasShown).toHaveBeenCalledWith(true)
    expect(mockNavigate).toHaveBeenCalledWith('/onboarding')
  })
})
