import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { useSessionStore } from 'shared/store/sessionStore'
import { getTemplatesByIds } from 'shared/util/atomicassets'
import { Constants } from 'shared/util/constants'
import { getTablePage } from 'shared/wax/tables'
import { PremintOffer, PremintOfferWithTemplate, WaxResponse } from 'store/wax/types'

const EMPTY_PAGE: WaxResponse<PremintOfferWithTemplate> = { rows: [], more: false, next_key: '' }

/**
 * Loads a page of community (premint) offers, newest first, each with its NFT template as
 * `asset`. Offers whose template can't be found are left out. Ported from Overmind's
 * `wax.loadPremintOffersAction`; fits `useWaxPagination`.
 */
export const loadPremintOffers = async ({
  lowerBound = null,
  fetchLimit = 20,
}: {
  lowerBound: number | string | null
  fetchLimit: number
}): Promise<WaxResponse<PremintOfferWithTemplate>> => {
  if (!useSessionStore.getState().isLoggedIn) return EMPTY_PAGE

  const page = await getTablePage<PremintOffer>({
    table: Constants.CONTRACT_TABLE_PREMINTOFFERS,
    scope: Constants.CONTRACT_USER_POINTS,
    code: Constants.CONTRACT_USER_POINTS,
    key_type: '',
    limit: fetchLimit,
    reverse: true,
    ...(lowerBound != null && { upper_bound: String(lowerBound) }),
  })
  if (!page.rows.length) return page as WaxResponse<PremintOfferWithTemplate>

  const templates = await getTemplatesByIds(page.rows.map((offer) => String(offer.template_id)))

  const rows = page.rows.reduce<PremintOfferWithTemplate[]>((offers, offer) => {
    const template = templates.find((t) => t.template_id === String(offer.template_id))
    if (template) {
      // The card reads the template as an asset (`asset.data.img`), as the Overmind loader did.
      const asset = { ...template, data: template.immutable_data } as unknown as IAsset
      offers.push({ ...offer, asset })
    } else {
      console.error(`Template ${offer.template_id} not found for points offer ${offer.offer_id}`)
    }
    return offers
  }, [])

  return { ...page, rows }
}
