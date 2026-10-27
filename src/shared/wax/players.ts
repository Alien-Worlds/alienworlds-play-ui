import { Constants } from 'shared/util/constants'
import { WaxPlayer } from 'store/wax/types'

import { getTableRows } from './tables'

/**
 * Reads a player's row (tag, avatar) from federation's players table. Ported from Overmind's
 * `wax.api.getPlayer`; unlike it, works without a logged-in wallet.
 */
export const getPlayer = async (walletId: string): Promise<WaxPlayer | null> => {
  if (!walletId) return null

  const rows = await getTableRows<WaxPlayer>({
    table: Constants.CONTRACT_TABLE_PLAYERS,
    scope: Constants.CONTRACT_FEDERATION,
    code: Constants.CONTRACT_FEDERATION,
    upper_bound: walletId,
    lower_bound: walletId,
    limit: 10,
  })
  return rows?.[0] ?? null
}
