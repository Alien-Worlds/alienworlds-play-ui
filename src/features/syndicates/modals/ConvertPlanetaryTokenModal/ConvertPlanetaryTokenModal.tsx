import { useEffect, useState } from 'react'

import { AlienWorldsIcon, ConvertTKNIcon, WaxIcon } from '@alien-worlds/icons'
import { Button as UIButton, BUTTON_SIZE, FormField } from '@alien-worlds/uikit'
import { useApolloClient } from '@apollo/client'
import { useBreakpointValue } from '@chakra-ui/media-query'
import {
  Box,
  Button,
  Flex,
  Switch,
  Text,
  Modal,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  Heading,
  VStack,
  HStack,
  Grid,
  GridItem,
  Center,
  Hide,
} from '@chakra-ui/react'
import { css } from '@emotion/react'
import { PlanetImage } from 'features/mining/components/PlanetLand/Components/PlanetImage'
import { getPlanetGradient, PlanetImageSizes } from 'features/mining/utils/planet'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { Formik } from 'formik'
import { useDaoDetails } from 'graphql/hooks/useDaoDetails'
import { useWalletDaoDetails } from 'graphql/hooks/useWalletDaoDetails'
import { useWalletDetails } from 'graphql/hooks/useWalletDetails'
import { DAO_WALLET_DETAILS_QUERY } from 'graphql/queries/daoWalletDetails'
import { USER_DAO_BALANCES } from 'graphql/queries/userDaoBalances'
import { WALLET_DETAILS_QUERY_ALL } from 'graphql/queries/walletDetails'
import { DaoDetailsResponse, DaoWalletDetailsResponse, WalletDetailsResponse } from 'graphql/types'
import {
  capitalize,
  get,
  isEmpty,
  isNull,
  isUndefined,
  replace,
  round,
  split,
  toNumber,
} from 'lodash'
import { Colors } from 'shared/util/colors'
import { validateAmount } from 'shared/util/formhelper'
import { convertPlanetIdToName, getSyndicatesCurrentPage } from 'shared/util/helpers'
import { PlanetIcon, PlanetIconRGB } from 'shared/util/icons'
import { formatNumber } from 'shared/util/numbers'
import { useActions, useAppState } from 'store'

import { Constants } from '../../../../shared/util/constants'

const iconStyle: any = {
  width: 42,
  height: 42,
  zIndex: 3,
}

