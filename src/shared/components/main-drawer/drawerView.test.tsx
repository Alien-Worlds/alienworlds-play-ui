import { fireEvent, screen } from '@testing-library/react'
import {
  mockStore,
  renderSyndicates,
  setMockState,
  updateMockState,
} from 'features/syndicates/testUtils/mockStore'
import { MainDrawer } from 'shared/components/main-drawer/MainDrawer'
import { TopBar } from 'shared/components/topbar/TopBar'
import { useAssetsStore } from 'shared/store/assetsStore'
import { useModalStore } from 'shared/store/modalStore'
import { useSessionStore } from 'shared/store/sessionStore'

// Overmind's wax.selectedDrawerView, set by the top bar's drawer tabs and read by the main drawer,
// and wax.isSyndicatesSidebarOpen, which the top bar toggles on mobile syndicates pages.
//
// The indexes don't line up: the tabs are Mining 0, Missions 1, Landowner 2, the tab icons are
// Mining 0, Governance 1, Missions 2, Land 3, and the drawer shows Mining 0, Syndicates 1,
// Landowner 2, Missions 3. So the second tab shows a governance icon and opens the syndicates
// view, and the missions view (3) can't be reached from the tabs.

jest.mock('store', () => jest.requireActual('features/syndicates/testUtils/mockStore').storeMock)
jest.mock('features/glossary/store/glossaryStore', () => ({
  useGlossaryStore: (selector: (state: unknown) => unknown) =>
    selector({ glossaryDrawer: { isOpen: false } }),
}))
jest.mock('shared/components/topbar/BalanceTlmTop', () => ({ BalanceTlmTop: () => null }))
jest.mock('shared/components/topbar/BalanceUserPointsTop', () => ({
  BalanceUserPointsTop: () => null,
}))
jest.mock('shared/components/topbar/MiningCounter', () => ({ MiningCounter: () => null }))
jest.mock('shared/components/topbar/PlayerAvatar', () => ({ PlayerAvatar: () => null }))
jest.mock('shared/components/topbar/Tag', () => ({ Tag: () => null }))
jest.mock('shared/util/icons', () => ({
  ...jest.requireActual('shared/util/icons'),
  MainDrawerTabIcon: (index: number) => <span>tab {index}</span>,
}))
jest.mock('features/mining/components/MiningDesktopView', () => ({
  MiningDesktopView: () => <div>mining view</div>,
}))
jest.mock('features/missions/components/MissionsView', () => ({
  MissionsView: () => <div>missions view</div>,
}))
jest.mock('features/syndicates/components/SyndicateView/SyndicateView', () => ({
  SyndicateView: () => <div>syndicate view</div>,
}))
jest.mock('shared/components/main-drawer/LandownerView', () => ({
  LandownerView: () => <div>landowner view</div>,
}))
jest.mock('features/profile', () => ({ ProfileProvider: ({ children }: any) => children }))
jest.mock('shared/components/main-drawer/Header', () => ({ Header: () => null }))
jest.mock('shared/components/main-drawer/LogoutButton', () => ({ LogoutButton: () => null }))
jest.mock('shared/components/main-drawer/Menu', () => ({ Menu: () => null }))
jest.mock('shared/components/main-drawer/SocialCards', () => ({ SocialCards: () => null }))

const mockScreen = { isNotDesktop: false, isMobile: false, isLargeScreen: false }
jest.mock('shared/util/hooks', () => ({
  ...jest.requireActual('shared/util/hooks'),
  useScreenSize: () => mockScreen,
}))

const setupTopBar = ({
  selectedDrawerView = null,
  at = '/inventory',
  isSyndicatesSidebarOpen = false,
} = {}) => {
  const wax = {
    setSelectedDrawerView: jest.fn((index: number) =>
      setMockState('wax', { selectedDrawerView: index })
    ),
    setIsSyndicatesSidebarOpen: jest.fn(),
  }
  mockStore({ state: { wax: { selectedDrawerView, isSyndicatesSidebarOpen } }, actions: { wax } })
  renderSyndicates(<TopBar />, { at })
  return wax
}

