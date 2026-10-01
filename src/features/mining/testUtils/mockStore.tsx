import React from 'react'

import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { getInitialMiningState, useMiningStore } from 'features/mining/store/miningStore'
import { getInitialAssetsState, useAssetsStore } from 'shared/store/assetsStore'
import { getInitialMinerState, useMinerStore } from 'shared/store/minerStore'
import { useModalStore } from 'shared/store/modalStore'
import { theme } from 'shared/styles/theme'

// Stand-in for the Overmind `store` module, shared by mining tests. Point a test at it with:
//   jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
// then call `mockStore({ state, actions, effects })` in the test (or a beforeEach).
//
// The `atomic`, `wax` and `main` state and actions passed in also seed the Zustand stores that now
// hold them (useAssetsStore, useMiningStore, useMinerStore, useModalStore), each store getting the
// fields it owns, so tests written against Overmind's namespaces keep working. Passing an action
// replaces the store's real one (e.g. a jest.fn to assert on). `wax.collectEvent` (page-visit
// analytics, still Overmind) defaults to a no-op.

type Namespaces = Record<string, Record<string, any>>

const NAMESPACES = ['atomic', 'wax', 'main', 'missions', 'web3']

const withNamespaces = (value: Namespaces = {}): Namespaces =>
  NAMESPACES.reduce((result, ns) => ({ ...result, [ns]: value[ns] ?? {} }), { ...value })

type SeedableStore = {
  store: { setState: (state: object, replace?: boolean) => void }
  real: object
  /** Initial state to reset to, or null to only patch (the modal store, which tests set up first). */
  initial: (() => object) | null
}

const zustandStores: SeedableStore[] = [
  { store: useAssetsStore, real: useAssetsStore.getState(), initial: getInitialAssetsState },
  { store: useMiningStore, real: useMiningStore.getState(), initial: getInitialMiningState },
  { store: useMinerStore, real: useMinerStore.getState(), initial: getInitialMinerState },
  { store: useModalStore, real: useModalStore.getState(), initial: null },
]

// Gives each store the fields it owns, resetting the rest.
const seedZustandStores = (fields: Record<string, any>) => {
  zustandStores.forEach(({ store, real, initial }) => {
    const owned = Object.fromEntries(Object.entries(fields).filter(([key]) => key in real))
    if (initial) store.setState({ ...real, ...initial(), ...owned }, true)
    else if (Object.keys(owned).length) store.setState(owned)
  })
}

const DEFAULT_ACTIONS: Namespaces = { wax: { collectEvent: () => {} } }

const current: { state: Namespaces; actions: Namespaces; effects: Namespaces } = {
  state: withNamespaces(),
  actions: withNamespaces(),
  effects: withNamespaces(),
}

export const storeMock = {
  useAppState: () => current.state,
  useActions: () => current.actions,
  useEffects: () => current.effects,
}

export const mockStore = ({
  state,
  actions,
  effects,
}: { state?: Namespaces; actions?: Namespaces; effects?: Namespaces } = {}) => {
  current.state = withNamespaces(state)
  current.actions = withNamespaces({
    ...actions,
    wax: { ...DEFAULT_ACTIONS.wax, ...actions?.wax },
  })
  current.effects = withNamespaces(effects)
  seedZustandStores({
    ...state?.atomic,
    ...state?.wax,
    ...state?.main,
    ...actions?.atomic,
    ...actions?.wax,
    ...actions?.main,
  })
  return current
}

export const createQueryWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}

// Chakra's Drawer and Modal read the theme, so components that use them need the provider.
export const renderWithChakra = (ui: React.ReactElement) =>
  render(<ChakraProvider theme={theme}>{ui}</ChakraProvider>)
