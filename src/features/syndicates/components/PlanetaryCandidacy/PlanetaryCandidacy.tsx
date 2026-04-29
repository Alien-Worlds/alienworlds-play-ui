import { VFC } from 'react'

import { Flex, HStack, VStack } from '@chakra-ui/react'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner'
import { PlanetaryName } from 'features/syndicates/components/PlanetaryName'
import { PlanetaryRank } from 'features/syndicates/components/PlanetaryRank'
import { PlanetaryScore } from 'features/syndicates/components/PlanetaryScore'
import { PlanetaryTotalVotes } from 'features/syndicates/components/PlanetaryTotalVotes'
import { PlanetaryVoteDecay } from 'features/syndicates/components/PlanetaryVoteDecay'
import { PlanetaryVotePowerReceived } from 'features/syndicates/components/PlanetaryVotePowerReceived'
import { useDaoDetails } from 'graphql/hooks/useDaoDetails'
import { Candidate, DaoDetailsResponse } from 'graphql/types'
import { find, get } from 'lodash'
import { useScreenSize } from 'shared/util/hooks'
import { useAppState } from 'store'

export const PlanetaryCandidacy: VFC = () => {
  const {
    wax: { walletId, selectedDacId },
    atomic: { avatarAsset },
  } = useAppState()

  const { isLargeScreen, isMediumScreen, isNotDesktop } = useScreenSize()

  const {
    daoDetails,
    loading: daoDetailsLoading,
  }: { daoDetails: DaoDetailsResponse; loading: boolean } = useDaoDetails(selectedDacId)

  const selectedDacCandidatesByRank = get(daoDetails, 'candidates.candidates', [])
  const candidateProfile: Candidate = find(
    selectedDacCandidatesByRank,
    (candidate: Candidate) => candidate.candidate_name === walletId
  )

  const currentMemberTermsVersion = get(daoDetails, 'member_terms.version', 0)
  const hasSignedCurrentDaoTerms =
    candidateProfile.member_terms_version === currentMemberTermsVersion

  if (daoDetailsLoading) {
    return <LoadingSpinner />
  }
  return (
    <>
      {/* MOBILE VIEW */}
      {isNotDesktop ? (
        <VStack padding={4} justifyContent="start">
          {/* FIRST ROW */}
          <VStack w="100%" flexWrap="wrap" justifyContent="space-between">
            <PlanetaryRank isTermsSigned={hasSignedCurrentDaoTerms} avatar={avatarAsset} />
            <PlanetaryName
              name={candidateProfile?.flagged ? 'Flagged' : candidateProfile?.profile.givenName}
            />
          </VStack>
          {/* SECOND ROW */}
          <VStack paddingBlock="10px" alignItems="start" rowGap="15px">
            <PlanetaryScore score={candidateProfile.rank} />
            <HStack flexWrap="wrap" gap="5px" alignItems="start">
              <PlanetaryVotePowerReceived />
              <PlanetaryVoteDecay voteDecay={candidateProfile.voteDecay} />
              <PlanetaryTotalVotes votes={candidateProfile.number_voters} />
            </HStack>
          </VStack>
        </VStack>
      ) : (
        <>
          {/* DESKTOP VIEW */}
          <HStack>
            {(isNotDesktop || isLargeScreen) && (
              <Flex pl={5}>
                <PlanetaryRank isTermsSigned={hasSignedCurrentDaoTerms} avatar={avatarAsset} />
              </Flex>
            )}

            <HStack w="100%" h="100%" alignItems="start" justifyContent="start">
              <VStack
                h="100%"
                minW="215px"
                gap="10px"
                flexWrap="wrap"
                alignItems="start"
                justifyContent="space-evenly"
              >
                {/* FIRST ROW */}
                <HStack
                  pl={1}
                  w="100%"
                  flexWrap="wrap"
                  alignItems="start"
                  justifyContent="space-between"
                >
                  <PlanetaryName
                    name={candidateProfile?.flagged ? '' : candidateProfile?.profile.givenName}
                  />
                  <PlanetaryVotePowerReceived />
                </HStack>
                {/* SECOND ROW */}
                <HStack
                  pl={1}
                  w="100%"
                  flexWrap="wrap"
                  alignItems="start"
                  justifyContent="space-between"
                >
                  <PlanetaryScore score={candidateProfile?.rank} />
                  <PlanetaryVoteDecay voteDecay={candidateProfile?.voteDecay} />
                  {isMediumScreen && (
                    <PlanetaryTotalVotes votes={candidateProfile?.number_voters} />
                  )}
                </HStack>
              </VStack>
            </HStack>
          </HStack>
        </>
      )}
    </>
  )
}
