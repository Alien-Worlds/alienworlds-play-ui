import { FC, useMemo, memo } from 'react'

import { Box, Divider, Flex } from '@chakra-ui/react'
import {
  UserPointsOffer,
  UserPointsOfferType,
} from 'features/outpost/components/UserPointsOffer/UserPointsOffer'
import { useAWNftOffers } from 'features/outpost/hooks/queries/useAWNftOffers'
import { ShowRedeemModal } from 'features/outpost/types/nftOutpostTypes'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner'
import { map } from 'lodash'
import { isCurrentOffer, isUpcomingOffer } from 'shared/util/helpers'
import { WaxPointsOfferWithTemplate } from 'store/wax/types'

interface AWNftOffersProps {
  showRedeemModal: ShowRedeemModal
}

const AWNftOffers: FC<AWNftOffersProps> = memo(({ showRedeemModal }) => {
  const { pointsOffers, isLoading } = useAWNftOffers()
  const currentOffers: WaxPointsOfferWithTemplate[] = useMemo(
    () => (pointsOffers ? pointsOffers.filter(isCurrentOffer) : []),
    [pointsOffers]
  )
  const upcomingOffers: WaxPointsOfferWithTemplate[] = useMemo(
    () => (pointsOffers ? pointsOffers.filter(isUpcomingOffer) : []),
    [pointsOffers]
  )

  if (isLoading) {
    return <LoadingSpinner inline />
  }
  return (
    <>
      <Box mt={4}>
        <Flex flexWrap="wrap" justifyContent="space-evenly" rowGap="75px" columnGap="25px">
          {map(currentOffers, (pointsOffer) => (
            <UserPointsOffer
              key={pointsOffer.id}
              pointsOffer={pointsOffer}
              redeem={showRedeemModal}
              type={UserPointsOfferType.CURRENT}
            />
          ))}
        </Flex>
      </Box>

      {upcomingOffers && upcomingOffers.length > 0 && (
        <>
          <Divider my={14} />
          <Box>
            <Flex flexWrap="wrap" justifyContent="space-evenly" rowGap="75px" columnGap="25px">
              {map(upcomingOffers, (pointsOffer) => (
                <UserPointsOffer
                  key={pointsOffer.id}
                  pointsOffer={pointsOffer}
                  redeem={showRedeemModal}
                  type={UserPointsOfferType.UPCOMING}
                />
              ))}
            </Flex>
          </Box>
        </>
      )}
    </>
  )
})

export { AWNftOffers }
