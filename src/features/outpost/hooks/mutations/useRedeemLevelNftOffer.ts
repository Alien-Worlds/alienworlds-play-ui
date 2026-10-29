import { useMutation, useQueryClient } from '@tanstack/react-query'
import { redeemLevelOffer } from 'features/outpost/utils/redeemOffers'
import { LOAD_USER_POINTS_QUERY_KEY } from 'shared/hooks/queries/wax/queryKeys'
import { toastErrorMessage, toastMessage } from 'shared/util/toast'

export type RedeemLevelOfferParams = {
  levelOfferId: number
}

export const useRedeemLevelNftOffer = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ levelOfferId }: RedeemLevelOfferParams) => redeemLevelOffer(levelOfferId),
    onSuccess: async () => {
      toastMessage('Rank Status Updated and NFT Successfully Claimed')

      queryClient.resetQueries([LOAD_USER_POINTS_QUERY_KEY])
    },
    onError: () => {
      toastErrorMessage('Rank Status failed to Update and NFT failed to Claim')
    },
  })
}
