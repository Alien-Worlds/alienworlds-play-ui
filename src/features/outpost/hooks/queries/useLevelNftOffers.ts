import { useMemo } from 'react'

import { join, map } from 'lodash'
import { useGetTemplatesByIds } from 'shared/hooks/queries/atomic/useGetTemplatesByIds'
import { useLoadLevelNftOffers } from 'shared/hooks/queries/wax/useLoadLevelNftOffers'
import { matchOffersAndTemplatesFromWax } from 'store/wax/helpers'
import { WaxLevelOfferWithTemplate } from 'store/wax/types'

export const useLevelNftOffers = () => {
  const { data: filteredOffers, isInitialLoading: isNftOffersLoading } = useLoadLevelNftOffers()

  const preparedTemplateIdsMemo = useMemo(() => {
    let preparedTemplateIds = ''

    if (filteredOffers?.length) {
      preparedTemplateIds = join(
        map(filteredOffers, (offerItem) => offerItem.template_id),
        ','
      )
    }

    return preparedTemplateIds
  }, [filteredOffers])

  const { data: templatesFromWax = [], isInitialLoading: isTemplatesByIdLoading } =
    useGetTemplatesByIds(preparedTemplateIdsMemo)

  const offersWithTemplatesMemo = useMemo(() => {
    let offersWithTemplates: WaxLevelOfferWithTemplate[] = []

    if (templatesFromWax?.length) {
      // map respective NFT data to asset field
      offersWithTemplates = matchOffersAndTemplatesFromWax<WaxLevelOfferWithTemplate>(
        filteredOffers,
        templatesFromWax
      )
    }

    return offersWithTemplates
  }, [filteredOffers, templatesFromWax])

  return {
    levelNftOffers: offersWithTemplatesMemo,
    isLoading: isNftOffersLoading || isTemplatesByIdLoading,
  }
}
