import { useMemo } from 'react'

import { filter, join, map } from 'lodash'
import { useGetTemplatesByIds } from 'shared/hooks/queries/atomic/useGetTemplatesByIds'
import { useLoadAWNftOffers } from 'shared/hooks/queries/wax/useLoadAWNftOffers'
import { isCurrentOffer, isUpcomingOffer } from 'shared/util/helpers'
import { matchOffersAndTemplatesFromWax } from 'store/wax/helpers'
import { WaxPointsOffer, WaxPointsOfferWithTemplate } from 'store/wax/types'

export const useAWNftOffers = () => {
  const { data: pointsOffers, isInitialLoading: isNftOffersLoading } = useLoadAWNftOffers()

  const filteredOffersMemo = useMemo(() => {
    let filteredOffers: Array<WaxPointsOffer> = []
    const currentOffers = filter(pointsOffers, isCurrentOffer)
    const upcomingOffers = filter(pointsOffers, isUpcomingOffer)

    filteredOffers = [...currentOffers, ...upcomingOffers]

    return filteredOffers
  }, [pointsOffers])

  const preparedTemplateIdsMemo = useMemo(() => {
    let preparedTemplateIds = ''

    if (pointsOffers?.length) {
      preparedTemplateIds = join(
        map(filteredOffersMemo, (offerItem) => offerItem.template_id),
        ','
      )
    }

    return preparedTemplateIds
  }, [pointsOffers, filteredOffersMemo])

  const { data: templatesFromWax = [], isInitialLoading: isTemplatesByIdLoading } =
    useGetTemplatesByIds(preparedTemplateIdsMemo)

  const offersWithTemplatesMemo = useMemo(() => {
    let offersWithTemplates: WaxPointsOfferWithTemplate[] = []

    if (templatesFromWax?.length) {
      // map respective NFT data to asset field
      offersWithTemplates = matchOffersAndTemplatesFromWax<WaxPointsOfferWithTemplate>(
        filteredOffersMemo,
        templatesFromWax
      )
    }

    return offersWithTemplates
  }, [filteredOffersMemo, templatesFromWax])

  return {
    pointsOffers: offersWithTemplatesMemo,
    isLoading: isNftOffersLoading || isTemplatesByIdLoading,
  }
}
