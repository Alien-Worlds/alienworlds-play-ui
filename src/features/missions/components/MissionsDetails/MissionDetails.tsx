import { useEffect } from 'react'

import { BSCIcon, BSCLockIcon, MissionCraftIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Box, chakra, Container, Flex, Image, Text } from '@chakra-ui/react'
import { GlossaryInfoIcon } from 'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon'
import { TooltipLocations } from 'features/glossary/utils/glossaryConst'
import { MissionMainTimer } from 'features/missions/components/MissionMainTimer/MissionMainTimer'
import { DetailsOnHover } from 'features/missions/pages/MissionsInventory'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'
import { PagePath } from 'store/main/types'
import { getMissionRarityIcon, getMissionSpacecrafts } from 'store/missions/helpers'
import { MissionStatus, MissionType } from 'store/missions/types'

const MotionImage = motion(Image)
const imageAnimation = {
  hidden: { opacity: 0, translateY: -50, rotateY: '45deg', scale: 1.1 },
  show: {
    opacity: 1,
    translateY: 0,
    rotateY: '0deg',
    scale: 1,
    transition: { duration: 0.7 },
  },
}

const MissionDetails = () => {
  const {
    main: { showMissionDetailsPage },
  } = useActions()
  const {
    web3: { userWallet },
    missions: { selectedMission },
  } = useAppState()

  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    showMissionDetailsPage(id)
  }, [id])

  if (!selectedMission?.view) return <></>

  const NavButtons = () => {
    return (
      <Flex
        mb={4}
        gridGap={6}
        flexWrap="wrap"
        alignItems="center"
        justifyContent="center"
        mt={{ base: '15px', md: '40px' }}
        w={{ base: 'min-content', lg: '100%' }}
        direction={{ base: 'column-reverse', xl: 'row' }}
      >
        <Button
          size="lg"
          fontSize={18}
          variant="hydrogen"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'auto' })
            navigate(PagePath.Missions)
          }}
          borderColor={
            selectedMission.attributes.investInfo?.totalStakeTLM > 0 ? '#0ed4a8' : '#36c9ff'
          }
          color={selectedMission.attributes.investInfo?.totalStakeTLM > 0 ? '#0ed4a8' : '#36c9ff'}
        >
          Back to Missions
        </Button>

        <Button
          size="lg"
          fontSize={18}
          width="225px"
          disabled={!userWallet || selectedMission.view.status !== MissionStatus.Boarding}
          cursor={
            !userWallet || selectedMission.view.status !== MissionStatus.Boarding
              ? 'not-allowed'
              : 'pointer'
          }
          onClick={() => navigate(`${PagePath.Missions}/${selectedMission.id}/join`)}
          variant={selectedMission.view.status === MissionStatus.Boarding ? 'warning' : 'tertiary'}
        >
          {selectedMission.view.status === MissionStatus.Soon && 'Waiting to board...'}
          {selectedMission.view.status === MissionStatus.Completed && 'Mission has completed'}
          {selectedMission.view.status === MissionStatus.Departed && 'Mission departed'}
          {selectedMission.view.status === MissionStatus.Boarding &&
            selectedMission.attributes.investInfo?.totalStakeTLM > 0 &&
            'Send more spacecrafts'}
          {selectedMission.view.status === MissionStatus.Boarding &&
            !selectedMission.attributes.investInfo?.totalStakeTLM &&
            'Join Mission'}
        </Button>
      </Flex>
    )
  }

  return (
    <motion.div
      initial={{ translateY: -100, opacity: 0 }}
      animate={{ translateY: 0, opacity: 1 }}
      exit={{ translateY: 100, opacity: 0, transition: { duration: 0.15 } }}
      transition={{ duration: 0.3 }}
    >
      <Container maxW="1100px" w="full" pb={24}>
        <Flex
          gap="20px"
          color="white"
          justifyContent="center"
          pt={{ base: '0px', xl: '10px' }}
          direction={{ base: 'column', lg: 'row' }}
          alignItems={{ base: 'center', xl: 'start' }}
        >
          {/* LEFT SECTION */}
          <Flex direction="column">
            <Flex display={{ base: 'none', xl: 'initial' }}>
              <MissionMainTimer />
            </Flex>
            <Text
              mt={{ base: '0px', md: '40px', xl: '0px' }}
              fontFamily="Orbitron"
              letterSpacing="6px"
              fontSize={{ base: '28px', md: '30px', xl: '36px' }}
              lineHeight={1}
              textAlign={{ base: 'center', xl: 'start' }}
              mb={3}
              color={selectedMission.view.rarityColor}
            >
              {selectedMission.attributes.name}
            </Text>

            <Text
              textTransform="uppercase"
              fontWeight="bold"
              fontSize="xl"
              textAlign={{ base: 'center', xl: 'start' }}
              letterSpacing="4px"
              mb={1}
              color={selectedMission.view.rarityColor}
            >
              {MissionType[selectedMission.attributes.missionType]}
              <chakra.span
                fontSize="lg"
                color="white"
                textAlign={{ base: 'center', xl: 'start' }}
                ml={3}
                fontFamily="orb"
                textTransform="none"
                fontWeight="normal"
              >
                {selectedMission.view.duration}
              </chakra.span>
            </Text>

            <Text
              mb={6}
              color="white"
              textAlign={{ base: 'center', xl: 'start' }}
              lineHeight="tall"
              fontFamily="Titillium Web"
              fontWeight={300}
              fontSize="18px"
              maxW="600px"
            >
              {selectedMission.attributes.description}
            </Text>

            <Flex display={{ base: 'initial', xl: 'none' }} justifyContent="center">
              <MissionMainTimer />
            </Flex>

            <Flex
              textAlign="left"
              flexWrap="wrap"
              alignItems="center"
              justifyContent={{ base: 'center', xl: 'start' }}
            >
              <Box pr="10px">
                <BSCIcon
                  color={selectedMission.view.statusColor}
                  boxSize={30}
                  fill={selectedMission.view.statusColor}
                />
              </Box>
              <Text
                fontWeight={400}
                fontSize="3xl"
                mr={4}
                fontFamily="orb"
                color={selectedMission.view.statusColor}
              >
                {selectedMission.view.rewardPerShip} TLM
              </Text>
              <Text fontWeight="light" color="#959595" textAlign={{ base: 'center', xl: 'start' }}>
                Trilium reward per spacecraft
              </Text>
            </Flex>

            <Text
              mb={8}
              fontWeight="semibold"
              mt={{ base: 2, lg: '' }}
              color={Colors.RADICAL_RED}
              textAlign={{ base: 'center', xl: 'start' }}
            >
              Warning: rewards are shared between all sent spacecrafts
            </Text>

            <Flex
              alignItems="center"
              whiteSpace="nowrap"
              color="white"
              direction={{ base: 'column', xl: 'row' }}
            >
              <Box mr={3}>
                <MissionCraftIcon boxSize={30} color={selectedMission.view.rarityColor} />
              </Box>

              <Text fontFamily="Orbitron" fontWeight="light" mr={4}>
                {selectedMission.attributes.investInfo ? (
                  <>
                    <chakra.span color="#0ed4a8" fontSize="3xl">
                      {selectedMission.attributes.investInfo.numberOfShips}
                    </chakra.span>
                    <chakra.span color="#959595" mx={1} fontSize="3xl">
                      /
                    </chakra.span>
                    <chakra.span fontSize="3xl">
                      {getMissionSpacecrafts(selectedMission.attributes.totalShips)}
                    </chakra.span>
                  </>
                ) : (
                  <chakra.span fontSize="3xl" color={selectedMission.view.rarityColor}>
                    {getMissionSpacecrafts(selectedMission.attributes.totalShips)}
                  </chakra.span>
                )}
              </Text>
              <Text
                fontFamily="Titillium Web"
                fontWeight={300}
                whiteSpace="normal"
                color="white"
                fontSize={{ base: '16px', md: '18px', xl: '18px' }}
                textAlign={{ base: 'center', xl: 'start' }}
                lineHeight="none"
              >
                Total spacecrafts sent on this Mission
              </Text>
            </Flex>
            <Flex
              mt={8}
              w="100%"
              fontSize="sm"
              fill="#d9a555"
              color="#d9a555"
              direction="column"
              mb={{ base: 4, xl: 0 }}
              align={{ base: 'center', xl: 'start' }}
            >
              <Flex align="flex-end" direction="column">
                {selectedMission.view.stakedTlm && (
                  <Flex
                    gap="5px"
                    align="center"
                    flexWrap="wrap"
                    color={Colors.CARIBBEAN_GREEN}
                    justifyContent={{ base: 'center', xl: 'start' }}
                  >
                    <Flex align="center" gap="5px">
                      <GlossaryInfoIcon
                        width={16}
                        color={Colors.SNOW_WHITE}
                        glossaryId={TooltipLocations.MISSIONS_INFO_TLM_LOCKED}
                        mr={3}
                      />
                      <Text>Trilium locked on this Mission</Text>
                    </Flex>
                    <Flex align="center">
                      <Box w={6} mx={4} color={Colors.CARIBBEAN_GREEN}>
                        <BSCLockIcon boxSize={24} fill="transparent" />
                      </Box>
                      <Text fontSize="2xl" fontWeight={400} fontFamily="orb">
                        {selectedMission.view.stakedTlm ?? '0.0'}
                      </Text>
                    </Flex>
                  </Flex>
                )}
              </Flex>
            </Flex>
            {/* NAV BUTTONS */}
            <Flex display={{ base: 'none', lg: 'initial' }}>
              <NavButtons />
            </Flex>
          </Flex>

          {/* RIGHT SECTION */}
          <Flex direction="column" alignItems="center" w={{ base: 'full', md: 'unset' }}>
            <Flex alignItems="center" mb={4}>
              {getMissionRarityIcon(selectedMission.view.rarity)}
              <Text fontFamily="Titillium Web" fontWeight="bold" fontSize="3xl" ml="20px">
                <chakra.span color={selectedMission.view.rarityColor}>
                  {selectedMission.view.rarity}
                </chakra.span>{' '}
                NFT
              </Text>
            </Flex>
            <Box w={{ base: '240px', xl: '350px' }} position="relative">
              <MotionImage
                variants={imageAnimation}
                src={selectedMission.pinataNft.image}
                alt="Mission NFT reward"
                fallbackSrc="/images/alienworlds-missions-nft_placeholder.png"
                w="full"
                zIndex={1}
                position="relative"
                pointerEvents="none"
              />
              <DetailsOnHover asset={selectedMission.pinataNft} />
            </Box>

            {/* NAV BUTTONS */}
            <Flex display={{ base: 'initial', lg: 'none' }} mt={{ base: '25px', lg: 'none' }}>
              <NavButtons />
            </Flex>
          </Flex>
        </Flex>
      </Container>
    </motion.div>
  )
}

export { MissionDetails }
