import { useCallback, useEffect } from 'react'

import { MissionCraftIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import {
  Box,
  chakra,
  Flex,
  Modal,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Spinner,
  Text,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'
import { PagePath } from 'store/main/types'
import { MissionTypeIcon } from 'store/missions/helpers'
import { MissionType } from 'store/missions/types'

const AnimatedBox = motion(Box)

export const JoinMissionModal = () => {
  const {
    missions: { setJoinMissionStep },
    modal: { setPrimaryModalActive },
  } = useActions()
  const {
    modal: { primaryModals },
    missions: { joinMissionStep, selectedMission, missionShipsCount },
  } = useAppState()

  const navigate = useNavigate()

  const handleClose = useCallback(() => {
    setJoinMissionStep(null)
    setPrimaryModalActive({ modalName: 'JoinMissionModal', value: false })
  }, [setJoinMissionStep, setPrimaryModalActive])

  // Auto-close modal after successful mission join (step 3)
  useEffect(() => {
    if (joinMissionStep === 3) {
      const timer = setTimeout(() => {
        handleClose()
        navigate(PagePath.MissionsExplorer)
      }, 3000) // Close after 3 seconds

      return () => clearTimeout(timer)
    }
  }, [joinMissionStep, handleClose, navigate])

  const getTitle = () => {
    let title: string

    switch (joinMissionStep) {
      case 1:
        title = 'Joining Mission'
        break
      case 2:
        title = 'Joining Mission'
        break
      case 3:
        title = 'Mission Joined'
        break
      case 4:
        title = 'Mission not Joined'
        break
      default:
        break
    }
    return title
  }

  const getDescription = () => {
    let title: string

    switch (joinMissionStep) {
      case 1:
        title = 'Approving TLM spending for spacecrafts, please wait..'
        break
      case 2:
        title = 'Allocating spacecrafts to the Mission, please wait..'
        break
      case 3:
        title = 'spacecrafts you have sent:'
        break
      case 4:
        title = 'Mission failed to join'
        break
      default:
        break
    }
    return title
  }

  const getTextColor = () => {
    let color: string
    switch (joinMissionStep) {
      case 1:
        color = Colors.SNOW_WHITE
        break
      case 2:
        color = Colors.SNOW_WHITE
        break
      case 3:
        color = Colors.CARIBBEAN_GREEN
        break
      case 4:
        color = Colors.RADICAL_RED
        break

      default:
        break
    }
    return color
  }

  return (
    <Modal size="full" isOpen={primaryModals.JoinMissionModal} onClose={handleClose}>
      <ModalContent background={Colors.BLACK_SOLID_90}>
        <ModalCloseButton
          marginTop={{ base: 0, lg: 90 }}
          marginRight={{ base: 0, lg: 10 }}
          zIndex={2000}
        />
        <ModalBody>
          <AnimatedBox
            initial={{ opacity: 0, y: -255 }}
            animate={{ opacity: 1, y: -40 }}
            transition={{
              duration: 0.5,
              delay: 0.1,
              ease: [0, 0.71, 0.2, 1.01],
            }}
          >
            <Flex
              alignItems="center"
              justifyContent="center"
              paddingTop={{ base: '100px', lg: '10%' }}
            >
              <Flex direction="column" alignItems="center" textAlign="center">
                <Box mb={4}>
                  <MissionTypeIcon
                    type={selectedMission?.attributes?.missionType}
                    color={selectedMission?.view?.rarityColor}
                    boxSize={60}
                  />
                </Box>

                <Flex
                  pb="25px"
                  gap="10px"
                  direction="column"
                  textAlign="center"
                  alignItems="center"
                >
                  <Text
                    mt={2}
                    mb={1}
                    lineHeight={1}
                    fontSize="24px"
                    letterSpacing="6px"
                    fontFamily="Orbitron"
                    color={
                      joinMissionStep === 3
                        ? Colors.SNOW_WHITE
                        : joinMissionStep === 4
                        ? Colors.RADICAL_RED
                        : Colors.SNOW_WHITE
                    }
                  >
                    {getTitle()}
                  </Text>
                  <Flex h={3} w="100%" border="2px solid white">
                    <Flex
                      h={3}
                      w={`${(joinMissionStep ?? 1) * (100 / 3)}%`}
                      bg={
                        joinMissionStep === 4
                          ? Colors.RADICAL_RED
                          : selectedMission?.view?.rarityColor
                      }
                    />
                  </Flex>
                </Flex>

                <Text
                  fontFamily="Orbitron"
                  letterSpacing="6px"
                  fontSize="34px"
                  lineHeight={1}
                  color={selectedMission?.view?.rarityColor}
                  mb={1}
                  my={4}
                >
                  {selectedMission?.attributes?.name}
                </Text>
                <Text
                  textTransform="uppercase"
                  fontWeight="bold"
                  fontSize="22px"
                  letterSpacing="4px"
                  mb={2}
                  color={selectedMission?.view?.rarityColor}
                >
                  {MissionType[selectedMission?.attributes?.missionType]}
                  <chakra.span
                    fontSize="22px"
                    color="white"
                    ml={3}
                    textTransform="none"
                    fontWeight="normal"
                    fontFamily="orb"
                  >
                    {selectedMission?.view?.duration}
                  </chakra.span>
                </Text>
                <Flex align="center">
                  <Text
                    fontFamily="Titillium Web"
                    color={
                      joinMissionStep === 3
                        ? Colors.CARIBBEAN_GREEN
                        : joinMissionStep === 4
                        ? Colors.RADICAL_RED
                        : Colors.SNOW_WHITE
                    }
                    fontSize="22px"
                    fontWeight={300}
                    mt={6}
                    mb={3}
                  >
                    {getDescription()}
                  </Text>
                  {(joinMissionStep === 1 || joinMissionStep === 2) && (
                    <Spinner ml="5px" size="md" />
                  )}
                </Flex>
                <Flex align="center" mb={2}>
                  <Box mr={4}>
                    <MissionCraftIcon boxSize={50} color={Colors.SNOW_WHITE} />
                  </Box>
                  {joinMissionStep !== 4 && (
                    <Text
                      fontFamily="Orbitron"
                      fontWeight="bold"
                      fontSize="44px"
                      color={getTextColor()}
                    >
                      {missionShipsCount ?? 0}
                    </Text>
                  )}
                </Flex>

                {(joinMissionStep === 3 || joinMissionStep === 4) && (
                  <Flex
                    flexWrap="wrap"
                    justify="center"
                    align="center"
                    mt={12}
                    mb={6}
                    sx={{ gap: '20px' }}
                  >
                    <Flex w={{ base: '100%', md: 'fit-content' }}>
                      <Button
                        variant="hydrogen"
                        fontFamily="Orbitron"
                        size="lg"
                        isFullWidth
                        fontSize={16}
                        onClick={() => {
                          handleClose()
                          navigate(PagePath.MissionsExplorer)
                        }}
                      >
                        My Missions
                      </Button>
                    </Flex>
                    <Flex w={{ base: '100%', md: 'fit-content' }}>
                      <Button
                        variant="hydrogen"
                        fontFamily="Orbitron"
                        size="lg"
                        isFullWidth
                        fontSize={16}
                        onClick={() => {
                          handleClose()
                          navigate(PagePath.Missions)
                        }}
                      >
                        Missions Centre
                      </Button>
                    </Flex>
                  </Flex>
                )}
              </Flex>
            </Flex>
          </AnimatedBox>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
