import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { Button, BUTTON_SIZE } from '@alien-worlds/uikit'
import {
  Box,
  Divider,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  Text,
  VStack,
  Flex,
  useBreakpointValue,
} from '@chakra-ui/react'
import styled from '@emotion/styled/macro'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { ErrorTypes } from 'features/syndicates/types/governanceTypes'
import { motion } from 'framer-motion'
import { useDaoDetails } from 'graphql/hooks/useDaoDetails'
import { useWalletDaoDetails } from 'graphql/hooks/useWalletDaoDetails'
import { DaoDetailsResponse, DaoWalletDetailsResponse } from 'graphql/types'
import { capitalize, get, replace, startCase, toNumber } from 'lodash'
import { Colors } from 'shared/util/colors'
import {
  convertPlanetIdToName,
  DateInUTC,
  PrepareDacTokenAmountWithPrecision,
  TimeInUTC,
} from 'shared/util/helpers'
import { PlanetIconRGB } from 'shared/util/icons'
import { formatNumber } from 'shared/util/numbers'
import { useActions, useAppState } from 'store'
import { DACUserStatusType, RequestState } from 'store/wax/types'

const AnimatedBox = motion(Box)

export const Container = styled.div(({ style }: any) => ({
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  ...style,
}))

const iconStyle: any = {
  width: 48,
  height: 48,
  zIndex: 3,
  marginBottom: 1.3,
  marginRight: 1,
}