const drawerOpen = () => useModalStore.getState().isMainDrawerOpen

beforeEach(() => {
  Object.assign(mockScreen, { isNotDesktop: false, isMobile: false, isLargeScreen: false })
  useSessionStore.setState({
    walletId: 'voter.wam',
    isDemoUser: false,
    isLoggedIn: true,
    isAuthenticating: false,
  })
  useModalStore.setState({ isMainDrawerOpen: false, isCompactSidebar: false })
  useAssetsStore.setState({ ownedLandsAssets: [] })
})

describe('TopBar drawer tabs', () => {
  it('shows the Landowner tab only to land owners', () => {
    setupTopBar()
    expect(screen.queryByText('tab 2')).not.toBeInTheDocument()
    expect(screen.getByText('tab 1')).toBeInTheDocument()
  })

  it('shows it, with the missions icon, to a land owner', () => {
    useAssetsStore.setState({ ownedLandsAssets: [{ asset_id: '1' } as any] })
    setupTopBar()

    expect(screen.getByText('tab 2')).toBeInTheDocument()
  })

  it('opens the drawer on the clicked tab', () => {
    const { setSelectedDrawerView } = setupTopBar()

    fireEvent.click(screen.getByText('tab 1'))

    expect(setSelectedDrawerView).toHaveBeenCalledWith(1)
    expect(drawerOpen()).toBe(true)
  })

  it('switches tab in the open drawer, and closes it from the current tab', () => {
    useModalStore.setState({ isMainDrawerOpen: true })
    setupTopBar({ selectedDrawerView: 0 })

    fireEvent.click(screen.getByText('tab 1'))
    expect(drawerOpen()).toBe(true)

    fireEvent.click(screen.getByText('tab 1'))
    expect(drawerOpen()).toBe(false)
  })

  it('the menu button picks the first tab when none is set, or the mining tab (0) is', () => {
    const { setSelectedDrawerView } = setupTopBar({ selectedDrawerView: 0 })

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))

    expect(setSelectedDrawerView).toHaveBeenCalledWith(0)
    expect(useModalStore.getState().isCompactSidebar).toBe(true)
  })

  it('the menu button keeps another tab', () => {
    const { setSelectedDrawerView } = setupTopBar({ selectedDrawerView: 1 })

    fireEvent.click(screen.getByRole('button', { name: 'Menu' }))

    expect(setSelectedDrawerView).not.toHaveBeenCalled()
  })
})

describe('TopBar syndicates sidebar toggle', () => {
  it('toggles the syndicates sidebar from the logo on mobile syndicates pages', () => {
    Object.assign(mockScreen, { isNotDesktop: true, isMobile: true })
    const { setIsSyndicatesSidebarOpen } = setupTopBar({ at: '/syndicates/kavian' })

    const logos = document.querySelectorAll('svg')
    fireEvent.click(logos[logos.length - 1])

    expect(setIsSyndicatesSidebarOpen).toHaveBeenCalledWith(true)
  })
})

describe('MainDrawer', () => {
  it.each([
    [0, 'mining view'],
    [1, 'syndicate view'],
    [2, 'landowner view'],
    [3, 'missions view'],
  ])('shows view %s as the %s', (selectedDrawerView, view) => {
    useModalStore.setState({ isMainDrawerOpen: true })
    mockStore({ state: { wax: { selectedDrawerView } } })
    renderSyndicates(<MainDrawer />)

    expect(screen.getByText(view)).toBeInTheDocument()
  })

  it('follows wax.selectedDrawerView', () => {
    useModalStore.setState({ isMainDrawerOpen: true })
    mockStore({ state: { wax: { selectedDrawerView: 0 } } })
    renderSyndicates(<MainDrawer />)

    updateMockState('wax', { selectedDrawerView: 1 })

    expect(screen.getByText('syndicate view')).toBeInTheDocument()
    expect(screen.queryByText('mining view')).not.toBeInTheDocument()
  })
})
