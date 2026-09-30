import { createOvermindMock } from 'overmind'
import { namespaced } from 'overmind/config'
import * as atomic from 'store/atomic'

// Runs the real `atomic` namespace against stub `wax`/`main` state. Loading the full store config
// would pull in the Wharf wallet plugins, which don't run under jsdom.
//
// Tests that use this must also mock `routes`, since atomic actions read the current path from
// `router.state.location.pathname`:
//   jest.mock('routes', () => ({ router: { state: { location: { pathname: '/inventory' } } } }))
export const createAtomicMock = (
  mutateState: (state: any) => void = () => {},
  wax: Record<string, unknown> = {}
) => {
  const config = namespaced({
    atomic,
    wax: { state: { isLoggedIn: true, ...wax } },
    main: { state: {} },
  })
  const overmind = createOvermindMock(config as any, {}, mutateState)

  return {
    state: overmind.state as any,
    actions: (overmind.actions as any).atomic,
  }
}