const UnstakingVotePower = () => {
  const containerRef = useRef<HTMLDivElement>()
  const textRef = useRef<HTMLDivElement>()
  const [fontSize, setFontSize] = useState(49)

  const {
    wax: { selectedDacId, walletId, actionProgressState },
    modal: { primaryModals },
  } = useAppState()

  const {
    wax: { tryUnstakeVotePower, resetActionProgressState },
    modal: { setPrimaryModalActive, setSecondaryModalActive },
  } = useActions()

  const {
    daoDetails,
    loading: daoDetailsLoading,
  }: { daoDetails: DaoDetailsResponse; loading: boolean } = useDaoDetails(selectedDacId)

  const {
    walletDaoDetails,
    loading: walletDaoDetailsLoading,
  }: { walletDaoDetails: DaoWalletDetailsResponse; loading: boolean } = useWalletDaoDetails({
    dacId: selectedDacId,
    walletId,
  })
  const userStatus = startCase(get(walletDaoDetails, 'user_status', 'explorer'))
  const dacVotingPowerStakeDelay = Math.floor(
    get(walletDaoDetails, 'stake_details.staked_delay', 0) / (3600 * 24)
  )

  const userStakedDAOTokens = toNumber(
    replace(get(walletDaoDetails, 'stake_details.staked_amount', '0'), /[^0-9.-]/g, '')
  )

  const handleClose = () => {
    setPrimaryModalActive({ modalName: 'UnstakingVotePower', value: false })
  }

  useEffect(() => {
    if (actionProgressState === RequestState.Succeeded) {
      handleClose()
      resetActionProgressState()
    }
  }, [actionProgressState])
  useLayoutEffect(() => {
    if (containerRef && containerRef.current && textRef && textRef.current) {
      if (textRef.current.offsetWidth >= containerRef.current.offsetWidth) {
        setFontSize(fontSize - 1)
      } else {
        setFontSize(49)
      }
    }
  }, [textRef.current && textRef.current.offsetWidth])
  const quantity = PrepareDacTokenAmountWithPrecision(userStakedDAOTokens, selectedDacId)
  const currentBreakpointButtonSize: keyof typeof BUTTON_SIZE = useBreakpointValue({
    base: 'sm',
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'lg',
    '2xl': 'lg',
  })
  const currentBreakpointButtonFontSize = useBreakpointValue({
    base: 14,
    sm: 14,
    md: 16,
    lg: 16,
    xl: 16,
    '2xl': 16,
  })
  const loading = daoDetailsLoading || walletDaoDetailsLoading
  if (loading) return <LoadingSpinner />
  if (daoDetails)
    return (
      <Modal size="full" isOpen={primaryModals.UnstakingVotePower} onClose={() => handleClose()}>
        <ModalContent background={Colors.BLACK_SOLID_90}>
          <ModalCloseButton
            marginTop={{ base: 0, lg: 90 }}
            marginRight={{ base: 0, lg: 10 }}
            zIndex={2000}
          />
          <ModalBody pb={{ base: 100, lg: null }}>
            <AnimatedBox
              initial={{ opacity: 0, y: -255 }}
              animate={{ opacity: 1, y: 50 }}
              transition={{
                duration: 0.5,
                delay: 0.1,
                ease: [0, 0.71, 0.2, 1.01],
              }}
            >
              <Container alignItems="center" display="flex" justifyContent="center">
                <VStack gap={2}>
                  <Box borderRadius="50%" backgroundColor={Colors.RADICAL_RED}>
                    <PlanetIconRGB planetName={startCase(selectedDacId)} style={iconStyle} />
                  </Box>

                  <Text fontFamily="Titillium Web" fontSize={16} fontWeight={400}>
                    Unstake TLM from {capitalize(convertPlanetIdToName(selectedDacId))}
                  </Text>
                  <Text
                    fontFamily="Orbitron"
                    fontSize={{
                      base: 35,
                      lg: 45,
                    }}
                    fontWeight={400}
                    background={Colors.RADICAL_RED}
                    backgroundClip="text"
                  >
                    {formatNumber(userStakedDAOTokens, 4, 4)}
                  </Text>
                  <Divider maxWidth="324px" />
                  <Text
                    fontFamily="Titillium Web"
                    fontSize={{
                      base: 20,
                      lg: 25,
                    }}
                    fontWeight={400}
                    color={Colors.RADICAL_RED}
                    letterSpacing="0.1em"
                  >
                    {DateInUTC()}
                  </Text>
                  <HStack gap={0}>
                    <Text
                      fontFamily="Titillium Web"
                      fontSize={18}
                      fontWeight={400}
                      color={Colors.SNOW_WHITE}
                      letterSpacing="0.1em"
                    >
                      {TimeInUTC()}
                    </Text>
                    <Text
                      fontFamily="Titillium Web"
                      fontSize={13}
                      fontWeight={400}
                      color={Colors.SNOW_WHITE}
                      letterSpacing="0.1em"
                      marginInline="0.01em"
                    >
                      UTC
                    </Text>
                  </HStack>
                  <Divider maxWidth="324px" />
                  <HStack gap={0}>
                    <Text
                      fontFamily="Orbitron"
                      fontSize={{
                        base: 35,
                        lg: 45,
                      }}
                      fontWeight={400}
                      letterSpacing="0.06em"
                      color={Colors.SNOW_WHITE}
                      h="41px"
                    >
                      {dacVotingPowerStakeDelay}
                    </Text>

                    <Text
                      fontFamily="Titillium Web"
                      fontSize={{
                        base: 18,
                        lg: 22,
                      }}
                      fontWeight={400}
                      marginBlockEnd={0}
                      marginBlockStart={0}
                      marginInlineStart="0.1rem"
                      h="12px"
                    >
                      Days
                    </Text>
                  </HStack>
                  <Box style={{ marginTop: 40, marginBottom: 40 }}>
                    <Text
                      fontFamily="Titillium Web"
                      fontSize={16}
                      fontWeight={400}
                      color={Colors.AMARANTH}
                      maxW="280px"
                    >
                      This is not a countdown when you unstake. Your Release date starts the day you
                      choose to unstake your TLM from{' '}
                      {capitalize(convertPlanetIdToName(selectedDacId))}, and ends{' '}
                      <span
                        style={{
                          fontFamily: 'Orbitron',
                          fontSize: '27px',
                          fontWeight: 400,
                          color: Colors.SNOW_WHITE,

                          position: 'relative',
                          top: '3px',
                        }}
                      >
                        {dacVotingPowerStakeDelay}
                      </span>{' '}
                      <span
                        style={{
                          fontFamily: 'Titillium Web',
                          fontSize: '13px',
                          fontWeight: 400,
                          color: Colors.SNOW_WHITE,

                          position: 'relative',
                          bottom: '5px',
                        }}
                      >
                        {' '}
                        Days
                      </span>{' '}
                      after.
                    </Text>
                  </Box>

                  <Flex
                    flexDirection={{ base: 'column-reverse', md: 'row' }}
                    gap={4}
                    justifyItems="center"
                  >
                    <Button
                      size={currentBreakpointButtonSize}
                      fontSize={currentBreakpointButtonFontSize}
                      variant="info"
                      onClick={() => handleClose()}
                    >
                      Cancel
                    </Button>

                    <Button
                      size={currentBreakpointButtonSize}
                      fontSize={currentBreakpointButtonFontSize}
                      variant="alert"
                      onClick={() => {
                        if (userStatus === DACUserStatusType.CANDIDATE) {
                          setSecondaryModalActive({
                            modalName: 'ErrorModal',
                            value: true,
                            errorType: ErrorTypes.CANDIDATE_CANNOT_UNSTAKE,
                          })
                        } else {
                          const planetQuantity =
                            quantity.split('TLM')[0] + daoDetails.symbol.sym.split(',')[1]
                          tryUnstakeVotePower(planetQuantity)
                        }
                        handleClose()
                      }}
                    >
                      {`Yes, Unstake ${formatNumber(userStakedDAOTokens, 4, 4)} TLM from
                      ${capitalize(convertPlanetIdToName(selectedDacId))}`}
                    </Button>
                  </Flex>
                </VStack>
              </Container>
            </AnimatedBox>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  return null
}

export { UnstakingVotePower }
