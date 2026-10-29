import { Constants } from 'shared/util/constants'
import { WaxLevelOffer, WaxPointsOffer } from 'store/wax/types'

import { getTablePage, getTableRows } from './tables'

/**
 * Reads from the user points contract (uspts.worlds). Ported from Overmind's `wax.api`
 * (`getLevelOffers`, `getPointsOffers`).
 */

const userPointsTable = (table: string) => ({
  table,
  scope: Constants.CONTRACT_USER_POINTS,
  code: Constants.CONTRACT_USER_POINTS,
})

/** The level-reward NFTs. */
export const getLevelOffers = (): Promise<WaxLevelOffer[] | null> =>
  getTableRows<WaxLevelOffer>({
    ...userPointsTable(Constants.CONTRACT_TABLE_LEVELOFFERS),
    limit: 100,
  })

const POINTS_OFFERS_PAGE_SIZE = 500

/** Every AW NFT offer, newest first, read page by page. `null` if there are none. */
export const getPointsOffers = async (): Promise<WaxPointsOffer[] | null> => {
  const readPage = (upperBound: string | null) =>
    getTablePage<WaxPointsOffer>({
      ...userPointsTable(Constants.CONTRACT_TABLE_POINTOFFERS),
      key_type: '',
      limit: POINTS_OFFERS_PAGE_SIZE,
      reverse: true,
      ...(upperBound != null && { upper_bound: String(upperBound) }),
    })

  let page = await readPage(null)
  const offers = [...page.rows]
  while (page.more) {
    page = await readPage(page.next_key)
    offers.push(...page.rows)
  }
  return offers.length ? offers : null
}
