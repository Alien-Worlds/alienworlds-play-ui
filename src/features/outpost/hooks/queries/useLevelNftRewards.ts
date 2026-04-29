import { useMemo } from 'react'

import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { useLevelNftOffers } from 'features/outpost/hooks/queries/useLevelNftOffers'
import { useWalletDetails } from 'graphql/hooks/useWalletDetails'
import { WalletDetailsResponse } from 'graphql/types'
import { find, get } from 'lodash'
import { useAppState } from 'store'
import { WaxLevelOfferWithTemplate } from 'store/wax/types'

export const useLevelNftRewards = () => {
  const {
    wax: { walletId },
  } = useAppState()
  const { levelNftOffers } = useLevelNftOffers()
  const { walletDetails }: { walletDetails: WalletDetailsResponse; loading: boolean } =
    useWalletDetails(walletId)

  return useMemo(() => {
    let nextLevelReward: WaxLevelOfferWithTemplate

    // there is no offer to claim at the start at level 1
    let currentLevelReward: WaxLevelOfferWithTemplate = {
      id: 0,
      level: 1,
      required: 0,
      template_id: 0,
      asset: {} as IAsset,
    }

    if (walletDetails && levelNftOffers) {
      const currentLevel = get(walletDetails, 'userpoints_details.top_level', 0)
      if (currentLevel > 1) {
        currentLevelReward = find(levelNftOffers, (levelOffer) => levelOffer.level === currentLevel)
      }

      const nextLevel = get(walletDetails, 'userpoints_details.top_level', 0) + 1
      nextLevelReward = find(levelNftOffers, (levelOffer) => levelOffer.level === nextLevel)
    }

    return { currentLevelReward, nextLevelReward }
  }, [walletDetails, levelNftOffers])
}
