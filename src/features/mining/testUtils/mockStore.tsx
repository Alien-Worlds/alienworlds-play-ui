import React from 'react'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

// Stand-in for the Overmind `store` module, shared by mining tests so the Zustand migration only has
// to change this file. Point a test at it with:
//   jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
// then call `mockStore({ state, actions, effects })` in the test (or a beforeEach).

type Namespaces = Record<string, Record<string, any>>

const NAMESPACES = ['atomic', 'wax', 'main', 'missions', 'web3']

const withNamespaces = (value: Namespaces = {}): Namespaces =>
  NAMESPACES.reduce((result, ns) => ({ ...result, [ns]: value[ns] ?? {} }), { ...value })

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
  return current
}

export const createQueryWrapper = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  )
}
