import { useEffect, VFC } from 'react'

import { BSCIcon } from '@alien-worlds/icons'
import { Box, Button, Center, chakra, Flex, Image, Spinner, Text } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'
import { getMissionRarityIcon, MissionTypeIcon } from 'store/missions/helpers'
import { Mission, MissionType } from 'store/missions/types'

const ClaimRewards: VFC<{ onClose: () => void; mission: Mission }> = ({ onClose, mission }) => {
  const {
    missions: { missionRewards, missionRewardsLoading },
  } = useAppState()

  const {
    missions: { loadMissionRewards, claimMissionRewards },
  } = useActions()

  const claimRewards = async () => {
    const isSuccess = await claimMissionRewards(mission.id)
    if (isSuccess) {
      onClose()
    }
  }

  useEffect(() => {
    loadMissionRewards(mission.id)
  }, [mission])

  return (
    <Center minH="80vh" id="missions-claim-rewards">
      <Flex direction="column" align="center" color="white" textAlign="center" w="full">
        <Box mb={6}>
          <MissionTypeIcon
            type={mission.attributes.missionType}
            color={mission.view.rarityColor}
            boxSize={80}
          />
        </Box>
        <Text fontSize="24px" fontFamily="Orbitron" letterSpacing="0.1em" fontWeight={300} mb={4}>
          {mission.attributes.name}
        </Text>
        <Text
          fontFamily="Titillium Web"
          fontSize="22px"
          fontWeight="bold"
          textTransform="uppercase"
          letterSpacing="0.1em"
          mb={12}
          color={mission.view.rarityColor}
        >
          {MissionType[mission.attributes.missionType]}
        </Text>
        {missionRewardsLoading && (
          <Center w="full">
            <Spinner size="xl" />
          </Center>
        )}
        {!missionRewardsLoading && missionRewards && (
          <Flex align="center" flexWrap="wrap" sx={{ gap: '25px' }} justify="center">
            <Flex align="center">
              <BSCIcon boxSize={40} color={Colors.DI_SERRIA} style={{ marginRight: 16 }} />

              <Text fontSize="40px" fontFamily="Titillium Web">
                {missionRewards.tlm}
              </Text>
            </Flex>

            {missionRewards.nft && (
              <Flex align="center">
                {getMissionRarityIcon(mission.view.rarity)}
                <Text ml={4} fontFamily="Titillium Web" fontWeight="bold" fontSize="24px">
                  {missionRewards.nft}x
                  <chakra.span color={mission.view.rarityColor}> Rarity</chakra.span> NFT
                </Text>
                <Image
                  ml={4}
                  maxW="100px"
                  src={mission.pinataNft.image}
                  alt="NFT prize"
                  fallbackSrc="/images/alienworlds-missions-nft_placeholder.png"
                />
              </Flex>
            )}
          </Flex>
        )}
        <Flex sx={{ gap: '15px' }} mt={12}>
          {!missionRewardsLoading && missionRewards && (
            <Button
              isLoading={missionRewardsLoading}
              onClick={() => {
                claimRewards()
              }}
              size="lg"
              borderColor="#0ed4a8"
              color="gray.800"
              letterSpacing="2px"
              variant="outline"
              fontFamily="Orbitron"
              fontWeight="thin"
              px={4}
              py={1}
              borderRadius={10}
              fontSize="24px"
              backgroundColor="#0ed4a8"
              transition="all 0.3s ease-out 0s"
              _hover={{ backgroundColor: '#0ed4a8', transform: 'scale(0.92)' }}
              _active={{ backgroundColor: '#0ed4a8' }}
            >
              Claim Rewards
            </Button>
          )}
          <Button
            onClick={onClose}
            size="lg"
            borderColor="#e0e0e0"
            color="#e0e0e0"
            letterSpacing="2px"
            variant="outline"
            fontFamily="Orbitron"
            fontWeight="thin"
            px={4}
            py={1}
            borderRadius={10}
            borderWidth="2px"
            fontSize="24px"
            backgroundColor="transparent"
            transition="all 0.3s ease-out 0s"
            _hover={{
              backgroundColor: '#e0e0e0',
              color: 'blackAlpha.800',
              transform: 'scale(0.92)',
            }}
            _active={{ backgroundColor: '#e0e0e0', color: 'blackAlpha.800' }}
          >
            Return
          </Button>
        </Flex>
      </Flex>
    </Center>
  )
}

export { ClaimRewards }
