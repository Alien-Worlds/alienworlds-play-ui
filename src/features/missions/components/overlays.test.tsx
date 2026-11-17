import { fireEvent, screen } from '@testing-library/react'
import { mockStore, renderMissions } from 'features/missions/testUtils/mockStore'

import { ErrorOverlay } from './ErrorOverlay/ErrorOverlay'
import { InfoOverlay } from './InfoOverlay/InfoOverlay'
import { LoadingTransactionOverlay } from './LoadingTransactionOverlay/LoadingTransactionOverlay'

// The full-screen overlays the layouts show for missions.loadingMessage, errorMessage and
// infoMessage (also used by the onboarding flow's loading messages).

jest.mock('store', () => jest.requireActual('features/missions/testUtils/mockStore').storeMock)
jest.mock(
  '@alien-worlds/uikit',
  () => jest.requireActual('features/missions/testUtils/mocks').uikitMock
)

const clearErrorMessage = jest.fn()
const clearInfoMessage = jest.fn()
const executeOnboarding = jest.fn()

const setup = (ui: React.ReactElement, missions = {}, wax = {}) => {
  mockStore({
    state: { missions, wax },
    actions: { missions: { clearErrorMessage, clearInfoMessage }, wax: { executeOnboarding } },
  })
  return renderMissions(ui)
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('ErrorOverlay', () => {
  it('shows the error and clears it on OK', () => {
    setup(<ErrorOverlay />, { errorMessage: 'User denied transaction' })

    expect(screen.getByText('User denied transaction')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    expect(clearErrorMessage).toHaveBeenCalled()
  })
})

describe('InfoOverlay', () => {
  it('shows the message and clears it on OK', () => {
    setup(<InfoOverlay />, { infoMessage: 'Your Mission reward has been claimed.' })

    expect(screen.getByText('Your Mission reward has been claimed.')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'OK' }))

    expect(clearInfoMessage).toHaveBeenCalled()
  })
})

describe('LoadingTransactionOverlay', () => {
  it('shows the loading message', () => {
    setup(<LoadingTransactionOverlay />, { loadingMessage: 'Claiming your Mission rewards..' })

    expect(screen.getByText('Claiming your Mission rewards..')).toBeInTheDocument()
    expect(screen.getByText(/This process may take over a minute/)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Try again' })).not.toBeInTheDocument()
  })

  it('falls back to a generic message', () => {
    setup(<LoadingTransactionOverlay />, { loadingMessage: null })

    expect(screen.getByText('Executing transaction on the chain...')).toBeInTheDocument()
  })

  it('retries onboarding when it offers to', () => {
    setup(
      <LoadingTransactionOverlay />,
      { loadingMessage: 'Onboarding in progress!' },
      { showOnboardingRetry: true }
    )

    fireEvent.click(screen.getByRole('button', { name: 'Try again' }))

    expect(executeOnboarding).toHaveBeenCalled()
  })
})
