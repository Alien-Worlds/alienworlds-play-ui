import { AnyAction, TransactResult } from '@wharfkit/session'
import { useSessionStore } from 'shared/store/sessionStore'

const TRANSACT_OPTIONS = { blocksBehind: 3, expireSeconds: 1200 }

/**
 * Signs and broadcasts `actions` with the current Wharf session from `sessionStore`.
 * Unlike Overmind's `effects.wax.api.executeTransactWharf`, failures are thrown to the caller
 * instead of being written to `state.wax.lastTransactionError`.
 */
export const transact = async (actions: AnyAction[]): Promise<TransactResult> => {
  let session: any = useSessionStore.getState().currentSession
  // Some login paths store the Wharf `LoginResult` ({ session }) rather than the session itself.
  if (session?.session) session = session.session
  if (!session) throw new Error('No active wallet session. Please log in again.')

  return session.transact({ actions }, TRANSACT_OPTIONS)
}
