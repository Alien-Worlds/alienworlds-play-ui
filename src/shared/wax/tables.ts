import { JsonRpc } from 'eosjs'
import { config } from 'shared/util/config'
import { WaxQuery } from 'store/wax/types'

/**
 * Reads rows from a contract table. Same endpoint Overmind's `wax.api` table reads use
 * (`config.WaxFetchApiUrl`), without needing a wallet session.
 */
export const getTableRows = async <T>(query: WaxQuery): Promise<T[] | null> => {
  const rpc = new JsonRpc(config.WaxFetchApiUrl, { fetch })
  const result = await rpc.get_table_rows(query)
  return (result?.rows as T[]) ?? null
}
