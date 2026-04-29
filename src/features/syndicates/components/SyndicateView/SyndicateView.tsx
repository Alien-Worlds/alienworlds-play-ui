import { Box, Flex, HStack, VStack } from '@chakra-ui/react'
import { useShowVisitPlanetBtn } from 'features/missions/components/MissionsActions'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner'
import {
  VisitPlanetBtn,
  AddVotePowerBtn,
  ConvertTokenBtn,
  CustodianCentreBtn,
  ManageCandidacyBtn,
  SignMemberTermsBtn,
} from 'features/syndicates/components/PlanetaryActions/PlanetaryActions'
import { PlanetaryBalances } from 'features/syndicates/components/PlanetaryBalances'
import { PlanetaryCandidacy } from 'features/syndicates/components/PlanetaryCandidacy'
import { PlanetaryCustodianBudget } from 'features/syndicates/components/PlanetaryCustodianBudget'
import { PlanetaryVotePower } from 'features/syndicates/components/PlanetaryVotePower'
import { PlanetSelectionSmall } from 'features/syndicates/components/PlanetSelectionSmall/PlanetSelectionSmall'
import { useDaoDetails } from 'graphql/hooks/useDaoDetails'
import { useWalletDaoDetails } from 'graphql/hooks/useWalletDaoDetails'
import { DaoDetailsResponse, DaoWalletDetailsResponse } from 'graphql/types'
import { get, replace, startCase, toNumber } from 'lodash'
import { Colors } from 'shared/util/colors'
import { useScreenSize } from 'shared/util/hooks'
import { useAppState } from 'store'
import { DACUserStatusType } from 'store/wax/types'

export const SyndicateView = () => {
  const {
    wax: { selectedDacId, isDemoUser, walletId },
  } = useAppState()
  const { isMediumScreen, isNotDesktop } = useScreenSize()

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

  const availableTokens = toNumber(
    replace(get(walletDaoDetails, 'stake_details.available_tlm_in_dao', '0'), /[^0-9.-]/g, '')
  )
  const userStatus = startCase(get(walletDaoDetails, 'user_status', 'explorer'))

  const ViewMember = (): JSX.Element => {
    let view: JSX.Element

    if (isNotDesktop) {
      view = (
        <Flex alignItems="center">
          <PlanetaryBalances />
        </Flex>
      )
    } else {
      view = (
        <Flex minW="315px" alignItems="start" pb={3}>
          <PlanetaryBalances />
        </Flex>
      )
    }
    return view
  }

  const ViewCandidate = (): JSX.Element => {
    let view: JSX.Element

    if (isNotDesktop) {
      view = (
        <VStack w="100%" justifyContent="center" alignItems="center">
          <VStack gap={5} alignItems="center">
            <PlanetaryBalances />
            <PlanetaryVotePower />
          </VStack>
          <Flex pt={5} pb={5} alignItems="center">
            <ManageCandidacyBtn isActive selectedDacId={selectedDacId} />
          </Flex>
          <PlanetaryCandidacy />
        </VStack>
      )
    } else {
      view = (
        <HStack>
          <VStack minW="315px" alignItems="start">
            <PlanetaryBalances />
            <PlanetaryVotePower />
          </VStack>
          <Flex>
            <ManageCandidacyBtn isActive selectedDacId={selectedDacId} />
          </Flex>
          <PlanetaryCandidacy />
        </HStack>
      )
    }
    return view
  }

  const ViewCustodian = (): JSX.Element => {
    let view: JSX.Element

    if (isNotDesktop) {
      view = (
        <VStack w="100%" alignItems="center">
          <VStack gap={5} justifyContent="center">
            <PlanetaryBalances />
            <PlanetaryVotePower />
            <PlanetaryCustodianBudget />
          </VStack>
          <VStack pt={5} gap={5} pb={5} alignItems="center">
            <CustodianCentreBtn selectedDacId={selectedDacId} isActive />
            <ManageCandidacyBtn selectedDacId={selectedDacId} />
          </VStack>
          <PlanetaryCandidacy />
        </VStack>
      )
    } else {
      view = (
        <HStack>
          <VStack minW="315px" alignItems="start">
            <PlanetaryBalances />
            <PlanetaryVotePower />
            <PlanetaryCustodianBudget />
          </VStack>
          <VStack gap={5}>
            <CustodianCentreBtn selectedDacId={selectedDacId} isActive />
            <ManageCandidacyBtn selectedDacId={selectedDacId} />
          </VStack>
          <PlanetaryCandidacy />
        </HStack>
      )
    }
    return view
  }

  const PlanetaryView = (): JSX.Element => {
    switch (userStatus) {
      case DACUserStatusType.MEMBER:
        return <ViewMember />
      case DACUserStatusType.CANDIDATE:
        return <ViewCandidate />
      case DACUserStatusType.CUSTODIAN:
        return <ViewCustodian />
      default:
        return <Box h="48px" />
    }
  }

  const PlanetaryActions = (): JSX.Element => {
    return (
      <Flex gap="25px" direction={isMediumScreen ? 'row' : 'column'}>
        {userStatus === DACUserStatusType.EXPLORER && (
          <SignMemberTermsBtn selectedDacId={selectedDacId} />
        )}
        {userStatus === DACUserStatusType.MEMBER && availableTokens === 0 && (
          <ConvertTokenBtn selectedDac={daoDetails} />
        )}
        {userStatus === DACUserStatusType.MEMBER && availableTokens > 0 && <AddVotePowerBtn />}

        {useShowVisitPlanetBtn(userStatus) && <VisitPlanetBtn selectedDac={daoDetails} />}
      </Flex>
    )
  }
  const loading = daoDetailsLoading || walletDaoDetailsLoading
  if (loading) return <LoadingSpinner />

  return (
    <>
      {/* MOBILE VIEW */}
      {isNotDesktop ? (
        <VStack
          gap={5}
          w="100%"
          pb="25px"
          paddingInline={5}
          bg={Colors.MINE_SHAFT}
          h={{ base: isDemoUser ? '920px' : '100%', sm: isDemoUser ? '700px' : '100%' }}
        >
          {/* FIRST SECTION - PLANET SELECTOR */}
          <Flex mt={5} w="100%">
            <PlanetSelectionSmall size="60px" />
          </Flex>
          {/* SECOND SECTION - PLANETARY VIEW */}
          <PlanetaryView />
          {/* THIRD SECTION - ACTIONS */}
          <PlanetaryActions />
        </VStack>
      ) : (
        <>
          {/* DESKTOP VIEW */}
          <HStack
            h="100%"
            w="100%"
            pl="25px"
            alignItems="center"
            justifyContent="start"
            bg={Colors.MINE_SHAFT}
          >
            {/* FIRST SECTION - PLANET SELECTOR */}
            <Flex h="200px" w="410px" alignItems="center">
              <PlanetSelectionSmall />
            </Flex>
            {/* SECOND SECTION - PLANETARY VIEW */}
            <Flex pl={5}>
              <PlanetaryView />
            </Flex>
            {/* THIRD SECTION - ACTIONS */}
            <Flex justifyContent="end" pr="50px" flexGrow={1}>
              <PlanetaryActions />
            </Flex>
          </HStack>
        </>
      )}
    </>
  )
}
