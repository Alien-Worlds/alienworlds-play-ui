import { useState, useEffect } from 'react'

import { Button, BUTTON_SIZE } from '@alien-worlds/uikit'
import {
  Box,
  Flex,
  Divider,
  Text,
  Textarea,
  Grid,
  GridItem,
  HStack,
  Show,
  useBreakpointValue,
} from '@chakra-ui/react'
import styled from '@emotion/styled/macro'
import { GlossaryInfoIcon } from 'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon'
import { TooltipLocations } from 'features/glossary/utils/glossaryConst'
import { CouncilCandidateNotice } from 'features/syndicates/components/CouncilCandidateNotice/CouncilCandidateNotice'
import { CandidacyProposalType } from 'features/syndicates/types/governanceTypes'
import { Formik } from 'formik'
import { useDaoDetails } from 'graphql/hooks/useDaoDetails'
import { useDaoGlobals } from 'graphql/hooks/useDaoGlobals'
import { useWalletDaoDetails } from 'graphql/hooks/useWalletDaoDetails'
import { useWalletDetails } from 'graphql/hooks/useWalletDetails'
import {
  DaoDetailsResponse,
  DaoGlobalsResponse,
  DaoWalletDetailsResponse,
  WalletDetailsResponse,
} from 'graphql/types'
import { capitalize, get, replace, toNumber, trim } from 'lodash'
import { useParams } from 'react-router'
import { PlayerAvatar } from 'shared/components/topbar/PlayerAvatar'
import { Colors } from 'shared/util/colors'
import { convertPlanetIdToName, isUnionDAO } from 'shared/util/helpers'
import { PlanetIcon } from 'shared/util/icons'
import { getNftImage } from 'shared/util/nft'
import { formatNumber } from 'shared/util/numbers'
import { useActions, useAppState } from 'store'

import { Constants } from '../../../shared/util/constants'

const iconStyle: any = {
  width: 48,
  height: 48,
}

const FormGroupWrapper = styled(Flex)(() => ({
  alignItems: 'start',
  flexDirection: 'row',
  justifyContent: 'center',
  flexWrap: 'wrap',
  padding: '5px 0 5px 0',
  columnGap: 30,

  '> *:first-of-type': {
    flex: '1 0 210px',
  },
  '> *:last-child': {
    flex: '2 0 auto',
  },
}))

