import React from 'react'

import { ChakraProvider } from '@chakra-ui/react'
import { render } from '@testing-library/react'
import { getInitialBscWalletState, useBscWalletStore } from 'features/missions/store/bscWalletStore'
import { getInitialMissionsState, useMissionsStore } from 'features/missions/store/missionsStore'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import {
  getInitialOverlayMessagesState,
  useOverlayMessagesStore,
} from 'shared/store/overlayMessagesStore'
import { theme } from 'shared/styles/theme'

// Stand-in for the Overmind `store` module, shared by missions tests. Point a test at it with:
//   jest.mock('store', () => jest.requireActual('features/missions/testUtils/mockStore').storeMock)
// then call `mockStore({ state, actions })` in the test (or a beforeEach). Namespaces not passed
// are empty objects, so components can destructure them.
//
// The `missions` and `web3` state and actions passed in also seed the Zustand stores that now hold
// them (useMissionsStore, useBscWalletStore, useOverlayMessagesStore), each store getting the
// fields it owns, so tests written against Overmind's namespaces keep working. Passing an action
// replaces the store's real one (e.g. a jest.fn to assert on). Derived fields (currentMissions,
// explorerMissions…) aren't recomputed: pass the ones a component reads.

type Namespaces = Record<string, Record<string, any>>

const NAMESPACES = ['missions', 'web3', 'main', 'wax']

const withNamespaces = (value: Namespaces = {}): Namespaces =>
  NAMESPACES.reduce((result, ns) => ({ ...result, [ns]: value[ns] ?? {} }), { ...value })

type SeedableStore = {
  store: { setState: (state: object, replace?: boolean) => void }
  real: object
  initial: () => object
}

const zustandStores: SeedableStore[] = [
  { store: useMissionsStore, real: useMissionsStore.getState(), initial: getInitialMissionsState },
  {
    store: useBscWalletStore,
    real: useBscWalletStore.getState(),
    initial: getInitialBscWalletState,
  },
  {
    store: useOverlayMessagesStore,
    real: useOverlayMessagesStore.getState(),
    initial: getInitialOverlayMessagesState,
  },
]

// Gives each store the fields it owns, resetting the rest.
const seedZustandStores = (fields: Record<string, any>) => {
  zustandStores.forEach(({ store, real, initial }) => {
    const owned = Object.fromEntries(Object.entries(fields).filter(([key]) => key in real))
    store.setState({ ...real, ...initial(), ...owned }, true)
  })
}

const current: { state: Namespaces; actions: Namespaces } = {
  state: withNamespaces(),
  actions: withNamespaces(),
}

export const storeMock = {
  useAppState: () => current.state,
  useActions: () => current.actions,
  useEffects: () => ({}),
}

export const mockStore = ({
  state,
  actions,
}: { state?: Namespaces; actions?: Namespaces } = {}) => {
  current.state = withNamespaces(state)
  current.actions = withNamespaces(actions)
  seedZustandStores({
    ...state?.missions,
    ...state?.web3,
    ...actions?.missions,
    ...actions?.web3,
  })
  return current
}

type RenderOptions = {
  /** The URL to render at. */
  at?: string
  /** A route pattern for `at`, so `useParams` and `useMatch` see it. */
  path?: string
}

// Renders inside Chakra (modals read the theme) and a router at `at`, as a wrapper so `rerender`
// keeps them. Tests assert navigation by mocking `useNavigate`, as elsewhere in the repo.
export const renderMissions = (
  ui: React.ReactElement,
  { at = '/missions', path }: RenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactElement }) => (
    <ChakraProvider theme={theme}>
      <MemoryRouter initialEntries={[at]}>
        <Routes>
          <Route path={path ?? at} element={children} />
        </Routes>
      </MemoryRouter>
    </ChakraProvider>
  )
  return render(ui, { wrapper: Wrapper })
}
