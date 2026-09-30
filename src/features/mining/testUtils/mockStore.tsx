import React from 'react'

import { ChakraProvider } from '@chakra-ui/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import { getInitialMiningState, useMiningStore } from 'features/mining/store/miningStore'
import { getInitialAssetsState, useAssetsStore } from 'shared/store/assetsStore'
import { theme } from 'shared/styles/theme'

// Stand-in for the Overmind `store` module, shared by mining tests. Point a test at it with:
//   jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
// then call `mockStore({ state, actions, effects })` in the test (or a beforeEach).
//
// `state.atomic` and `actions.atomic` seed the Zustand stores that now hold that state
// (useAssetsStore, useMiningStore), each getting the fields it owns, so tests
// written against Overmind's `atomic` namespace keep working. Passing an `atomic` action replaces
// the store's real one (e.g. a jest.fn to assert on).

type Namespaces = Record<string, Record<string, any>>

const NAMESPACES = ['atomic', 'wax', 'main', 'missions', 'web3']

const withNamespaces = (value: Namespaces = {}): Namespaces =>
  NAMESPACES.reduce((result, ns) => ({ ...result, [ns]: value[ns] ?? {} }), { ...value })

type SeedableStore = {
  store: { setState: (state: object, replace: boolean) => void }
  real: object
  initial: () => object
}

const zustandStores: SeedableStore[] = [
  { store: useAssetsStore, real: useAssetsStore.getState(), initial: getInitialAssetsState },
  { store: useMiningStore, real: useMiningStore.getState(), initial: getInitialMiningState },
]

// Resets each store and gives it the atomic fields it owns.
const seedZustandStores = (atomic: Record<string, any>) => {
  zustandStores.forEach(({ store, real, initial }) => {
    const owned = Object.fromEntries(Object.entries(atomic).filter(([key]) => key in real))
    store.setState({ ...real, ...initial(), ...owned }, true)
  })
}

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
  current.actions = withNamespaces(actions)
  current.effects = withNamespaces(effects)
  seedZustandStores({ ...state?.atomic, ...actions?.atomic })
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
