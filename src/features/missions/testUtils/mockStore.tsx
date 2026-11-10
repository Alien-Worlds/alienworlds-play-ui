import React from 'react'

import { ChakraProvider } from '@chakra-ui/react'
import { render } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { theme } from 'shared/styles/theme'

// Stand-in for the Overmind `store` module, shared by missions tests. Point a test at it with:
//   jest.mock('store', () => jest.requireActual('features/missions/testUtils/mockStore').storeMock)
// then call `mockStore({ state, actions })` in the test (or a beforeEach). Namespaces not passed
// are empty objects, so components can destructure them.

type Namespaces = Record<string, Record<string, any>>

const NAMESPACES = ['missions', 'web3', 'main', 'wax']

const withNamespaces = (value: Namespaces = {}): Namespaces =>
  NAMESPACES.reduce((result, ns) => ({ ...result, [ns]: value[ns] ?? {} }), { ...value })

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
