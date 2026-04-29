import { LightIcon, LightIcon2, MiningIcon, NFTOldIcon, ProfitsIcon } from '@alien-worlds/icons'
import { Box, Flex, HStack, Icon, Text } from '@chakra-ui/react'
import { PlanetImage } from 'features/mining/components/PlanetLand/Components/PlanetImage'
import { PlanetTitle } from 'features/mining/components/PlanetLand/Components/PlanetTitle'
import { PlanetImageSizes } from 'features/mining/utils/planet'
import { ClaimMineRewardsBtn } from 'features/syndicates/components/PlanetaryActions/PlanetaryActions'
import { Colors } from 'shared/util/colors'
import { useAppState } from 'store'
import {
  calculateChargeTime,
  calculateMiningPower,
  calculateNftLuck,
  calculatePow,
} from 'store/main/helpers'

export const MiningMobileView = () => {
  const {
    wax: { planetSelectedForMining },
    atomic: { landAsset, bagAssets },
  } = useAppState()
  return (
    <Flex flexDirection="column" gap={6}>
      <Flex width="100%" justifyContent="space-around" gap={2}>
        <Flex minW="26%">
          <PlanetImage
            titleDisplay="none"
            showLandIndicator
            land={landAsset}
            dacId={planetSelectedForMining}
            imageSize={PlanetImageSizes.LARGE}
            justifyContent="flex-start"
          />
        </Flex>
        <Flex direction="column" gap={4} minW="74%" px="16px">
          <Flex width="100%" justifyContent="space-between" alignItems="center">
            <Box>
              <PlanetTitle land={landAsset} />
            </Box>
            <Box gap={2}>
              <HStack gap={2}>
                <ProfitsIcon color={Colors.SNOW_WHITE} style={{ width: '16px', height: '16px' }} />
                <Text fontFamily="orb" fontSize="12px" fontWeight={700}>
                  {landAsset?.mutable_data?.commission / 100}%
                </Text>
              </HStack>
              <HStack gap={2} mt={1}>
                <LightIcon2 color={Colors.SNOW_WHITE} style={{ width: '16px', height: '16px' }} />
                <Text fontFamily="orb" fontSize="12px" fontWeight={700}>
                  {landAsset?.data?.delay / 10}
                </Text>
              </HStack>
            </Box>
          </Flex>
          <ClaimMineRewardsBtn minWidth="100%" showIcon={false} />
        </Flex>
      </Flex>
      <Flex
        borderRadius="12px"
        backgroundColor={Colors.BLACK_NEUTRAL}
        p="16px"
        width="100%"
        flexDirection="column"
        gap={2}
      >
        {/* Charge Time*/}
        <Flex width="100%" justifyContent="space-between">
          <Flex alignItems="center" gap={1}>
            <LightIcon boxSize="16px" color={Colors.DODGE_BLUE} />
            <Text fontFamily="tlm" fontSize="12px" color={Colors.DODGE_BLUE} fontWeight={700}>
              Charge Time
            </Text>
          </Flex>
          <Text fontFamily="orb" color={Colors.SNOW_WHITE} fontSize="14px" fontWeight={700}>
            {calculateChargeTime(bagAssets, landAsset)}s
          </Text>
        </Flex>
        {/* Mining Power*/}
        <Flex width="100%" justifyContent="space-between">
          <Flex alignItems="center" gap={1}>
            <MiningIcon boxSize="16px" color={Colors.DI_SERRIA} />
            <Text fontFamily="tlm" fontSize="12px" color={Colors.DI_SERRIA} fontWeight={700}>
              Mining Power
            </Text>
          </Flex>
          <Text fontFamily="orb" color={Colors.SNOW_WHITE} fontSize="14px" fontWeight={700}>
            {calculateMiningPower(bagAssets, landAsset)}%
          </Text>
        </Flex>
        {/* Proof of Work*/}
        <Flex width="100%" justifyContent="space-between">
          <Flex alignItems="center" gap={1}>
            <Icon viewBox="0 0 20 20" boxSize="16px">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M4.16665 2.91666H15.8333C16.2936 2.91666 16.6666 3.28975 16.6666 3.74999V8.33332C16.6666 8.79356 16.2936 9.16666 15.8333 9.16666H4.16665C3.70641 9.16666 3.33331 8.79356 3.33331 8.33332V3.74999C3.33331 3.28975 3.70641 2.91666 4.16665 2.91666ZM2.08331 3.74999C2.08331 2.5994 3.01605 1.66666 4.16665 1.66666H15.8333C16.9839 1.66666 17.9166 2.5994 17.9166 3.74999V8.33332C17.9166 9.01482 17.5894 9.61989 17.0835 9.99999C17.5894 10.3801 17.9167 10.9852 17.9167 11.6667V16.25C17.9167 17.4006 16.9839 18.3333 15.8333 18.3333H4.16667C3.01607 18.3333 2.08333 17.4006 2.08333 16.25V11.6667C2.08333 10.9852 2.41056 10.3801 2.91646 10C2.41055 9.61991 2.08331 9.01483 2.08331 8.33332V3.74999ZM4.16667 10.8333H15.8333C16.2936 10.8333 16.6667 11.2064 16.6667 11.6667V16.25C16.6667 16.7102 16.2936 17.0833 15.8333 17.0833H4.16667C3.70643 17.0833 3.33333 16.7102 3.33333 16.25V11.6667C3.33333 11.2064 3.70643 10.8333 4.16667 10.8333Z"
                fill="#0ED4A8"
              />
            </Icon>
            <Text fontFamily="tlm" fontSize="12px" color={Colors.CARIBBEAN_GREEN} fontWeight={700}>
              Proof of Work
            </Text>
          </Flex>
          <Text fontFamily="orb" color={Colors.SNOW_WHITE} fontSize="14px" fontWeight={700}>
            {calculatePow(bagAssets, landAsset)}
          </Text>
        </Flex>
        {/* NFT Power*/}
        <Flex width="100%" justifyContent="space-between">
          <Flex alignItems="center" gap={1}>
            <NFTOldIcon boxSize="16px" color={Colors.WEB_ORANGE} />
            <Text fontFamily="tlm" fontSize="12px" color={Colors.WEB_ORANGE} fontWeight={700}>
              NFT Power
            </Text>
          </Flex>
          <Text fontFamily="orb" color={Colors.SNOW_WHITE} fontSize="14px" fontWeight={700}>
            {calculateNftLuck(bagAssets, landAsset)}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  )
}
