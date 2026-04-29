import { useEffect, useLayoutEffect, useRef, useState } from 'react'

import { InfoIcon } from '@alien-worlds/icons'
import { Button as UIButton, FormField, BUTTON_SIZE } from '@alien-worlds/uikit'
import { useApolloClient } from '@apollo/client'
import { useBreakpointValue } from '@chakra-ui/media-query'
import {
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  GridItem,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
  VStack,
} from '@chakra-ui/react'
import styled from '@emotion/styled/macro'
import { PlanetImage } from 'features/mining/components/PlanetLand/Components/PlanetImage'
import { ConfirmStakingPower } from 'features/syndicates/components/ConfirmStakingPower'
import { Formik } from 'formik'
import { motion } from 'framer-motion'
import { useDaoDetails } from 'graphql/hooks/useDaoDetails'
import { useWalletDaoDetails } from 'graphql/hooks/useWalletDaoDetails'
import { DAO_WALLET_DETAILS_QUERY } from 'graphql/queries/daoWalletDetails'
import { USER_DAO_BALANCES } from 'graphql/queries/userDaoBalances'
import { DaoDetailsResponse, DaoWalletDetailsResponse } from 'graphql/types'
import { capitalize, get, isEmpty, isNull, isUndefined, replace, round, toNumber } from 'lodash'
import { Colors } from 'shared/util/colors'
import { validateAdditionalAmount } from 'shared/util/formhelper'
import { convertPlanetIdToName, getDacSymbol, getSyndicatesCurrentPage } from 'shared/util/helpers'
import { PlanetIcon } from 'shared/util/icons'
import { formatNumber } from 'shared/util/numbers'
import { useActions, useAppState } from 'store'
import { RequestState } from 'store/wax/types'

import { Constants } from '../../../../shared/util/constants'

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
  position: 'absolute',
  right: 10,
  bottom: 0,
  top: 42,
  zIndex: 3,
}

