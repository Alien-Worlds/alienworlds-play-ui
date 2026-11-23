import React from 'react'

import { ChakraProvider } from '@chakra-ui/react'
import { act, render } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'
import { theme } from 'shared/styles/theme'
import { create } from 'zustand'

// Stand-in for the Overmind `store` module, shared by syndicates tests. Point a test at it with:
//   jest.mock('store', () => jest.requireActual('features/syndicates/testUtils/mockStore').storeMock)
// then call `mockStore({ state, actions })` in the test (or a beforeEach). Namespaces not passed
// are empty objects, so components can destructure them.
//
// Unlike the missions stand-in it is reactive: `setMockState` merges into a namespace and
// re-renders the components reading it, like an Overmind mutation. Action mocks can call it to
// play out what the real action writes (e.g. a sidebar toggle the component then reacts to).

type Namespaces = Record<string, Record<string, any>>

const NAMESPACES = ['wax', 'main', 'atomic']

const withNamespaces = (value: Namespaces = {}): Namespaces =>
  NAMESPACES.reduce((result, ns) => ({ ...result, [ns]: value[ns] ?? {} }), { ...value })

const useOvermindMock = create<{ state: Namespaces; actions: Namespaces }>(() => ({
  state: withNamespaces(),
  actions: withNamespaces(),
}))

export const storeMock = {
  useAppState: () => useOvermindMock((store) => store.state),
  useActions: () => useOvermindMock((store) => store.actions),
  useEffects: () => ({}),
}

export const mockStore = ({
  state,
  actions,
}: { state?: Namespaces; actions?: Namespaces } = {}) => {
  useOvermindMock.setState({ state: withNamespaces(state), actions: withNamespaces(actions) })
  return useOvermindMock.getState()
}

/**
 * Merges `fields` into the `namespace` state and re-renders its readers. For action mocks, which
 * run inside the render or event that called them; from a test body use `updateMockState`.
 */
export const setMockState = (namespace: string, fields: Record<string, any>) => {
  useOvermindMock.setState(({ state }) => ({
    state: { ...state, [namespace]: { ...state[namespace], ...fields } },
  }))
}

/** `setMockState` wrapped in act, for a test body (e.g. a transaction finishing). */
export const updateMockState = (namespace: string, fields: Record<string, any>) => {
  act(() => setMockState(namespace, fields))
}

export const getMockState = () => useOvermindMock.getState().state

const LocationDisplay = () => <div data-testid="location">{useLocation().pathname}</div>

type RenderOptions = {
  /** The URL to render at. */
  at?: string
  /**
   * Route patterns for `at`, so `useParams` and `useMatch` see it. With several, the component
   * stays mounted while navigating between them (e.g. the candidate list and a candidate).
   */
  path?: string | string[]
}

/**
 * Renders inside Chakra (modals read the theme) and a router at `at`. Navigation is asserted with
 * `currentPath()`; navigating away from `path` unmounts the component, as the app's routes would.
 */
export const renderSyndicates = (
  ui: React.ReactElement,
  { at = '/syndicates/kavian', path }: RenderOptions = {}
) => {
  const Wrapper = ({ children }: { children: React.ReactElement }) => (
    <ChakraProvider theme={theme}>
      <MemoryRouter initialEntries={[at]}>
        <Routes>
          {[path ?? at].flat().map((pattern) => (
            <Route key={pattern} path={pattern} element={children} />
          ))}
          <Route path="*" element={null} />
        </Routes>
        <LocationDisplay />
      </MemoryRouter>
    </ChakraProvider>
  )
  return render(ui, { wrapper: Wrapper })
}

/** The router's current pathname, from `renderSyndicates`. */
export const currentPath = () => document.querySelector('[data-testid="location"]').textContent