export const BecomeCandidate = () => {
  const {
    main: { showGovernanceBecomeCandidatePage },
    modal: { setPrimaryModalActive, setSecondaryModalActive },
    wax: { setDacCandidacyProposalPayload, checkWhitelist },
  } = useActions()
  const {
    wax: { walletId, isDemoUser, currentTag, selectedDacId },
    atomic: { avatarAsset },
  } = useAppState()
  const { planetId } = useParams()
  const [formReady, setFormReady] = useState(false)
  const [candidateName, setCandidateName] = useState<string>('')
  const [candidateMessage, setCandidateMessage] = useState<string>('')

  const { walletDetails }: { walletDetails: WalletDetailsResponse; loading: boolean } =
    useWalletDetails(walletId)

  const { daoDetails }: { daoDetails: DaoDetailsResponse } = useDaoDetails(selectedDacId)

  const { walletDaoDetails }: { walletDaoDetails: DaoWalletDetailsResponse } = useWalletDaoDetails({
    dacId: selectedDacId,
    walletId,
  })
  const { daoGlobals }: { daoGlobals: DaoGlobalsResponse } = useDaoGlobals(selectedDacId)
  const availableBalance = toNumber(
    replace(get(walletDaoDetails, 'stake_details.available_tlm_in_dao', '0'), /[^0-9.-]/g, '')
  )
  const currentMemberTermsVersion = get(daoDetails, 'member_terms.version', 0)
  const hasSignedCurrentDaoTerms =
    get(walletDaoDetails, 'agreed_terms_version', 0) === currentMemberTermsVersion

  useEffect(() => {
    if (isUnionDAO(selectedDacId)) checkWhitelist(selectedDacId)
    showGovernanceBecomeCandidatePage(planetId)
  }, [planetId, showGovernanceBecomeCandidatePage])

  function getParsedProfile() {
    const unparsedProfile = {
      image: trim(getNftImage(avatarAsset)),
      givenName: candidateName,
      description: trim(candidateMessage),
    }

    return JSON.stringify(unparsedProfile)
  }

  const onConfirmRegisterCandidacy = () => {
    const candidate = getParsedProfile()

    const candidacyProposal: CandidacyProposalType = {
      candidate,
      hash: 'NA',
      wallet: walletId,
      reqpay: '0.0000 TLM',
      dacName: selectedDacId,
      isCandidateActive: false,
    }

    setDacCandidacyProposalPayload(candidacyProposal)
    setPrimaryModalActive({ modalName: 'LockCandidancyModal', value: true })
  }

  async function registerCandidacy() {
    if (isDemoUser) {
      setPrimaryModalActive({ modalName: 'LoginModal', value: true })
      return
    }

    if (!formReady) {
      return
    }
    const isWhiteListed = checkWhitelist(planetId || selectedDacId)
    if (!isWhiteListed && isUnionDAO(selectedDacId)) {
      setSecondaryModalActive({ modalName: 'UserWhiteListModal', value: true })

      return
    }
    if (!hasSignedCurrentDaoTerms) {
      setSecondaryModalActive({ modalName: 'NotSignedMemberTermsModal', value: true })

      return
    }

    const stakedBalance = toNumber(
      replace(get(walletDaoDetails, 'stake_details.staked_amount', ''), /[^0-9.-]/g, '')
    )

    const lockupAsset = toNumber(
      replace(get(daoGlobals, 'lockupasset.quantity', '0'), /[^0-9.-]/g, '')
    )

    if (availableBalance > 0 && stakedBalance > 0 && lockupAsset - stakedBalance > 0) {
      setPrimaryModalActive({ modalName: 'AddStakingVotePower', value: true })
      return
    }
    if (availableBalance > 0 && stakedBalance === 0) {
      setPrimaryModalActive({ modalName: 'StakingVotePower', value: true })
      return
    }
    if (lockupAsset - stakedBalance > 0) {
      setSecondaryModalActive({ modalName: 'NotEnoughTokensToBecomeCandidateModal', value: true })

      return
    }

    setSecondaryModalActive({
      modalName: 'BlockchainSubmitDisclaimerModal',
      value: true,
      onConfirm: onConfirmRegisterCandidacy,
    })
  }

  useEffect(() => {
    if (candidateMessage?.length > 0) {
      setFormReady(true)
    } else {
      setFormReady(false)
    }
    return () => {
      setFormReady(false)
    }
  }, [candidateMessage])

  useEffect(() => {
    if (currentTag) {
      setCandidateName(currentTag)
    } else {
      setCandidateName(walletDetails?.tag)
    }
  }, [walletDetails, currentTag])

  useEffect(() => {
    setDacCandidacyProposalPayload(null)
  }, [])
  const currentBreakpointButtonSize: keyof typeof BUTTON_SIZE = useBreakpointValue({
    base: 'lg',
    lg: 'lg',
  })
  const currentBreakpointButtonFontSize = useBreakpointValue({
    base: 20,
    lg: 22,
  })
  return (
    <>
      <Flex
        p={{ base: '5px', sm: '30px' }}
        mt={6}
        mb="150px"
        bg={Colors.BLACK_SOLID_65}
        flexDirection="row"
        gap={10}
      >
        {/* LEFT SECTION */}
        <Grid
          gap={12}
          w="100%"
          gridTemplateColumns={{ base: 'repeat(1,1fr)', '2xl': 'repeat(2,1fr)' }}
        >
          <GridItem w="100%">
            <Flex alignItems="start" flexDirection="column" gap={2}>
              <Flex direction="row" gap={2} padding={{ base: 4, sm: 0 }}>
                <Text
                  fontSize="3xl"
                  fontFamily="Titillium Web"
                  lineHeight="1.33"
                  color={Colors.DI_SERRIA}
                >
                  Create Candidacy
                </Text>
                <Flex pt="12px">
                  <GlossaryInfoIcon
                    boxSize={20}
                    color={Colors.GRAY_CHATEAU}
                    glossaryId={TooltipLocations.GOVERNANCE_BECOME_CANDIDATE}
                  />
                </Flex>
              </Flex>
              <Grid
                gridTemplateColumns={{ base: 'repeat(1,1fr)', xl: 'repeat(2,1fr)' }}
                w="100%"
                paddingInline="15px"
                justifyItems="center"
                alignItems="center"
                gap={{ base: 8, md: 4 }}
              >
                <GridItem>
                  <Box>
                    <PlayerAvatar showVerification size={9} showLevelRing />
                  </Box>
                </GridItem>
                <GridItem>
                  <Flex direction="column" pt={{ base: '0px', xl: '25px' }}>
                    <Flex direction="column" justifyItems="center" alignItems="center">
                      <Text
                        fontSize={{ base: 18, md: 22, lg: 24 }}
                        fontWeight={700}
                        fontFamily="Titillium Web"
                        color={Colors.GRAY_CHATEAU}
                      >
                        {candidateName ?? ''}
                      </Text>
                      <Text
                        color={Colors.DI_SERRIA}
                        fontSize={{ base: 12, md: 14, lg: 16 }}
                        fontWeight={400}
                        fontFamily="Orbitron"
                      >
                        {isDemoUser ? Constants.DEMO_ACCOUNT_TAG : walletId}
                      </Text>
                    </Flex>
                    <Divider mt={{ base: 8, sm: 4 }} />
                    <Flex mt="16px" gap={4}>
                      <PlanetIcon planetName={daoDetails?.title} style={iconStyle} />
                      <Flex direction="column" textAlign="center">
                        <HStack justifyContent="center" alignItems="baseline">
                          <Text
                            fontFamily="Orbitron"
                            fontSize={{ base: 16, md: 18, lg: 20 }}
                            fontWeight={600}
                            background={Colors.SNOW_WHITE}
                            backgroundClip="text"
                          >
                            {formatNumber(availableBalance, 4, 4)}
                          </Text>
                          <Text
                            fontFamily="Titillium Web"
                            fontSize={16}
                            background={Colors.Gradient1}
                            backgroundClip="text"
                            fontWeight={400}
                            marginTop="20px"
                          >
                            TLM
                          </Text>
                        </HStack>
                        <Text fontFamily="Titillium Web" fontSize={16} fontWeight={400}>
                          Available TLM in {capitalize(convertPlanetIdToName(selectedDacId))}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </GridItem>
              </Grid>

              <Formik
                initialValues={{
                  amount: '',
                }}
                onSubmit={() => {
                  registerCandidacy()
                }}
              >
                {({ handleSubmit, setErrors }) => (
                  <form onSubmit={handleSubmit} onChange={() => {}} style={{ width: '100%' }}>
                    <Flex
                      gap={4}
                      direction="column"
                      w={{ base: '90%', xs: '100%', sm: '100%' }}
                      justifyContent="center"
                    >
                      <Box>
                        <FormGroupWrapper>
                          <Flex flexDirection="column" alignItems="start" w="100%">
                            <Text
                              color="white"
                              fontSize={18}
                              fontWeight={500}
                              fontFamily="tlm"
                              pl="10px"
                            >
                              Candidacy Message:
                            </Text>
                            <Box w="100%">
                              <Textarea
                                margin="0px"
                                minW={{ base: '250px', sm: '100%' }}
                                size="lg"
                                // type="string"
                                height="250px"
                                name="message"
                                placeholder="Type here..."
                                marginTop="10px"
                                fontSize={16}
                                minHeight={42}
                                borderWidth={2}
                                fontWeight={500}
                                borderRadius="25px"
                                fontFamily="tlm"
                                value={candidateMessage ?? ''}
                                borderColor={Colors.SILVER}
                                textColor={Colors.GRAY_CHATEAU}
                                onChange={({ target: { value } }) => {
                                  setCandidateMessage(value)
                                  setErrors({})
                                }}
                              />
                            </Box>
                          </Flex>
                        </FormGroupWrapper>
                      </Box>
                      <Show below="xl">
                        <CouncilCandidateNotice />
                      </Show>
                      <Flex pb={{ base: '30px', sm: '5px', md: '0px' }}>
                        <Button
                          disabled={!formReady}
                          size={currentBreakpointButtonSize}
                          isFullWidth
                          type="submit"
                          fontSize={currentBreakpointButtonFontSize}
                          variant="primary"
                          fontFamily="Titillium Web"
                          lineHeight="30px"
                        >
                          Become a Candidate
                        </Button>
                      </Flex>
                    </Flex>
                  </form>
                )}
              </Formik>
            </Flex>
          </GridItem>
          {/* RIGHT SECTION */}
          <Show above="xl">
            <GridItem>
              <CouncilCandidateNotice />
            </GridItem>
          </Show>
        </Grid>
      </Flex>
    </>
  )
}
