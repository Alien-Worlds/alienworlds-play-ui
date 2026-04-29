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
import { AnimatePresence, motion } from 'framer-motion'
import { useDaoDetails } from 'graphql/hooks/useDaoDetails'
import { useWalletDaoDetails } from 'graphql/hooks/useWalletDaoDetails'
import { DAO_WALLET_DETAILS_QUERY } from 'graphql/queries/daoWalletDetails'
import { USER_DAO_BALANCES } from 'graphql/queries/userDaoBalances'
import { DaoDetailsResponse, DaoWalletDetailsResponse } from 'graphql/types'
import { capitalize, get, isEmpty, isNull, isUndefined, replace, round, toNumber } from 'lodash'
import { Colors } from 'shared/util/colors'
import { validateAmount } from 'shared/util/formhelper'
import { convertPlanetIdToName, getDacSymbol } from 'shared/util/helpers'
import { PlanetIcon } from 'shared/util/icons'
import { formatNumber } from 'shared/util/numbers'
import { useActions, useAppState } from 'store'
import { RequestState } from 'store/wax/types'

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

const StakingVotePower = () => {
  const containerRef = useRef<HTMLDivElement>()
  const textRef = useRef<HTMLDivElement>()
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
      tryStakeVotePower,

      resetActionProgressState,
    },
    modal: { setPrimaryModalActive },
  } = useActions()

  const [fontSize, setFontSize] = useState(49)
  const [step, setStep] = useState(1)
  const client = useApolloClient()
  const [stakePercentage, setStakePercentage] = useState('')
  const [adjustedWeight, setAdjustedWeight] = useState(0)
  const [stakingAmount, setStakingAmount] = useState(0)
  const [delayDays, setDelayDays] = useState(0)
  const [sliderValue, setSliderValue] = useState(0)

  const handleClose = () => {
    setPrimaryModalActive({ modalName: 'StakingVotePower', value: false })
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

  const stakingTimeMultiplier = toNumber(get(daoDetails, 'time_multiplier', 0))

  const maxStakeTime = Math.floor(parseFloat(get(daoDetails, 'max_stake_time', '0')) / (3600 * 24))
  const dacVotingPowerStakeDelay = Math.floor(
    get(walletDaoDetails, 'stake_details.staked_delay', 0) / (3600 * 24)
  )
  const planetStakes = toNumber(
    replace(get(walletDaoDetails, 'stake_details.available_tlm_in_dao', '0'), /[^0-9.-]/g, '')
  )

  const loading = walletDaoDetailsLoading || daoDetailsLoading

  useEffect(() => {
    if (!loading) {
      setDelayDays(dacVotingPowerStakeDelay)
      setSliderValue(dacVotingPowerStakeDelay)
    }
  }, [daoDetails, walletDaoDetails, loading])

  useEffect(() => {
    const weightDelta = stakingAmount * (1 + (sliderValue * stakingTimeMultiplier) / maxStakeTime)
    setAdjustedWeight(round(weightDelta, 4))
    return () => {
      setAdjustedWeight(0)
    }
  }, [stakingAmount, sliderValue, stakingTimeMultiplier, maxStakeTime])

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
  useEffect(() => {
    if (actionProgressState === RequestState.Succeeded) {
      handleClose()
      resetActionProgressState()
    }
    return () => {
      resetActionProgressState()
    }
  }, [actionProgressState])
  const onClickConfirmStaking = async () => {
    await tryStakeVotePower({
      planet: daoDetails,
      amount: stakingAmount,
      releaseTime: sliderValue,
      currentVotingDelay: get(walletDaoDetails, 'stake_details.staked_delay', 172800) / (3600 * 24),
    })
    await client.refetchQueries({ include: [DAO_WALLET_DETAILS_QUERY, USER_DAO_BALANCES] })
  }
  const currentButtonSize: keyof typeof BUTTON_SIZE = useBreakpointValue({
    base: 'sm',
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'md',
    '2xl': 'md',
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
      <Modal size="full" isOpen={primaryModals.StakingVotePower} onClose={() => handleClose()}>
        <ModalContent background={Colors.BLACK_SOLID_90}>
          <ModalCloseButton
            onClick={() => {
              handleClose()
              setStep(1)
            }}
            zIndex={2000}
          />
          <ModalBody>
            <AnimatePresence>
              {step === 1 && (
                <AnimatedBox
                  initial={{ opacity: 0, y: -255 }}
                  animate={{ opacity: 1, y: -20 }}
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
                      }}
                    >
                      {({ handleSubmit, errors, setErrors }) => (
                        <form onSubmit={handleSubmit} onChange={() => {}}>
                          <Box width={['100%', '100%', '75%', '75%', '75%', '60%']} margin="auto">
                            <Grid
                              templateColumns={{
                                base: 'repeat(1, 1fr)',
                                sm: 'repeat(1, 1fr)',
                                md: 'repeat(1, 1fr)',
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
                                gap={4}
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
                                    <PlanetIcon planetName={daoDetails.title} style={iconStyle} />
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
                                    validate={() => validateAmount(stakingAmount, planetStakes)}
                                    minHeight={41.86}
                                    fontWeight={700}
                                    margin="auto"
                                    value={stakingAmount ?? ''}
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
                                      setStakePercentage('10')
                                      setStakingAmount(round(planetStakes * 0.1, 4))
                                      setErrors({})
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
                                      setStakePercentage('20')
                                      setStakingAmount(round(planetStakes * 0.2, 4))
                                      setErrors({})
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
                                      setStakePercentage('50')
                                      setStakingAmount(round(planetStakes * 0.5, 4))
                                      setErrors({})
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
                                      setStakePercentage('75')
                                      setStakingAmount(round(planetStakes * 0.75, 4))
                                      setErrors({})
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
                                      setStakePercentage('Max')
                                      setStakingAmount(round(planetStakes, 4))
                                      setErrors({})
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
                                  Release Time
                                </Text>
                                <Slider
                                  aria-label="slider-ex-1"
                                  min={delayDays}
                                  onChange={(value) => setSliderValue(value)}
                                  max={maxStakeTime}
                                  isDisabled={
                                    stakingAmount <= 0 ||
                                    !stakingAmount ||
                                    (errors.amount && errors.amount.length > 0)
                                  }
                                  defaultValue={delayDays}
                                >
                                  <SliderTrack h="5px">
                                    <SliderFilledTrack bg={Colors.RADICAL_RED} />
                                  </SliderTrack>
                                  <SliderThumb width="25px" height="25px" />
                                </Slider>
                                <VStack gap={0} marginBottom={4}>
                                  <Text
                                    fontFamily="orb"
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
                                <Divider border="1px solid" borderColor={Colors.SCORPION} />
                                <VStack gap={2}>
                                  <Text
                                    as="div"
                                    fontFamily="Titillium Web"
                                    fontSize="16px"
                                    fontWeight={700}
                                    letterSpacing="0.08em"
                                    color={Colors.JUMBO}
                                    h="18px"
                                  >
                                    Adjusted Vote Power Approx.
                                  </Text>
                                  <Text
                                    as="div"
                                    fontFamily="orb"
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
                                <HStack>
                                  <InfoIcon
                                    color={Colors.GRAY_CHATEAU}
                                    style={{ width: 24, height: 24 }}
                                  />
                                  <Text
                                    fontFamily="orb"
                                    fontSize="20px"
                                    fontWeight={400}
                                    letterSpacing="0.05em"
                                    color={Colors.CARIBBEAN_GREEN}
                                  >
                                    Staking TLM in{' '}
                                    {capitalize(convertPlanetIdToName(selectedDacId))}
                                  </Text>
                                </HStack>

                                <Text fontFamily="Titillium Web" fontSize="18px" fontWeight={400}>
                                  As a Member of Planet{' '}
                                  <span
                                    style={{
                                      color: Colors.KEY_LIME_PIE,
                                    }}
                                  >
                                    {daoDetails.title}
                                  </span>
                                  , staking your{' '}
                                  <span
                                    style={{
                                      color: Colors.KEY_LIME_PIE,
                                    }}
                                  >
                                    TLM in {capitalize(convertPlanetIdToName(selectedDacId))}{' '}
                                  </span>{' '}
                                  will allow you to Vote on Candidates and which Custodian will be
                                  Elected Council Members.
                                </Text>
                                <Text fontFamily="Titillium Web" fontSize="18px" fontWeight={400}>
                                  The longer you stake the{' '}
                                  <span
                                    style={{
                                      color: Colors.KEY_LIME_PIE,
                                    }}
                                  >
                                    TLM
                                  </span>
                                  , the more bonus to Voting Power you will have.
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
                                    fontFamily="orb"
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
                                    TLM{' '}
                                  </span>
                                  your{' '}
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
                                    TLM{' '}
                                  </span>
                                  to be released
                                </Text>
                              </GridItem>
                            </Grid>
                          </Box>
                          <Flex
                            flexDirection={{ base: 'column-reverse', md: 'row' }}
                            gap={4}
                            justifyItems="center"
                            mt={10}
                            px={4}
                            justifyContent="center"
                          >
                            <UIButton
                              variant="info"
                              size={currentButtonSize}
                              onClick={() => handleClose()}
                              fontSize={currentBreakpointButtonFontSize}
                            >
                              Cancel
                            </UIButton>

                            <UIButton
                              type="submit"
                              variant="primary"
                              size={currentButtonSize}
                              onClick={() => setStep(2)}
                              fontSize={currentBreakpointButtonFontSize}
                              isDisabled={
                                stakingAmount <= 0 ||
                                !stakingAmount ||
                                (errors.amount && errors.amount.length > 0)
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
                  planetName={daoDetails.title}
                  planetSymbol={getDacSymbol(selectedDacId)}
                  stakingTokens={stakingAmount}
                  stakingDays={sliderValue}
                  finalVotingPower={adjustedWeight}
                  onClickStakingPower={onClickConfirmStaking}
                  onChangeAmountClick={setStep}
                />
              )}
            </AnimatePresence>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  return null
}

export { StakingVotePower }
