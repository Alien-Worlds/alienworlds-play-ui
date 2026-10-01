import { RarityPoolsResponse } from 'features/mining/types/RarityPoolTypes'
import { Constants } from 'shared/util/constants'
import { getTableRows } from 'shared/wax/tables'
import { WaxShine } from 'store/wax/types'

// Mining's contract table reads. Ported from Overmind's `wax.api` (getShineInfo, getRarityPools).

/** What shining a template costs, how many copies it takes, and the template it becomes. */
export const getShineInfo = async (templateId: string): Promise<WaxShine | null> => {
  if (!templateId) return null
  const rows = await getTableRows<WaxShine>({
    table: Constants.CONTRACT_TABLE_LOOKUPS,
    scope: Constants.CONTRACT_S_FEDERATION,
    code: Constants.CONTRACT_S_FEDERATION,
    upper_bound: templateId,
    lower_bound: templateId,
    index_position: 1,
    show_payer: false,
    reverse: false,
    key_type: ' ',
    json: true,
    limit: 1,
  })
  return rows?.[0] ?? null
}

/** A planet's rarity pools; `dacTreasuryAccount` is the planet's treasury, e.g. "eyeke.world". */
export const getRarityPools = async (
  dacTreasuryAccount: string
): Promise<RarityPoolsResponse | null> => {
  const rows = await getTableRows<RarityPoolsResponse>({
    table: Constants.CONTRACT_TABLE_POOLS,
    code: Constants.CONTRACT_M_FEDERATION,
    scope: dacTreasuryAccount,
    limit: 1,
  })
  return rows?.[0] ?? null
}
