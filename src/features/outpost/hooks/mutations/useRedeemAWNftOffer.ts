import { useMutation, useQueryClient } from '@tanstack/react-query'
import { includes } from 'lodash'
import { LOAD_AW_NFT_OFFERS_QUERY_KEY } from 'shared/hooks/queries/wax/useLoadAWNftOffers'
import { LOAD_USER_POINTS_QUERY_KEY } from 'shared/hooks/queries/wax/useLoadUserPoints'
import { useActions, useEffects } from 'store'
import { toastErrorMessage, toastMessage } from 'store/main/actions'
import { WaxUserPoints } from 'store/wax/types'

export type RedeemNftOfferParams = {
  offerId: number
  pointsRequired: number
}

export const REDEEM_AW_OFFER_NOT_ENOUGH_ERROR_API = 'Not enough points available'
export const REDEEM_AW_OFFER_NOT_ENOUGH_ERROR_UI = 'Not enough shards'
export const REDEEM_AW_OFFER_FAILED_ERROR_UI = 'Fuse failed'

/**
 * Applies simple optimistic update by writing the data "we expect" directly to cache after submit.
 * We use hard `resetQueries` to start burst refetching
 * @see useAWNftOffers
 */
export const useRedeemAWNftOffer = () => {
  const queryClient = useQueryClient()
  const effects = useEffects()
  const {
    wax: { resetLastTransactionError },
  } = useActions()

  return useMutation({
    mutationFn: ({ offerId }: RedeemNftOfferParams) => effects.wax.api.redeemAWNftOffer(offerId),
    onMutate: async ({ pointsRequired }: RedeemNftOfferParams) => {
      await queryClient.cancelQueries({ queryKey: [LOAD_USER_POINTS_QUERY_KEY] })
      await queryClient.cancelQueries({ queryKey: [LOAD_AW_NFT_OFFERS_QUERY_KEY] })
      return { pointsRequired }
    },
    onSuccess: async (data, variables, { pointsRequired }) => {
      toastMessage('Fuse success')

      await queryClient.resetQueries([LOAD_USER_POINTS_QUERY_KEY])

      queryClient.setQueryData([LOAD_USER_POINTS_QUERY_KEY], (oldData: WaxUserPoints) => {
        if (oldData) {
          const diff = oldData?.redeemable_points - pointsRequired
          return { ...oldData, redeemable_points: diff }
        }
        return oldData
      })

      await queryClient.invalidateQueries([LOAD_AW_NFT_OFFERS_QUERY_KEY])
    },
    onError: (error) => {
      let errorMessage = REDEEM_AW_OFFER_FAILED_ERROR_UI
      const errorMessageApi = error?.toString()

      if (errorMessageApi && includes(errorMessageApi, REDEEM_AW_OFFER_NOT_ENOUGH_ERROR_API)) {
        errorMessage = REDEEM_AW_OFFER_NOT_ENOUGH_ERROR_UI
      }

      toastErrorMessage(errorMessage)

      resetLastTransactionError()
    },
  })
}
