import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  REDEEM_AW_OFFER_FAILED_ERROR_UI,
  REDEEM_AW_OFFER_NOT_ENOUGH_ERROR_API,
  REDEEM_AW_OFFER_NOT_ENOUGH_ERROR_UI,
  RedeemNftOfferParams,
} from 'features/outpost/hooks/mutations/useRedeemAWNftOffer'
import { includes } from 'lodash'
import { LOAD_USER_POINTS_QUERY_KEY } from 'shared/hooks/queries/wax/useLoadUserPoints'
import { useActions, useEffects } from 'store'
import { toastErrorMessage, toastMessage } from 'store/main/actions'
import { WaxUserPoints } from 'store/wax/types'

/**
 * Applies simple optimistic update by writing the data "we expect" directly to cache after submit.
 * We use hard `resetQueries` to start burst refetching
 * @see useAWNftOffers
 */
export const useRedeemCommunityNftOffer = () => {
  const queryClient = useQueryClient()
  const effects = useEffects()
  const {
    wax: { resetLastTransactionError },
  } = useActions()

  return useMutation({
    mutationFn: ({ offerId }: RedeemNftOfferParams) =>
      effects.wax.api.redeemCommunityNftOffer(offerId),
    onMutate: async ({ pointsRequired }: RedeemNftOfferParams) => {
      await queryClient.cancelQueries({ queryKey: [LOAD_USER_POINTS_QUERY_KEY] })
      // @TODO cancelQueries for community offers when they are migrated to RQ

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

      // @TODO invalidateQueries for community offers when they are migrated to RQ
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
