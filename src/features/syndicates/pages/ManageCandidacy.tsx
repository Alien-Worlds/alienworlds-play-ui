import { useState, useEffect } from 'react'

import { CheckIcon2, CustodianIcon, LogoutIcon } from '@alien-worlds/icons'
import { Button, FormField, LevelRing } from '@alien-worlds/uikit'
import { Box, Flex, HStack, VStack, Text, Textarea, css } from '@chakra-ui/react'
import { useLevelNftRewards } from 'features/outpost/hooks/queries/useLevelNftRewards'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { MemberTermsStatusBadge } from 'features/syndicates/components/MemberTermsStatusBadge/MemberTermsStatusBadge'
import { CandidacyProposalType } from 'features/syndicates/types/governanceTypes'
import { Formik } from 'formik'
import { useDaoDetails } from 'graphql/hooks/useDaoDetails'
import { useWalletDaoDetails } from 'graphql/hooks/useWalletDaoDetails'
import { Candidate, DaoDetailsResponse, DaoWalletDetailsResponse } from 'graphql/types'
import { find, get, startCase } from 'lodash'
import { useParams } from 'react-router-dom'
import { Colors } from 'shared/util/colors'
import { useScreenSize } from 'shared/util/hooks'
import { getLevelVariant, maleHumanAvatar } from 'shared/util/nft'
import { formatNumber } from 'shared/util/numbers'
import { useActions, useAppState } from 'store'
import { DACUserStatusType } from 'store/wax/types'

