import { StackingIcon } from '@alien-worlds/icons'
import { Box, Flex, Text } from '@chakra-ui/react'
import { NFTCardOverlayRender } from 'features/inventory/utils/NFTCardOverlayRender'
import { LandImage } from 'features/mining/components/LandOwners/Components/LandImage/LandImage'
import { Colors } from 'shared/util/colors'
import { formatLandRating } from 'shared/util/helpers'
import { useAppState } from 'store'

import { Constants } from '../../../../../../shared/util/constants'

const LandInfo = () => {
  const {
    wax: { managingLandDetails: landAsset, nftLandCardProperties },
  } = useAppState()
  const LandBasicDetails = () => {
    return (
      <Flex flexDirection="column" fontFamily="orb">
        <Flex
          justifyContent="flex-start"
          fontSize={20}
          color={Colors.SNOW_WHITE}
          fontFamily="tlm"
          alignItems="center"
        >
          ({`${landAsset?.data?.x}:${landAsset?.data?.y}`}
          <StackingIcon />)
        </Flex>
        <Text fontSize={26} fontWeight={700} mt={2}>
          {landAsset?.name.split(' on ')[0]}
        </Text>
        <Text fontSize={21} fontWeight={400}>
          {landAsset?.name.split(' on ')[1]}
        </Text>
        <Text fontSize={30} fontWeight={600} color={Colors.CARIBBEAN_GREEN} mt={5}>
          {formatLandRating(
            landAsset?.data?.landrating
              ? landAsset?.data?.landrating
              : Constants.DEFAULT_LAND_RATING
          )}
        </Text>
        <Text fontSize={18} fontWeight={600} fontFamily="tlm">
          Land Rating
        </Text>
        <Text fontSize={18} fontWeight={400} fontFamily="tlm" color={Colors.WEB_ORANGE} mt={5}>
          {landAsset?.owner}
        </Text>
      </Flex>
    )
  }
  return (
    <Flex flexDirection="row" flexWrap="wrap" w="full" gap={2}>
      <Flex flexDirection="row" flex="1 0 300px" gap={5} alignItems="center">
        <Box w="50%">
          <LandImage landAsset={landAsset} showPlanetIndicator />
        </Box>
        <Box w="50%">
          <LandBasicDetails />
        </Box>
      </Flex>

      <Flex flex="1 0 150px" fontSize="18px" fontWeight={500}>
        <NFTCardOverlayRender asset={nftLandCardProperties} isNFTCard={false} />
      </Flex>
    </Flex>
  )
}

export { LandInfo }