export const ConvertPlanetaryTokenModal = () => {
  const {
    modal: { setPrimaryModalActive },
    wax: { tryStake, tryUnstake, collectEvent },
  } = useActions()
  const {
    wax: { walletId, isDemoUser, selectedDacId },
    modal: { primaryModals },
  } = useAppState()
  const client = useApolloClient()
  const [stakingAmount, setStakingAmount] = useState(0)

  const [isStakeIntent, setIsStakeIntent] = useState(true)
  const [stakePercentage, setStakePercentage] = useState('')

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

  const {
    walletDetails,
    loading: walletDetailsLoading,
  }: { walletDetails: WalletDetailsResponse; loading: boolean } = useWalletDetails(walletId)
  const votePower = get(walletDaoDetails, 'vote_weight.weight', 0)

  const planetStakes = toNumber(
    replace(get(walletDaoDetails, 'stake_details.available_tlm_in_dao', '0'), /[^0-9.-]/g, '')
  )
  const userStakedDAOTokens = toNumber(
    replace(get(walletDaoDetails, 'stake_details.staked_amount', '0'), /[^0-9.-]/g, '')
  )
  const loading = walletDaoDetailsLoading || daoDetailsLoading || walletDetailsLoading

  useEffect(() => {
    setStakingAmount(0)
    setStakePercentage('')
    setIsStakeIntent(true)
  }, [])

  const onClickConfirm = async () => {
    if (isStakeIntent) {
      await tryStake(stakingAmount)
      await client.refetchQueries({
        include: [DAO_WALLET_DETAILS_QUERY, USER_DAO_BALANCES, WALLET_DETAILS_QUERY_ALL],
      })
    } else {
      await tryUnstake({ dac: daoDetails, amount: stakingAmount })
      await client.refetchQueries({
        include: [DAO_WALLET_DETAILS_QUERY, USER_DAO_BALANCES, WALLET_DETAILS_QUERY_ALL],
      })
    }
    collectEvent({
      name: isStakeIntent
        ? Constants.GA_SYNDICATES_OVERLAY_CONVERT_FROM
        : Constants.GA_SYNDICATES_OVERLAY_CONVERT_TO,
      fields: {
        location: getSyndicatesCurrentPage(),
        votePower,
        planet: daoDetails?.title,
        stakedTokens: userStakedDAOTokens,
        availableTokens: planetStakes[selectedDacId],
        stakingAmount,
        stakePercentage,
      },
    })
    setStakePercentage('')
  }

  const handleClose = () => {
    setPrimaryModalActive({ modalName: 'ConvertPlanataryTokenModal', value: false })
  }

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
  if (loading) return <LoadingSpinner />
  const currentToken = planetStakes
  const trilliumBalance = toNumber(split(walletDetails.tlm_balance, ' ')[0])

  return (
    <Modal
      size="full"
      isOpen={primaryModals.ConvertPlanataryTokenModal}
      onClose={() => handleClose()}
    >
      <ModalContent background={Colors.BLACK_SOLID_90}>
        <ModalCloseButton marginTop={0} marginRight={0} onClick={() => handleClose()} />
        <ModalBody>
          <Hide above="md">
            <Box w="87px" marginTop={2} marginLeft={1}>
              <AlienWorldsIcon width={87} height={31} color={Colors.SNOW_WHITE} />
            </Box>
          </Hide>
          <Center marginTop={['5vh', '5vh', '5vh', '20vh', '25vh', '25vh']}>
            <Box>
              {/* PLANET TITLE */}
              <Heading
                mb={6}
                as="h3"
                fontSize="5xl"
                bgClip="text"
                fontWeight={400}
                fontFamily="Orbitron"
                textTransform="capitalize"
                bgGradient={getPlanetGradient(daoDetails?.title)}
              >
                {daoDetails?.title}
              </Heading>

              <Grid
                gridTemplateColumns={['100%', '100%', '100%', '100%', '50% 50%', '50% 50%']}
                mb={12}
                gap={[4, 4, 4, 4, 8, 8]}
              >
                <GridItem>
                  <Flex
                    alignItems="flex-start"
                    mb={4}
                    minWidth={80}
                    justifyContent="flex-start"
                    paddingRight={8}
                  >
                    <WaxIcon
                      color={Colors.DI_SERRIA}
                      boxSize={46}
                      style={{ position: 'relative' }}
                    />

                    <Flex direction="column" ml={3}>
                      <Flex>
                        <Text fontSize="2xl" lineHeight={1} fontFamily="Orbitron">
                          {formatNumber(walletDetails.tlm_balance, 4, 4)}
                        </Text>
                        <Text fontSize="2xl" lineHeight={1} fontFamily="Orbitron" ml={2}>
                          TLM
                        </Text>
                      </Flex>
                      <Text
                        fontFamily="tlm"
                        fontWeight="bold"
                        fontSize="smaller"
                        letterSpacing="0.1em"
                        color={Colors.SECONDARY_GRAY}
                      >
                        WAX Trillium
                      </Text>
                    </Flex>
                  </Flex>
                </GridItem>

                <GridItem>
                  <Flex alignItems="flex-start" mb={4}>
                    <PlanetIcon planetName={daoDetails?.title} style={iconStyle} />
                    <Flex direction="column" ml={3}>
                      <Flex>
                        <Text fontSize="2xl" lineHeight={1} fontFamily="Orbitron">
                          {formatNumber(currentToken, 4, 4)}
                        </Text>
                        <Text
                          fontSize="2xl"
                          lineHeight={1}
                          fontFamily="Orbitron"
                          ml={2}
                          bgClip="text"
                          bgGradient={getPlanetGradient(daoDetails?.title)}
                        >
                          TLM
                        </Text>
                      </Flex>

                      <Text
                        fontFamily="Titillium Web"
                        fontWeight="bold"
                        fontSize="smaller"
                        letterSpacing="0.1em"
                        textTransform="capitalize"
                        color={Colors.SECONDARY_GRAY}
                      >
                        Available TLM in {capitalize(convertPlanetIdToName(selectedDacId))}
                      </Text>
                    </Flex>
                  </Flex>
                </GridItem>
              </Grid>

              <Formik
                initialValues={{
                  amount: '',
                }}
                onSubmit={() => {
                  if (isDemoUser) {
                    setPrimaryModalActive({ modalName: 'LoginModal', value: true })
                  } else {
                    onClickConfirm()
                  }
                }}
              >
                {({ handleSubmit, errors, setErrors }) => (
                  <form onSubmit={handleSubmit}>
                    <VStack alignItems="center">
                      {/* STAKE INPUT */}

                      <Grid
                        gridTemplateColumns={[
                          '100%',
                          '100%',
                          '100%',
                          '50% 50%',
                          '50% 50%',
                          '50% 50%',
                        ]}
                        gap={[4, 4, 4, 4, 8, 8]}
                        mb={12}
                      >
                        <GridItem>
                          <Box
                            minWidth={80}
                            justifyContent="flex-start"
                            paddingRight={{ base: 0, md: 8 }}
                          >
                            <FormField
                              size="lg"
                              type="number"
                              name="amount"
                              placeholder="Amount"
                              borderColor={Colors.SILVER}
                              borderWidth={2}
                              fontFamily="Titillium Web"
                              fontSize={16}
                              marginTop={4}
                              color={Colors.GRAY_CHATEAU}
                              validate={() =>
                                validateAmount(
                                  stakingAmount,
                                  isStakeIntent ? trilliumBalance : currentToken
                                )
                              }
                              minHeight={42}
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
                          </Box>
                        </GridItem>
                        <GridItem>
                          <HStack
                            mt={2}
                            justify={{ base: 'space-evenly', sm: 'space-evenly', md: 'left' }}
                          >
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
                                setStakingAmount(
                                  round((isStakeIntent ? trilliumBalance : currentToken) * 0.1, 4)
                                )
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
                                setStakingAmount(
                                  round((isStakeIntent ? trilliumBalance : currentToken) * 0.2, 4)
                                )
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
                                setStakingAmount(
                                  round((isStakeIntent ? trilliumBalance : currentToken) * 0.5, 4)
                                )
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
                                setStakingAmount(
                                  round((isStakeIntent ? trilliumBalance : currentToken) * 0.75, 4)
                                )
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
                                setStakingAmount(
                                  round(isStakeIntent ? trilliumBalance : currentToken, 4)
                                )
                              }}
                              _hover={{ bg: Colors.MARINER }}
                              _active={{ bg: Colors.MARINER }}
                            >
                              Max
                            </Button>
                          </HStack>
                        </GridItem>
                      </Grid>

                      {/* STAKE & UNSTAKE BUTTONS */}
                      <Grid
                        templateColumns={[
                          '100%',
                          '100%',
                          '100%',
                          '45% 10% 45%',
                          '45% 10% 45%',
                          '45% 10% 45%',
                        ]}
                        width="100%"
                        gap={2}
                      >
                        <GridItem>
                          <UIButton
                            type="submit"
                            size={currentButtonSize}
                            fontSize={currentBreakpointButtonFontSize}
                            width="100%"
                            variant="primary"
                            leftIcon={<ConvertTKNIcon />}
                            isDisabled={
                              stakingAmount <= 0 ||
                              !stakingAmount ||
                              isStakeIntent ||
                              (errors.amount && errors.amount.length > 0)
                            }
                          >
                            Stake {isStakeIntent ? 'from' : 'to'} TLM
                          </UIButton>
                        </GridItem>
                        <GridItem justifySelf="center">
                          <Box
                            display="flex"
                            justifyContent={[
                              'flex-start',
                              'flex-start',
                              'flex-start',
                              'center',
                              'center',
                            ]}
                            mt={1}
                            ml={2}
                          >
                            <Switch
                              mt={1}
                              isChecked={isStakeIntent}
                              onChange={() => {
                                setIsStakeIntent(!isStakeIntent)
                                setStakingAmount(0)
                                setStakePercentage('')
                              }}
                              outline="none"
                              _active={{ outline: 'none' }}
                              _focus={{
                                boxShadow: 'none',
                                outline: 'none',
                              }}
                              css={css`
                                .chakra-switch__track {
                                  background: ${Colors.CAT_SKILL_WHITE};
                                }
                                .chakra-switch__track[data-checked] {
                                  background: ${Colors.DODGE_BLUE};
                                }
                                .chakra-switch__thumb {
                                  background: ${Colors.BLACK_SOLID_90};
                                }
                                .chakra-switch__thumb[data-checked] {
                                  background: ${Colors.SNOW_WHITE};
                                }
                              `}
                            />
                          </Box>
                        </GridItem>
                        <GridItem>
                          <UIButton
                            type="submit"
                            width="100%"
                            variant="primary"
                            size={currentButtonSize}
                            fontSize={currentBreakpointButtonFontSize}
                            leftIcon={<ConvertTKNIcon />}
                            rightIcon={<PlanetIconRGB planetName={daoDetails?.title} />}
                            isDisabled={
                              stakingAmount <= 0 ||
                              !stakingAmount ||
                              !isStakeIntent ||
                              (errors.amount && errors.amount.length > 0)
                            }
                          >
                            <Text>
                              Stake TLM {isStakeIntent ? 'in' : 'from'}{' '}
                              {capitalize(convertPlanetIdToName(selectedDacId))}
                            </Text>
                          </UIButton>
                        </GridItem>
                      </Grid>
                    </VStack>
                  </form>
                )}
              </Formik>
            </Box>
          </Center>

          {/* PLANET IMAGE */}
          <Box
            position="absolute"
            w={{ base: '100%', md: '30vh', xl: '55vh' }}
            h={{ base: '20vh', md: 'auto' }}
            zIndex={-1}
            top={{ base: null, md: '12vh' }}
            bottom={{ base: 0, md: null }}
            overflow="hidden"
            right={{ base: null, md: 0 }}
            left={{ base: 0, sm: 0, md: 'auto' }}
          >
            <Box
              position="relative"
              w={{ base: '120%', md: '80vh' }}
              marginLeft={{ base: '-10%', md: 0 }}
            >
              <PlanetImage
                dacId={daoDetails.dac_id}
                _hover={{
                  bg: 'transparent',
                }}
                titleDisplay="none"
                imageSize={PlanetImageSizes.LARGE}
              />
            </Box>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