const AddStakingVotePower = () => {
  const containerRef = useRef<HTMLDivElement>()
  const textRef = useRef<HTMLDivElement>()
  const client = useApolloClient()
  const {
    wax: {
      walletId,

      selectedDacId,

      actionProgressState,
    },
    modal: { primaryModals },
  } = useAppState()

  const {
    wax: {
      collectEvent,

      tryStakeVotePower,

      resetActionProgressState,
    },
    modal: { setPrimaryModalActive },
  } = useActions()
  const [fontSize, setFontSize] = useState(49)
  const [sliderValue, setSliderValue] = useState(0)
  const [step, setStep] = useState(1)

  const [stakePercentage, setStakePercentage] = useState('')
  const [adjustedWeight, setAdjustedWeight] = useState(0)
  const [delayDays, setDelayDays] = useState(0)
  const [stakingAmount, setStakingAmount] = useState(0)

  const handleClose = () => {
    setPrimaryModalActive({ modalName: 'AddStakingVotePower', value: false })
  }

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

  const votePower = get(walletDaoDetails, 'vote_weight.weight', 0)
  const stakingTimeMultiplier = toNumber(get(daoDetails, 'time_multiplier', 0))

  const maxStakeTime = Math.floor(parseFloat(get(daoDetails, 'max_stake_time', '0')) / (3600 * 24))
  const dacVotingPowerStakeDelay = Math.floor(
    get(walletDaoDetails, 'stake_details.staked_delay', 0) / (3600 * 24)
  )
  const planetStakes = toNumber(
    replace(get(walletDaoDetails, 'stake_details.available_tlm_in_dao', '0'), /[^0-9.-]/g, '')
  )
  const userStakedDAOTokens = toNumber(
    replace(get(walletDaoDetails, 'stake_details.staked_amount', '0'), /[^0-9.-]/g, '')
  )
  const loading = walletDaoDetailsLoading || daoDetailsLoading
  useEffect(() => {
    if (!loading) {
      setDelayDays(dacVotingPowerStakeDelay)
      setSliderValue(dacVotingPowerStakeDelay)
    }
  }, [daoDetails, walletDaoDetails, loading])
  useEffect(() => {
    const weightDelta =
      (stakingAmount > 0 || sliderValue > dacVotingPowerStakeDelay
        ? stakingAmount + userStakedDAOTokens
        : 0) *
      (1 + (sliderValue * stakingTimeMultiplier) / maxStakeTime)
    setAdjustedWeight(round(weightDelta, 4))
  }, [stakingAmount, sliderValue, stakingTimeMultiplier, maxStakeTime])
  const onClickConfirmStaking = async () => {
    await tryStakeVotePower({
      planet: daoDetails,
      amount: stakingAmount,
      releaseTime: sliderValue,
      currentVotingDelay: get(walletDaoDetails, 'stake_details.staked_delay', 172800) / (3600 * 24),
    })
    await client.refetchQueries({ include: [DAO_WALLET_DETAILS_QUERY, USER_DAO_BALANCES] })
  }
  useEffect(() => {
    if (actionProgressState === RequestState.Succeeded) {
      handleClose()
      resetActionProgressState()
    }
  }, [actionProgressState])
  useLayoutEffect(() => {
    if (containerRef && containerRef.current && textRef && textRef.current) {
      if (textRef.current.offsetWidth >= containerRef.current.offsetWidth * 0.8) {
        setFontSize(fontSize - 1)
      }
      if (textRef.current.offsetWidth < containerRef.current.offsetWidth * 0.6) {
        setFontSize(49)
      }
    }
  }, [textRef.current && textRef.current.offsetWidth])

  const currentButtonSize: keyof typeof BUTTON_SIZE = useBreakpointValue({
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

  if (!loading)
    return (
      <Modal size="full" isOpen={primaryModals.AddStakingVotePower} onClose={() => handleClose()}>
        <ModalContent background={Colors.BLACK_SOLID_90}>
          <ModalCloseButton zIndex={2000} />
          <ModalBody>
            {step === 1 && (
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
                  flexDirection="column"
                  justifyItems="center"
                  alignItems="center"
                  width="100%"
                  gap={6}
                  marginBottom={8}
                  marginTop={90}
                >
                  <Formik
                    initialValues={{
                      amount: '',
                    }}
                    onSubmit={() => {
                      setStep(2)
                      collectEvent({
                        name: Constants.GA_SYNDICATES_STAKE_VP_OVERLAY_STAKE,
                        fields: {
                          location: getSyndicatesCurrentPage(),
                          votePower,
                          planet: daoDetails?.title,
                          stakedTokens: userStakedDAOTokens,
                          availableTokens: planetStakes,
                          adjustedVotePower: adjustedWeight,
                          releaseTime: sliderValue,
                          stakePercentage,
                        },
                      })
                    }}
                  >
                    {({ handleSubmit, errors, setErrors }) => (
                      <form onSubmit={handleSubmit} onChange={() => {}}>
                        <Box width={['100%', '100%', '75%', '75%', '75%', '65%']} margin="auto">
                          <Grid
                            templateColumns={{
                              base: 'repeat(1, 1fr)',
                              lg: 'repeat(2, 1fr)',
                            }}
                            gap={6}
                          >
                            <GridItem
                              w="100%"
                              display="flex"
                              flexDirection="column"
                              alignItems="center"
                              order={[2, 2, 2, 2, 1]}
                              gap={3}
                              paddingLeft={4}
                              paddingRight={4}
                              ref={(ref) => {
                                containerRef.current = ref
                              }}
                            >
                              <HStack
                                display="flex"
                                alignItems="flex-start"
                                justifyContent="center"
                                marginBottom={4}
                              >
                                <VStack width={160} position="relative">
                                  <PlanetImage
                                    w="100px"
                                    h="100px"
                                    dacId={daoDetails.dac_id}
                                    interactive
                                    css={{
                                      WebkitTapHighlightColor: Colors.TRANSPARENT,
                                    }}
                                    key={daoDetails?.title}
                                    titleDisplay="none"
                                  />
                                  <PlanetIcon planetName={daoDetails?.title} style={iconStyle} />
                                </VStack>
                                <VStack>
                                  <Text
                                    fontFamily="Titillium Web"
                                    fontSize={16}
                                    fontWeight={400}
                                    marginTop="20px"
                                  >
                                    Available TLM in{' '}
                                    {capitalize(convertPlanetIdToName(selectedDacId))}
                                  </Text>
                                  <Text
                                    fontFamily="Orbitron"
                                    fontSize={20}
                                    fontWeight={600}
                                    background={Colors.Gradient1}
                                    backgroundClip="text"
                                  >
                                    {formatNumber(planetStakes, 4, 4)}
                                  </Text>
                                </VStack>
                              </HStack>
                              <VStack>
                                <Text fontFamily="Titillium Web" fontSize={16} fontWeight={400}>
                                  Staked TLM in {capitalize(convertPlanetIdToName(selectedDacId))}
                                </Text>
                                <Text
                                  fontFamily="Orbitron"
                                  fontSize={20}
                                  fontWeight={600}
                                  background={Colors.Gradient1}
                                  backgroundClip="text"
                                >
                                  {formatNumber(userStakedDAOTokens, 4, 4)}
                                </Text>
                              </VStack>
                              <HStack>
                                <FormField
                                  size="lg"
                                  type="number"
                                  name="amount"
                                  placeholder="Amount"
                                  borderColor={Colors.SILVER}
                                  borderWidth={2}
                                  minWidth={244}
                                  maxWidth={244}
                                  paddingLeft="32px"
                                  fontFamily="Titillium Web"
                                  fontSize={16}
                                  marginTop={4}
                                  color={Colors.GRAY_CHATEAU}
                                  minHeight={42}
                                  fontWeight={700}
                                  margin="auto"
                                  value={stakingAmount ?? ''}
                                  validate={() =>
                                    validateAdditionalAmount(stakingAmount, planetStakes)
                                  }
                                  onChange={({ target: { value } }) => {
                                    if (!isEmpty(value) || isNull(value) || isUndefined(value))
                                      setStakingAmount(toNumber(value))
                                    else {
                                      setStakingAmount(null)
                                    }
                                    setErrors({})
                                  }}
                                />
                              </HStack>
                              <HStack>
                                <Button
                                  borderRadius="50%"
                                  width={38}
                                  height={38}
                                  fontSize={12}
                                  bg={Colors.GRAY_CHATEAU}
                                  isActive={stakePercentage === '10'}
                                  onClick={() => {
                                    setErrors({})
                                    setStakePercentage('10')
                                    setStakingAmount(round(planetStakes * 0.1, 4))
                                  }}
                                  _hover={{ bg: Colors.MARINER }}
                                  _active={{ bg: Colors.MARINER }}
                                >
                                  10%
                                </Button>
                                <Button
                                  borderRadius="50%"
                                  width={38}
                                  height={38}
                                  fontSize={12}
                                  bg={Colors.GRAY_CHATEAU}
                                  isActive={stakePercentage === '20'}
                                  onClick={() => {
                                    setErrors({})
                                    setStakePercentage('20')
                                    setStakingAmount(round(planetStakes * 0.2, 4))
                                  }}
                                  _hover={{ bg: Colors.MARINER }}
                                  _active={{ bg: Colors.MARINER }}
                                >
                                  20%
                                </Button>
                                <Button
                                  borderRadius="50%"
                                  width={38}
                                  height={38}
                                  fontSize={12}
                                  isActive={stakePercentage === '50'}
                                  bg={Colors.GRAY_CHATEAU}
                                  onClick={() => {
                                    setErrors({})
                                    setStakePercentage('50')
                                    setStakingAmount(round(planetStakes * 0.5, 4))
                                  }}
                                  _hover={{ bg: Colors.MARINER }}
                                  _active={{ bg: Colors.MARINER }}
                                >
                                  50%
                                </Button>
                                <Button
                                  borderRadius="50%"
                                  width={38}
                                  height={38}
                                  fontSize={12}
                                  bg={Colors.GRAY_CHATEAU}
                                  isActive={stakePercentage === '75'}
                                  onClick={() => {
                                    setErrors({})
                                    setStakePercentage('75')
                                    setStakingAmount(round(planetStakes * 0.75, 4))
                                  }}
                                  _hover={{ bg: Colors.MARINER }}
                                  _active={{ bg: Colors.MARINER }}
                                >
                                  75%
                                </Button>
                                <Button
                                  borderRadius="50%"
                                  width={38}
                                  height={38}
                                  fontSize={12}
                                  bg={Colors.GRAY_CHATEAU}
                                  isActive={stakePercentage === 'Max'}
                                  onClick={() => {
                                    setErrors({})
                                    setStakePercentage('Max')
                                    setStakingAmount(round(planetStakes, 4))
                                  }}
                                  _hover={{ bg: Colors.MARINER }}
                                  _active={{ bg: Colors.MARINER }}
                                >
                                  Max
                                </Button>
                              </HStack>
                              <Divider border="1px solid" borderColor={Colors.SCORPION} />
                              <Text
                                fontFamily="Titillium Web"
                                fontSize={16}
                                fontWeight={700}
                                letterSpacing="0.08em"
                                color={Colors.JUMBO}
                              >
                                Release Time & Bonus
                              </Text>
                              <VStack width="100%" gap={2}>
                                <HStack gap={0}>
                                  <Text
                                    fontFamily="Orbitron"
                                    fontSize="45px"
                                    fontWeight={400}
                                    letterSpacing="0.06em"
                                    color={Colors.RADICAL_RED}
                                    h="41px"
                                  >
                                    {delayDays}
                                  </Text>
                                  <Text
                                    fontFamily="Titillium Web"
                                    fontSize="22px"
                                    fontWeight={400}
                                    marginBlockEnd={0}
                                    marginBlockStart={0}
                                    marginInlineStart="0.1rem"
                                    h="12px"
                                  >
                                    Days
                                  </Text>
                                </HStack>
                              </VStack>
                              <Slider
                                aria-label="slider-ex-1"
                                min={delayDays}
                                onChange={(value) => setSliderValue(value)}
                                max={maxStakeTime}
                                defaultValue={delayDays}
                                isDisabled={
                                  stakingAmount <= 0 ||
                                  !stakingAmount ||
                                  (errors.amount && errors.amount.length > 0)
                                }
                              >
                                <SliderTrack h="5px">
                                  <SliderFilledTrack bg={Colors.RADICAL_RED} />
                                </SliderTrack>
                                <SliderThumb width="25px" height="25px" />
                              </Slider>
                              <HStack>
                                <VStack width="100%" display="block" gap={0}>
                                  <Text
                                    fontFamily="Orbitron"
                                    fontSize="32px"
                                    fontWeight={400}
                                    letterSpacing="0.06em"
                                    color={Colors.RADICAL_RED}
                                    h="28px"
                                  >
                                    {sliderValue}
                                  </Text>
                                  <Text
                                    fontFamily="Titillium Web"
                                    fontSize="16px"
                                    fontWeight={400}
                                    marginBlockEnd={0}
                                    marginBlockStart={0}
                                    h="12px"
                                  >
                                    Days
                                  </Text>
                                </VStack>
                                <VStack>
                                  <Text
                                    fontFamily="Titillium Web"
                                    fontSize={16}
                                    fontWeight={400}
                                    textAlign="center"
                                    width={{
                                      base: '200px',
                                      md: '300px',
                                    }}
                                    textOverflow="unset"
                                  >
                                    Total TLM in {capitalize(convertPlanetIdToName(selectedDacId))}{' '}
                                    being Staked
                                  </Text>
                                  <Text
                                    fontFamily="Orbitron"
                                    fontSize={20}
                                    fontWeight={600}
                                    background={Colors.CARIBBEAN_GREEN}
                                    backgroundClip="text"
                                  >
                                    {formatNumber(stakingAmount + userStakedDAOTokens, 4, 4)}
                                  </Text>
                                </VStack>
                              </HStack>
                              <Divider border="1px solid" borderColor={Colors.SCORPION} />
                              <VStack>
                                <Text
                                  fontFamily="Titillium Web"
                                  fontSize="16px"
                                  fontWeight={700}
                                  letterSpacing="0.08em"
                                  color={Colors.JUMBO}
                                >
                                  Adjusted Vote Power Approx.
                                </Text>
                                <Text
                                  fontFamily="Orbitron"
                                  fontSize={{
                                    base: fontSize - 20,
                                    md: fontSize,
                                  }}
                                  fontWeight={400}
                                  color={Colors.CARIBBEAN_GREEN}
                                  letterSpacing="0.06em"
                                  marginTop={0}
                                  ref={(ref) => {
                                    textRef.current = ref
                                  }}
                                >
                                  {formatNumber(adjustedWeight, 4, 4)}
                                </Text>
                              </VStack>
                            </GridItem>

                            <GridItem
                              order={[1, 1, 1, 1, 2]}
                              w="100%"
                              display="flex"
                              flexDirection="column"
                              gap={4}
                              borderLeft={['none', 'none', 'none', 'none', '1px solid']}
                              borderColor={Colors.SCORPION}
                              paddingLeft={8}
                              paddingRight={4}
                            >
                              <Flex flexDirection="row" gap={2} alignItems="center">
                                <InfoIcon
                                  color={Colors.GRAY_CHATEAU}
                                  style={{ width: 24, height: 24 }}
                                />
                                <Text
                                  fontFamily="Orbitron"
                                  fontSize="20px"
                                  fontWeight={400}
                                  letterSpacing="0.05em"
                                  color={Colors.CARIBBEAN_GREEN}
                                >
                                  Staking additional TLM in{' '}
                                  {capitalize(convertPlanetIdToName(selectedDacId))}
                                </Text>
                              </Flex>

                              <Text fontFamily="Titillium Web" fontSize="18px" fontWeight={400}>
                                Because you have already staked{' '}
                                <span
                                  style={{
                                    color: Colors.KEY_LIME_PIE,
                                  }}
                                >
                                  TLM in {capitalize(convertPlanetIdToName(selectedDacId))}
                                </span>{' '}
                                for{' '}
                                <span
                                  style={{
                                    color: Colors.RADICAL_RED,
                                  }}
                                >
                                  {delayDays} Days
                                </span>
                                , you’ll only be able to add to your existing{' '}
                                <span
                                  style={{
                                    color: Colors.CARIBBEAN_GREEN,
                                  }}
                                >
                                  {formatNumber(planetStakes, 4, 4)} Tokens
                                </span>
                                .
                              </Text>

                              <Text fontFamily="Titillium Web" fontSize="18px" fontWeight={400}>
                                <span
                                  style={{
                                    color: Colors.RADICAL_RED,
                                  }}
                                >
                                  WARNING:{' '}
                                </span>
                                Staking is indefinite. Your unstaking commitment begins after you
                                choose to unstake.
                              </Text>
                              <Divider border="1px solid" borderColor={Colors.SCORPION} />
                              <HStack>
                                <InfoIcon
                                  color={Colors.GRAY_CHATEAU}
                                  style={{ width: 24, height: 24 }}
                                />
                                <Text
                                  fontFamily="Orbitron"
                                  fontSize="20px"
                                  fontWeight={400}
                                  letterSpacing="0.05em"
                                  color={Colors.RADICAL_RED}
                                >
                                  Unstaking TLM from{' '}
                                  {capitalize(convertPlanetIdToName(selectedDacId))}
                                </Text>
                              </HStack>
                              <Text fontFamily="Titillium Web" fontSize="18px" fontWeight={400}>
                                When{' '}
                                <span
                                  style={{
                                    color: Colors.RADICAL_RED,
                                  }}
                                >
                                  Unstaking{' '}
                                </span>
                                your{' '}
                                <span
                                  style={{
                                    color: Colors.KEY_LIME_PIE,
                                  }}
                                >
                                  TLM from {capitalize(convertPlanetIdToName(selectedDacId))}
                                </span>
                                , your{' '}
                                <span
                                  style={{
                                    color: Colors.CARIBBEAN_GREEN,
                                  }}
                                >
                                  Voting Power{' '}
                                </span>
                                will become{' '}
                                <span
                                  style={{
                                    color: Colors.RADICAL_RED,
                                  }}
                                >
                                  zero{' '}
                                </span>
                                and you will have to wait{' '}
                                <span
                                  style={{
                                    color: Colors.RADICAL_RED,
                                  }}
                                >
                                  {sliderValue}
                                  {' Days '}
                                </span>
                                for your staked{' '}
                                <span
                                  style={{
                                    color: Colors.KEY_LIME_PIE,
                                  }}
                                >
                                  TLM in {capitalize(convertPlanetIdToName(selectedDacId))}{' '}
                                </span>
                                to be released.
                              </Text>
                            </GridItem>
                          </Grid>
                        </Box>
                        <Flex
                          flexDirection={{ base: 'column-reverse', md: 'row' }}
                          marginTop={12}
                          gap={4}
                          px={4}
                          justifyItems="center"
                          justifyContent="center"
                        >
                          <UIButton
                            onClick={() => {
                              handleClose()
                              collectEvent({
                                name: Constants.GA_SYNDICATES_STAKE_VP_OVERLAY_CANCEL,
                                fields: {
                                  location: getSyndicatesCurrentPage(),
                                  votePower,
                                  planet: daoDetails?.title,
                                  stakedTokens: userStakedDAOTokens,
                                  availableTokens: planetStakes,
                                  adjustedVotePower: adjustedWeight,
                                  releaseTime: sliderValue,
                                  stakePercentage,
                                },
                              })
                            }}
                            variant="info"
                            size={currentButtonSize}
                            fontSize={currentBreakpointButtonFontSize}
                          >
                            Cancel
                          </UIButton>

                          <UIButton
                            variant="primary"
                            size={currentButtonSize}
                            fontSize={currentBreakpointButtonFontSize}
                            isDisabled={
                              (stakingAmount < 0 ||
                                sliderValue === dacVotingPowerStakeDelay ||
                                (errors.amount && errors.amount.length > 0)) &&
                              stakingAmount <= 0 &&
                              sliderValue === dacVotingPowerStakeDelay
                            }
                          >
                            Stake {formatNumber(stakingAmount, 4, 4)} TLM in{' '}
                            {capitalize(convertPlanetIdToName(selectedDacId))}
                          </UIButton>
                        </Flex>
                      </form>
                    )}
                  </Formik>
                </Flex>
              </AnimatedBox>
            )}
            {step === 2 && (
              <ConfirmStakingPower
                planetName={daoDetails?.title}
                planetSymbol={getDacSymbol(selectedDacId)}
                stakingTokens={stakingAmount}
                stakingDays={sliderValue}
                finalVotingPower={adjustedWeight}
                onClickStakingPower={onClickConfirmStaking}
                onChangeAmountClick={setStep}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  return null
}

export { AddStakingVotePower }
