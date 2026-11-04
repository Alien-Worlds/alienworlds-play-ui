import { JsonRpc } from 'eosjs'
import { config } from 'shared/util/config'
import { WaxQuery, WaxResponse } from 'store/wax/types'

const readTable = (query: WaxQuery) =>
  new JsonRpc(config.WaxFetchApiUrl, { fetch }).get_table_rows(query)

/**
 * Reads rows from a contract table. Same endpoint Overmind's `wax.api` table reads use
 * (`config.WaxFetchApiUrl`), without needing a wallet session.
 */
export const getTableRows = async <T>(query: WaxQuery): Promise<T[] | null> => {
  const result = await readTable(query)
  return (result?.rows as T[]) ?? null
}

/** Reads one page of a contract table, with `more` and `next_key` for the next page. */
export const getTablePage = async <T>(query: WaxQuery): Promise<WaxResponse<T>> => {
  const result = await readTable(query)
  return { rows: result?.rows ?? [], more: result?.more ?? false, next_key: result?.next_key ?? '' }
}
