import { screen } from '@testing-library/react'
import { mockStore, renderMissions } from 'features/missions/testUtils/mockStore'

import MainContainer from './MainContainer'
import SimpleLayout from './SimpleLayout'

// The layouts show the missions header and the missions overlays (loading, error, info). The
// loading overlay also covers the onboarding flow, which writes missions.loadingMessage.

jest.mock('store', () => jest.requireActual('features/missions/testUtils/mockStore').storeMock)
jest.mock(
  '@alien-worlds/uikit',
  () => jest.requireActual('features/missions/testUtils/mocks').uikitMock
)
jest.mock('features/missions/components/MissionsHeader', () => ({
  MissionsHeader: () => <div data-testid="missions-header" />,
}))
jest.mock('shared/components/topbar/TopBar', () => ({ TopBar: () => null }))

const setup = (at: string, missions: Record<string, any> = {}) => {
  mockStore({
    state: {
      missions: { loadingMessage: null, infoMessage: null, errorMessage: null, ...missions },
    },
    actions: { missions: { clearInfoMessage: jest.fn(), clearErrorMessage: jest.fn() } },
  })
  return renderMissions(
    <MainContainer>
      <div>page</div>
    </MainContainer>,
    { at }
  )
}

describe('MainContainer', () => {
  it('shows the missions header on the missions pages', () => {
    setup('/missions/7/join')

    expect(screen.getByTestId('missions-header')).toBeInTheDocument()
    expect(screen.getByText('page')).toBeInTheDocument()
  })

  it('shows the missions overlays for their messages', () => {
    setup('/missions', {
      loadingMessage: 'Claiming your Mission rewards..',
      errorMessage: 'User denied transaction',
      infoMessage: 'Your Mission reward has been claimed.',
    })

    expect(screen.getByText('Claiming your Mission rewards..')).toBeInTheDocument()
    expect(screen.getByText('User denied transaction')).toBeInTheDocument()
    expect(screen.getByText('Your Mission reward has been claimed.')).toBeInTheDocument()
  })

  it('shows neither off the missions pages', () => {
    setup('/mining', { errorMessage: 'User denied transaction' })

    expect(screen.queryByTestId('missions-header')).not.toBeInTheDocument()
    expect(screen.queryByText('User denied transaction')).not.toBeInTheDocument()
    expect(screen.getByText('page')).toBeInTheDocument()
  })
})

describe('SimpleLayout', () => {
  it('shows the loading overlay for a missions loading message on any page', () => {
    mockStore({ state: { missions: { loadingMessage: 'Onboarding in progress!' }, wax: {} } })
    renderMissions(<SimpleLayout />, { at: '/onboarding' })

    expect(screen.getByText('Onboarding in progress!')).toBeInTheDocument()
  })
})
