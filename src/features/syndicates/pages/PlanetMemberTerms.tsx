import { useEffect } from 'react'

import { CheckmarkIcon, ReadConstitionIcon } from '@alien-worlds/icons'
import { Button, BUTTON_SIZE } from '@alien-worlds/uikit'
import { Flex, Text, useBreakpointValue } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { GlossaryInfoIcon } from 'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon'
import { TooltipLocations } from 'features/glossary/utils/glossaryConst'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { useDaoDetails } from 'graphql/hooks/useDaoDetails'
import { useWalletDaoDetails } from 'graphql/hooks/useWalletDaoDetails'
import { DaoDetailsResponse, DaoWalletDetailsResponse } from 'graphql/types'
import ReactMarkdown from 'react-markdown'
import { useParams } from 'react-router'
import { useGetMemberTerms } from 'shared/hooks/queries/wax/useGetMemberTerms'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'
import { SigningDACTermsState } from 'store/main/state'

const ReactMarkdownWrapper = styled(ReactMarkdown)(() => ({
  ul: {
    padding: '10px 20px',
  },
}))

export const PlanetMemberTerms = ({ isModal = false }) => {
  const {
    wax: { signPlanetMemberTerms },
    modal: { setPrimaryModalActive },
    main: { showGovernanceMemberTerms },
  } = useActions()
  const {
    main: { signingDACTermsState },
    wax: { selectedDacId, isDemoUser, walletId },
  } = useAppState()
  const {
    walletDaoDetails,
    loading: walletDaoDetailsLoading,
  }: { walletDaoDetails: DaoWalletDetailsResponse; loading: boolean } = useWalletDaoDetails({
    dacId: selectedDacId,
    walletId,
  })
  const {
    daoDetails,
    loading: daoDetailsLoading,
  }: { daoDetails: DaoDetailsResponse; loading: boolean } = useDaoDetails(selectedDacId)
  const { planetId } = useParams()

  async function signMemberTerms() {
    await signPlanetMemberTerms(selectedDacId)
  }

  useEffect(() => {
    showGovernanceMemberTerms(planetId)
  }, [planetId])
  const currentButtonSize: keyof typeof BUTTON_SIZE = useBreakpointValue({
    base: 'md',
    sm: 'md',
    md: 'lg',
  })

  const { data: memberTermsText }: any = useGetMemberTerms(daoDetails?.member_terms?.terms)

  if (daoDetailsLoading || walletDaoDetailsLoading) return <LoadingSpinner />
  const currentPlanetMemberTermsVersion = daoDetails?.member_terms.version
  const hasSignedCurrentDaoTerms =
    daoDetails?.member_terms.version === walletDaoDetails?.agreed_terms_version

  return (
    <>
      <Flex
        mt={isModal ? 0 : 6}
        width="100%"
        padding="30px"
        flexDirection="column"
        bg={Colors.BLACK_SOLID_65}
        position="relative"
      >
        <GlossaryInfoIcon
          width={20}
          height={20}
          color={Colors.SNOW_WHITE}
          glossaryId={TooltipLocations.GOVERNANCE_MEMBER_TERMS}
          style={{ right: 10, top: 10, position: 'absolute' }}
        />

        {/* HEADER */}
        <Flex>
          <Flex flexDirection="column" overflowWrap="break-word">
            <Text
              fontSize="3xl"
              fontFamily="Titillium Web"
              lineHeight="1.33"
              color="white"
              textAlign="center"
            >
              Member Terms of {daoDetails?.title}
            </Text>
            <Text
              fontSize="sm"
              fontFamily="Titillium Web"
              lineHeight="1.33"
              color="#d9a555"
              textAlign="center"
              width="max-content"
            >
              Version {currentPlanetMemberTermsVersion}
            </Text>
          </Flex>
        </Flex>

        {/* TEXT */}
        <Flex flexDirection="column" textAlign="start" marginTop="20px">
          <>
            <ReactMarkdownWrapper>{memberTermsText}</ReactMarkdownWrapper>
          </>

          <Flex mt={10} justifyContent="center" pb="20px">
            {signingDACTermsState === SigningDACTermsState.Unknown && !hasSignedCurrentDaoTerms && (
              <Button
                leftIcon={<ReadConstitionIcon boxSize={18} />}
                variant="primary"
                size={currentButtonSize}
                fontSize={18}
                onClick={() => {
                  if (isDemoUser) {
                    setPrimaryModalActive({ modalName: 'LoginModal', value: true })
                  } else {
                    signMemberTerms()
                  }
                }}
              >
                Sign Member Terms
              </Button>
            )}

            {signingDACTermsState === SigningDACTermsState.Unknown && hasSignedCurrentDaoTerms && (
              <Button
                leftIcon={<CheckmarkIcon color={Colors.OCEAN_GREEN} />}
                variant="info"
                size={currentButtonSize}
                fontSize={18}
                pointerEvents="none"
              >
                Member Terms signed
              </Button>
            )}

            {signingDACTermsState === SigningDACTermsState.Signing && !hasSignedCurrentDaoTerms && (
              <Button
                isLoading
                variant="primary"
                size={currentButtonSize}
                fontSize={18}
                pointerEvents="none"
              >
                Signing Member Terms..
              </Button>
            )}
          </Flex>
        </Flex>
      </Flex>
    </>
  )
}
