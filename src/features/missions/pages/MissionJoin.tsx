import { useEffect, useState, VFC } from 'react'

import { BSCIcon, LockIcon, MissionCraftIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import {
  Box,
  chakra,
  Container,
  Flex,
  Icon,
  Input,
  Text,
  useBreakpointValue,
  useDisclosure,
} from '@chakra-ui/react'
import { GlossaryInfoIcon } from 'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon'
import { TooltipLocations } from 'features/glossary/utils/glossaryConst'
import { MissionMainTimer } from 'features/missions/components/MissionMainTimer'
import { NewsletterSubscribe } from 'features/missions/components/NewsletterSubscribe/NewsletterSubscribe'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import { AppModal } from 'shared/layouts'
import { Colors } from 'shared/util/colors'
import { formatNumber } from 'shared/util/numbers'
import { useActions, useAppState } from 'store'
import { PagePath } from 'store/main/types'
import { getMaxShipsToLease } from 'store/missions/helpers'
import { MissionType } from 'store/missions/types'

const MissionJoin: VFC = () => {
  const {
    main: { showMissionJoinPage },
    modal: { setPrimaryModalActive },
    missions: { joinMission, storeNewsletterWasShown, setMissionShipsCount },
  } = useActions()
  const {
    web3: { bscTlmBalance },
    missions: { selectedMission, newsletterWasShown, subscribedEmail },
  } = useAppState()

  const { id } = useParams()
  const navigate = useNavigate()
  const newsletterDisclosure = useDisclosure()
  const [shipsCount, setShipsCount] = useState<number>(0)
  const [maxShipsCount, setMaxShipsCount] = useState<number>(0)
  const responsiveButtonWidth = useBreakpointValue({ base: '100%', sm: '225px' })

  const trySetShips = (count: number) => {
    if (count > maxShipsCount) {
      setShipsCount(maxShipsCount)
      return
    }

    if (count < 0) {
      count = 0
    }

    setShipsCount(count)
  }

  const joinOpenMission = async () => {
    setMissionShipsCount(shipsCount)
    setPrimaryModalActive({ modalName: 'JoinMissionModal', value: true })
    await joinMission(shipsCount)
  }

  const joinMissionOrShowSubscriptionRequest = async () => {
    if (newsletterWasShown || subscribedEmail) {
      await joinOpenMission()
    } else {
      storeNewsletterWasShown()
      newsletterDisclosure.onOpen()
    }
  }

  useEffect(() => {
    showMissionJoinPage(id)
  }, [id])

  useEffect(() => {
    if (!selectedMission || !bscTlmBalance || bscTlmBalance === undefined) return

    const maxShipsToLease: number = getMaxShipsToLease(bscTlmBalance, selectedMission)
    setMaxShipsCount(maxShipsToLease)

    if (shipsCount > maxShipsToLease) {
      setShipsCount(maxShipsToLease)
    }
  }, [selectedMission?.view, bscTlmBalance])

  if (!selectedMission?.view) return <></>

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
          justifyContent={{ base: 'center', xl: 'start' }}
          pt={{ base: '0px', xl: '10px' }}
          pl={{ base: '0px', md: '0px', xl: '50px' }}
          direction={{ base: 'column', lg: 'row' }}
          alignItems={{ base: 'center', xl: 'start' }}
        >
          <Flex direction="column">
            <Flex display={{ base: 'none', xl: 'initial' }}>
              <MissionMainTimer />
            </Flex>
            <Text
              fontFamily="Orbitron"
              letterSpacing="6px"
              textAlign={{ base: 'center', xl: 'start' }}
              mt={{ base: '0px', md: '40px', xl: '0px' }}
              fontSize={{ base: '28px', md: '30px', xl: '36px' }}
              lineHeight={1}
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
                ml={3}
                textAlign={{ base: 'center', xl: 'start' }}
                fontFamily="orb"
                textTransform="none"
                fontWeight="normal"
              >
                {selectedMission.view.duration}
              </chakra.span>
            </Text>

            <Flex direction="column" pl={{ base: 0, md: '0px', xl: '100px' }}>
              <Flex
                color="#d9a555"
                fill="#d9a555"
                direction="column"
                fontSize="sm"
                align={{ base: 'center', xl: 'start' }}
                my={4}
              >
                <Flex
                  align="center"
                  color="#0ed4a8"
                  fill="#0ed4a8"
                  fontWeight="semibold"
                  flexWrap="wrap"
                  justify="center"
                >
                  <Text textAlign={{ base: 'center', xl: 'start' }}>
                    Your Trilium locked on this Mission
                  </Text>
                  <Box w={6} position="relative" mx={4}>
                    <Icon
                      as={LockIcon}
                      fontSize={20}
                      height="auto"
                      position="absolute"
                      left={3}
                      bottom={2}
                      zIndex={2}
                    />
                    <BSCIcon boxSize={25} />
                  </Box>
                  <Text fontSize="xl" fontWeight={400} fontFamily="orb">
                    {selectedMission.view.stakedTlm ?? '0.0'}
                  </Text>
                </Flex>
              </Flex>
              <Flex align="center" my={4} justifyContent={{ base: 'center', xl: 'start' }}>
                <Box mr={4}>
                  <MissionCraftIcon color={selectedMission.view.rarityColor} boxSize={40} />
                </Box>
                <Input
                  type="number"
                  inputMode="numeric"
                  fontFamily="Orbitron"
                  fontWeight="bold"
                  padding="5px"
                  fontSize="36px"
                  color="white"
                  borderColor="grey"
                  maxW="175px"
                  value={shipsCount}
                  border="1px solid"
                  onChange={(e) => {
                    trySetShips(Number(e.target.value))
                  }}
                />
              </Flex>
              <Flex
                my={4}
                align="center"
                gap="25px"
                justifyContent={{ base: 'center', xl: 'start' }}
              >
                <Button
                  size="sm"
                  variant="hydrogen"
                  width="55px"
                  height="55px"
                  minWidth="55px"
                  minHeight="55px"
                  borderWidth="2px"
                  borderColor="#e7384d"
                  color="#e7384d"
                  fontSize={40}
                  fontWeight="bold"
                  borderRadius="10px"
                  lineHeight={0}
                  onClick={() => {
                    trySetShips(shipsCount - 1)
                  }}
                >
                  -
                </Button>
                <Button
                  size="sm"
                  width="75px"
                  height="50px"
                  minWidth="75px"
                  color="white"
                  minHeight="50px"
                  variant="hydrogen"
                  fontFamily="Orbitron"
                  fontWeight="normal"
                  borderRadius="10px"
                  fontSize={22}
                  borderColor="transparent"
                  onClick={() => {
                    setShipsCount(maxShipsCount)
                  }}
                >
                  MAX
                </Button>
                <Button
                  size="sm"
                  variant="hydrogen"
                  width="55px"
                  height="55px"
                  minWidth="55px"
                  minHeight="55px"
                  borderWidth="2px"
                  borderColor="#0ed4a8"
                  color="#0ed4a8"
                  fontSize={40}
                  fontWeight="bold"
                  borderRadius="10px"
                  onClick={() => {
                    trySetShips(shipsCount + 1)
                  }}
                >
                  +
                </Button>
              </Flex>

              <Flex
                direction="column"
                gap="10px"
                pt="15px"
                align={{ base: 'center', xl: 'start' }}
                ml={{ base: 0, xl: '-50px' }}
                justifyContent={{ base: 'center', xl: 'start' }}
              >
                <Flex align="center" fontFamily="orb" flexWrap="wrap" justify="center">
                  <chakra.span
                    fontFamily="Orbitron"
                    marginRight="10px"
                    fontSize="26px"
                    color={selectedMission.view.rarityColor}
                    fontWeight="bold"
                  >
                    1
                  </chakra.span>
                  <Box mr={2}>
                    <MissionCraftIcon boxSize={30} color={selectedMission.view.rarityColor} />
                  </Box>
                  <chakra.span color={selectedMission.view.rarityColor}>spacecraft</chakra.span>
                  <chakra.span fontSize="32px" fontWeight="semibold" margin="-8px 10px 0">
                    =
                  </chakra.span>

                  <BSCIcon boxSize={30} color={Colors.DI_SERRIA} style={{ marginRight: 8 }} />

                  <chakra.span
                    fontFamily="orb"
                    marginRight="10px"
                    fontSize="22px"
                    fontWeight="bold"
                    letterSpacing="1px"
                    color={Colors.DI_SERRIA}
                  >
                    {formatNumber(selectedMission.attributes.spaceshipCost / 10000)} TLM
                  </chakra.span>
                </Flex>
                <Flex
                  justifyContent="center"
                  alignItems="center"
                  gap={1}
                  ml={{ base: 0, md: '0px', xl: '100px' }}
                >
                  <Text color={Colors.DUSTY_GRAY} fontSize="16px">
                    [
                    <chakra.span color={Colors.AMARANTH}>
                      {formatNumber(
                        (shipsCount * selectedMission.attributes.spaceshipCost) / 10000
                      )}
                    </chakra.span>
                    ] TLM to be locked
                  </Text>

                  <GlossaryInfoIcon
                    width={16}
                    height={16}
                    glossaryId={TooltipLocations.MISSIONS_INFO_TLM_LOCKED}
                  />
                </Flex>
              </Flex>

              <Flex
                mb={6}
                mt={8}
                gap={5}
                align="center"
                flexWrap="wrap"
                justify="center"
                ml={{ base: 0, xl: '-100px' }}
                w={{ base: '100%', lg: 'fit-content' }}
                direction={{ base: 'column-reverse', sm: 'row' }}
              >
                <Flex w={{ base: '100%', sm: 'fit-content' }}>
                  <Button
                    isFullWidth
                    size="lg"
                    borderColor="#e0e0e0"
                    color="#e0e0e0"
                    width={responsiveButtonWidth}
                    variant="hydrogen"
                    fontFamily="Orbitron"
                    fontSize={14}
                    backgroundColor="transparent"
                    _hover={{
                      backgroundColor: '#e0e0e0',
                      color: 'blackAlpha.800',
                    }}
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'auto' })
                      navigate(`${PagePath.Missions}/${selectedMission.id}`)
                    }}
                  >
                    CANCEL
                  </Button>
                </Flex>
                <Flex w={{ base: '100%', sm: 'fit-content' }}>
                  <Button
                    isFullWidth
                    marginRight="5px"
                    fontSize={18}
                    variant="negative"
                    width={responsiveButtonWidth}
                    size="lg"
                    disabled={shipsCount === 0}
                    cursor={shipsCount === 0 ? 'not-allowed' : 'pointer'}
                    onClick={() => {
                      joinMissionOrShowSubscriptionRequest()
                    }}
                  >
                    {selectedMission.attributes.investInfo?.totalStakeTLM > 0
                      ? 'Send additional spacecrafts'
                      : ' Start Mission'}
                  </Button>
                </Flex>
              </Flex>
            </Flex>

            <Text
              fontSize="14px"
              lineHeight="18px"
              maxW="475px"
              letterSpacing="2px"
              fontWeight={400}
              textAlign="center"
              pr={{ base: 0, xl: '0px', '2xl': '0px' }}
            >
              I understand I am locking up [
              <chakra.span color="#e7384d">
                {formatNumber((shipsCount * selectedMission.attributes.spaceshipCost) / 10000)}
              </chakra.span>
              ] TLM for the duration of this Mission [
              <chakra.span color="#0ed4a8">{selectedMission.view.duration}</chakra.span>] and I
              cannot retrieve it during this time. I understand the TLM rewards I receive upon its
              completion depend on how many spacecrafts went on the Mission.
            </Text>
          </Flex>
        </Flex>

        {/* @TODO: refactor to NewsletterModal */}
        <AppModal onClose={newsletterDisclosure.onClose} isOpen={newsletterDisclosure.isOpen}>
          <NewsletterSubscribe
            onClose={() => {
              newsletterDisclosure.onClose()
              joinOpenMission()
            }}
          />
        </AppModal>
      </Container>
    </motion.div>
  )
}

export { MissionJoin }
