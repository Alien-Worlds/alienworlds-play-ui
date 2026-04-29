import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LOAD_USER_POINTS_QUERY_KEY } from 'shared/hooks/queries/wax/useLoadUserPoints'
import { useActions, useEffects } from 'store'
import { toastErrorMessage, toastMessage } from 'store/main/actions'

export type RedeemLevelOfferParams = {
  levelOfferId: number
}

export const useRedeemLevelNftOffer = () => {
  const queryClient = useQueryClient()
  const effects = useEffects()
  const {
    wax: { resetLastTransactionError },
  } = useActions()

  return useMutation({
    mutationFn: ({ levelOfferId }: RedeemLevelOfferParams) =>
      effects.wax.api.redeemLevelOffer(levelOfferId),
    onSuccess: async () => {
      toastMessage('Rank Status Updated and NFT Successfully Claimed')

      queryClient.resetQueries([LOAD_USER_POINTS_QUERY_KEY])
    },
    onError: () => {
      toastErrorMessage('Rank Status failed to Update and NFT failed to Claim')
      resetLastTransactionError()
    },
  })
}