import { Constants } from '../../../shared/util/constants'
export const ManageCandidacy = () => {
  const {
    wax: { walletId, selectedDacId, player, currentTag },
  } = useAppState()
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
    wax: { updateCandidate, activateNewCandidate, updateCandidancyProposal },
    modal: { setPrimaryModalActive, setSecondaryModalActive },
    main: { showGovernanceManageCandidacyPage },
  } = useActions()
  const { currentLevelReward } = useLevelNftRewards()
  const [formReady, setFormReady] = useState(false)

  const [candidateURL, setCandidateURL] = useState<string>('')
  const [candidateName, setCandidateName] = useState<string>('')
  const [candidateMessage, setCandidateMessage] = useState<string>('')

  const { isMobile } = useScreenSize()
  const { planetId } = useParams()

  useEffect(() => {
    showGovernanceManageCandidacyPage(planetId)
  }, [])

  const validateField = (field: string, value: string) => {
    let status: string

    switch (field) {
      case 'name':
        if (value?.length < 3) {
          status = 'Min. 3 characters required'
        }
        break
      case 'url':
        if (value?.length === 0) {
          status = 'Enter a valid url'
        }
        break
      case 'msg':
        if (value?.length < 10) {
          status = 'Min. 10 characters required'
        }
        break
      default:
        break
    }

    return status
  }

  function getParsedProfile() {
    const unparsedProfile = {
      image: candidateURL,
      givenName: candidateName,
      description: candidateMessage,
    }

    return JSON.stringify(unparsedProfile)
  }

  useEffect(() => {
    if (currentTag) {
      setCandidateName(currentTag)
    } else {
      setCandidateName(player?.tag)
    }
  }, [player?.tag, currentTag])

  function generateCandidateProposal() {
    const parsedProfile = getParsedProfile()

    const candidacyProposal: CandidacyProposalType = {
      hash: 'NA',
      wallet: walletId,
      reqpay: '0.0000 TLM',
      dacName: selectedDacId,
      isCandidateActive: true,
      candidate: parsedProfile,
    }
    return candidacyProposal
  }

  const onConfirmUpdateProfile = async () => {
    const candidacyProposal = generateCandidateProposal()
    await updateCandidate(candidacyProposal)
  }

  async function updateProfile() {
    if (!formReady) return

    setSecondaryModalActive({
      modalName: 'BlockchainSubmitDisclaimerModal',
      value: true,
      onConfirm: onConfirmUpdateProfile,
    })
  }

  async function withdrawCandidacy() {
    if (!formReady) return

    updateCandidancyProposal(generateCandidateProposal())
    setPrimaryModalActive({ modalName: 'WithDrawCandidancyModal', value: true })
  }

  async function activateCandidacy() {
    if (!formReady) return
    const candidacyProposal = generateCandidateProposal()
    await activateNewCandidate(candidacyProposal)
  }
  const candidate: Candidate = find(get(daoDetails, 'candidates.candidates', []), {
    candidate_name: walletId,
  })

  useEffect(() => {
    if ((candidate && !candidateMessage) || candidate?.profile?.description !== candidateMessage) {
      setCandidateMessage(candidate?.profile?.description)

      setCandidateURL(candidate?.profile?.image)
    }
  }, [candidate, candidateMessage])
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
  if (walletDaoDetailsLoading || daoDetailsLoading) return <LoadingSpinner />
  const isCandidateTermsSigned =
    get(walletDaoDetails, 'agreed_terms_version', 0) === get(daoDetails, 'member_terms.version', -1)

  return (
    <>
      <Flex
        p="45px"
        h="100%"
        mt={6}
        bg={Colors.BLACK_SOLID_65}
        gap={5}
        justifyContent="space-evenly"
        wrap="wrap"
      >
        {/* LEFT SECTION */}
        <Flex alignItems="center" flexDirection="column" flex="1 0 300px">
          <Text
            mb={45}
            color="white"
            fontSize={24}
            fontWeight={400}
            lineHeight="37px"
            fontFamily="Orbitron"
          >
            {walletId}
          </Text>
          <Box justifyContent="center" display="flex" mb="20px">
            <MemberTermsStatusBadge isTermsSigned={isCandidateTermsSigned} positionOffset={3}>
              <LevelRing
                variant={getLevelVariant(currentLevelReward?.level)}
                src={candidateURL || Constants.DEFAULT_PROFILE_IMAGE_URL}
                radius={8.5}
                fallbackSrc={maleHumanAvatar}
              />
            </MemberTermsStatusBadge>
          </Box>

          <Flex w="100%" justifyContent="space-evenly">
            <VStack gap={0} minW="85px">
              <Text fontFamily="Titillium Web" fontSize={17} color={Colors.GRAY_CHATEAU}>
                Total Votes
              </Text>
              <Text
                fontFamily="Orbitron"
                fontSize={20}
                color={Colors.SNOW_WHITE}
                style={{ marginTop: 0 }}
              >
                {candidate?.number_voters}
              </Text>
            </VStack>
            <VStack>
              <Text fontFamily="Titillium Web" fontSize={17} color={Colors.GRAY_CHATEAU}>
                Vote Decay
              </Text>
              <Text
                fontFamily="Orbitron"
                fontSize={20}
                color={Colors.CORN}
                style={{ marginTop: 0 }}
              >
                {candidate?.voteDecay || 0}
                <span
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    fontFamily: 'Titillium Web',
                    position: 'relative',
                    top: -2,
                    left: 3,
                  }}
                >
                  Days
                </span>
              </Text>
            </VStack>
          </Flex>
          <VStack justifySelf="baseline" mt="30px">
            <Text fontFamily="Titillium Web" fontSize={17} color={Colors.GRAY_CHATEAU}>
              Received Vote Power
            </Text>
            <Text
              fontFamily="Orbitron"
              fontSize={28}
              color={Colors.CARIBBEAN_GREEN}
              style={{ marginTop: 0 }}
            >
              {formatNumber(candidate?.total_vote_power, 0, 0)}
            </Text>
          </VStack>
        </Flex>

        {/* MIDDLE SECTION */}
        <Flex alignItems="start" flexDirection="column" flexGrow={5}>
          <Formik
            initialValues={{
              name: '',
              url: '',
              message: '',
            }}
            onSubmit={() => {
              updateProfile()
            }}
          >
            {({ handleSubmit, setErrors }) => (
              <form onSubmit={handleSubmit} style={{ width: '100%' }} onChange={() => {}}>
                <Box mb="25px">
                  {/* NAME */}
                  <VStack>
                    <Text
                      w="100%"
                      mb="-5px"
                      minW={150}
                      fontSize={20}
                      fontWeight={400}
                      fontFamily="Orbitron"
                      color={Colors.DI_SERRIA}
                    >
                      Candidate Name:
                    </Text>
                    {/* Disabled field as CandidacyName is not editable anymore */}
                    <FormField
                      size="lg"
                      name="name"
                      margin="auto"
                      type="string"
                      disabled
                      width="100%"
                      placeholder=""
                      fontSize={16}
                      minWidth={244}
                      minHeight={42}
                      borderWidth={2}
                      fontWeight={700}
                      fontFamily="Titillium Web"
                      value={candidateName ?? ''}
                      borderColor={Colors.SILVER}
                      color={Colors.GRAY_CHATEAU}
                      validate={() => validateField('name', candidateName)}
                      onChange={({ target: { value } }) => {
                        setCandidateName(value)
                        setErrors({})
                      }}
                    />
                  </VStack>

                  {/* URL */}
                  <VStack mt="20px">
                    <Text
                      w="100%"
                      mb="-5px"
                      minW={150}
                      fontSize={20}
                      fontWeight={400}
                      fontFamily="Orbitron"
                      color={Colors.DI_SERRIA}
                    >
                      Profile URL:
                    </Text>
                    {/* Disabled field as CandidacyURL is not editable anymore */}
                    <FormField
                      size="lg"
                      name="url"
                      type="string"
                      placeholder=""
                      width="100%"
                      margin="auto"
                      fontSize={16}
                      minWidth={244}
                      minHeight={42}
                      borderWidth={2}
                      disabled
                      fontWeight={700}
                      fontFamily="Titillium Web"
                      value={candidateURL || Constants.DEFAULT_PROFILE_IMAGE_URL}
                      borderColor={Colors.SILVER}
                      color={Colors.GRAY_CHATEAU}
                      validate={() => validateField('url', candidateURL)}
                      onChange={({ target: { value } }) => {
                        setCandidateURL(value)
                        setErrors({})
                      }}
                    />
                  </VStack>

                  {/* MSG */}
                  <VStack mt="20px">
                    <Text
                      w="100%"
                      minW={150}
                      fontSize={20}
                      fontWeight={400}
                      fontFamily="Orbitron"
                      color={Colors.DI_SERRIA}
                    >
                      Candidate Message:
                    </Text>
                    <Textarea
                      size="lg"
                      h="200px"
                      css={css({
                        scrollbarWidth: 'none',
                        overflowScrolling: 'touch',
                        '::-webkit-scrollbar': { display: 'none' },
                        boxShadow: Colors.TEXT_SHADOW_ALPHA_25,
                      })}
                      // type="string"
                      name="message"
                      margin="auto"
                      placeholder=""
                      fontSize={16}
                      minWidth={244}
                      minHeight="100px"
                      borderWidth={2}
                      fontWeight={700}
                      borderRadius="25px"
                      fontFamily="Titillium Web"
                      value={candidateMessage ?? ''}
                      borderColor={Colors.SILVER}
                      textColor={Colors.GRAY_CHATEAU}
                      onChange={({ target: { value } }) => {
                        setCandidateMessage(value)
                        setErrors({})
                      }}
                    />
                    <Text
                      w="100%"
                      mb="-5px"
                      minW={150}
                      fontSize={12}
                      textAlign="end"
                      fontWeight={300}
                      fontFamily="Orbitron"
                      color={Colors.GRAY_CHATEAU}
                    >
                      {candidateMessage?.length} characters
                    </Text>
                  </VStack>
                </Box>

                <HStack gap={4} width="100%" display="flex" justifyContent="start">
                  <Button
                    size="sm"
                    variant="helium"
                    onClick={() => updateProfile()}
                    disabled={!formReady}
                  >
                    Update Profile
                  </Button>
                </HStack>
              </form>
            )}
          </Formik>
        </Flex>

        {/* RIGHT SECTION */}
        <Flex alignItems="end" flexDirection="column" flex="1 0 270px" w="full" pt={10}>
          {startCase(get(walletDaoDetails, 'user_status', 'none')) ===
            DACUserStatusType.CANDIDATE && (
            <>
              {candidate.is_active ? (
                <Flex flexDirection="row" w="full" gap="65px" wrap="wrap">
                  <Flex p="6px" justifyContent={isMobile ? 'center' : 'end'} flex="1 0 170px">
                    <CheckIcon2
                      color={Colors.SECONDARY_GREEN}
                      style={{ width: 20, height: 20, marginRight: 5 }}
                    />
                    <Text
                      as="span"
                      fontSize={16}
                      fontWeight={500}
                      letterSpacing="1px"
                      fontFamily="tlm"
                      color={Colors.SECONDARY_GREEN}
                    >
                      Active Candidacy
                    </Text>
                  </Flex>

                  <Flex p="6px" justifyContent={isMobile ? 'center' : 'end'} flex="1 0 170px">
                    <Button
                      size="sm"
                      variant="alert"
                      backgroundColor={Colors.SECONDARY_RED}
                      onClick={() => withdrawCandidacy()}
                      leftIcon={
                        <LogoutIcon
                          color={Colors.SNOW_WHITE}
                          style={{ width: 20, height: 20, marginRight: -5 }}
                        />
                      }
                    >
                      <Text
                        fontSize={16}
                        fontWeight={400}
                        fontFamily="tlm"
                        fontStyle="normal"
                        textShadow={Colors.TEXT_SHADOW_ALPHA_25}
                      >
                        Withdraw Candidacy
                      </Text>
                    </Button>
                  </Flex>
                </Flex>
              ) : (
                <Flex>
                  <Button
                    size="sm"
                    variant="lithium"
                    onClick={() => activateCandidacy()}
                    width={isMobile ? '100%' : 'auto'}
                  >
                    <Text
                      fontSize={16}
                      fontWeight={400}
                      fontFamily="tlm"
                      fontStyle="normal"
                      textShadow={Colors.TEXT_SHADOW_ALPHA_25}
                    >
                      Activate Candidacy
                    </Text>
                  </Button>
                </Flex>
              )}
            </>
          )}

          {startCase(get(walletDaoDetails, 'user_status', 'none')) ===
            DACUserStatusType.CUSTODIAN && (
            <Flex flexDirection="row" w="full" gap="65px" wrap="wrap">
              <Flex p="6px" justifyContent={isMobile ? 'center' : 'end'} flex="1 0 170px">
                <CustodianIcon
                  color={Colors.DODGE_BLUE}
                  style={{ width: 20, height: 20, marginRight: 5, marginTop: 3 }}
                />
                <Text
                  as="span"
                  fontSize={16}
                  fontWeight={500}
                  letterSpacing="1px"
                  fontFamily="tlm"
                  color={Colors.DODGE_BLUE}
                >
                  Active custodian
                </Text>
              </Flex>
            </Flex>
          )}
        </Flex>
      </Flex>
    </>
  )
}
