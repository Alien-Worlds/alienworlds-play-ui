import { PlaceRing } from '@alien-worlds/uikit'
import { Box, Flex, Grid, GridItem, HStack, Text } from '@chakra-ui/react'
import { ProposalsTableVirtualised } from 'features/syndicates/components/ProposalsTableVirtualised/ProposalsTableVirtualised'
import { VoteButtonStates } from 'features/syndicates/types/governanceTypes'
import { VoteButton } from 'features/syndicates/utils/GovernanceHelper'
import { Candidate } from 'graphql/types'
import { Colors } from 'shared/util/colors'
import {
  fallbackAvatarSrc,
  getDacPlaceRingVariantByPlace,
  getVoteDecayColor,
  pluralize,
} from 'shared/util/helpers'
import { formatNumber } from 'shared/util/numbers'

type CandidateCardProps = {
  selectedCandidate: Candidate
  addOrRemoveVoteSelection: (candidate: Candidate) => void
  CandidateButtonState: (candidate: Candidate) => VoteButtonStates
}

export const CandidateCard = ({
  selectedCandidate,
  addOrRemoveVoteSelection,
  CandidateButtonState,
}: CandidateCardProps) => {
  return (
    <>
      <Box w="100%" backgroundColor={Colors.BLACK_SOLID_65} padding={4}>
        <HStack justifyContent="center" flexWrap="wrap">
          <Flex justifyContent="center" mt={{ base: 2, md: 6 }} mr="25px" ml="20px">
            <PlaceRing
              variant={getDacPlaceRingVariantByPlace(selectedCandidate?.rankIndex + 1)}
              isOrnament
              rankText={(selectedCandidate.rankIndex + 1).toString()}
              src={selectedCandidate.flagged ? fallbackAvatarSrc : selectedCandidate.profile.image}
              radius={10}
              fallbackSrc={fallbackAvatarSrc}
            />
          </Flex>

          <Flex justifyItems="start" flexDirection="column">
            <Box mt={{ base: 4, md: 8 }} mb={{ base: 1, md: 3 }}>
              <Text fontFamily="orb" textAlign="center" fontSize={22} color={Colors.SNOW_WHITE}>
                {selectedCandidate.flagged ? 'Flagged' : selectedCandidate.profile.givenName}
              </Text>
              <Text fontFamily="orb" textAlign="center" fontSize={16} color={Colors.DI_SERRIA}>
                {selectedCandidate.candidate_name}
              </Text>
            </Box>
            <HStack justifyContent="space-evenly" width="100%">
              <Flex flexDirection="column" mr="15px">
                <HStack w="100%" flexWrap="wrap">
                  <Text
                    pt="3px"
                    h="33px"
                    fontFamily="tlm"
                    fontSize={18}
                    textAlign="start"
                    fontWeight={400}
                    minW="160px"
                    color={Colors.GRAY_CHATEAU}
                    mr="auto"
                  >
                    Score
                  </Text>
                  <Text
                    fontFamily="orb"
                    textAlign="end"
                    fontSize={22}
                    color={Colors.DODGE_BLUE}
                    minW="120px"
                    w="auto"
                    marginInline="0px"
                  >
                    {formatNumber(selectedCandidate.rank, 0, 0)}
                  </Text>
                </HStack>

                <HStack w="100%" flexWrap="wrap" gap="10px">
                  <Text
                    pt="3px"
                    h="33px"
                    fontFamily="tlm"
                    fontSize={18}
                    fontWeight={400}
                    color={Colors.GRAY_CHATEAU}
                    minW="160px"
                    mr="auto"
                  >
                    Received Vote Power
                  </Text>
                  <Text
                    fontFamily="orb"
                    textAlign="end"
                    fontSize={22}
                    minW="120px"
                    w="auto"
                    marginInline="0px"
                    color={Colors.CARIBBEAN_GREEN}
                  >
                    {formatNumber(selectedCandidate.total_vote_power, 0, 0)}
                  </Text>
                </HStack>

                {selectedCandidate.voteDecay && selectedCandidate.voteDecay > 0 && (
                  <HStack w="100%" flexWrap="wrap">
                    <Text
                      pt="3px"
                      h="33px"
                      fontFamily="tlm"
                      fontSize={18}
                      fontWeight={400}
                      color={Colors.GRAY_CHATEAU}
                      minW="160px"
                      mr="auto"
                    >
                      Vote Decay
                    </Text>
                    {selectedCandidate.voteDecay && selectedCandidate.voteDecay > 0 && (
                      <Text
                        fontFamily="orb"
                        textAlign={{ base: 'start', sm: 'end' }}
                        fontSize={22}
                        minW="120px"
                        w="auto"
                        marginInline="0px"
                        color={getVoteDecayColor(selectedCandidate.voteDecay)}
                      >
                        {selectedCandidate.voteDecay}{' '}
                        <span
                          style={{
                            fontFamily: 'Titillium Web',
                            fontSize: 18,
                            color: getVoteDecayColor(selectedCandidate.voteDecay),
                            fontWeight: 700,
                            marginBottom: 9,
                          }}
                        >
                          {pluralize(selectedCandidate.voteDecay, 'Day')}
                        </span>
                      </Text>
                    )}
                  </HStack>
                )}
                <HStack w="100%" flexWrap="wrap">
                  <Text
                    pt="3px"
                    h="33px"
                    fontFamily="tlm"
                    fontSize={18}
                    fontWeight={400}
                    color={Colors.GRAY_CHATEAU}
                    minW="160px"
                    mr="auto"
                  >
                    Total Votes
                  </Text>
                  <Text
                    fontFamily="orb"
                    textAlign={{ base: 'start', sm: 'end' }}
                    fontSize={22}
                    color={Colors.SNOW_WHITE}
                    minW="120px"
                    w="auto"
                    marginInline="0px"
                  >
                    {formatNumber(selectedCandidate.number_voters, 0, 0)}
                  </Text>
                </HStack>
              </Flex>
            </HStack>
          </Flex>
        </HStack>
        <Box mt={{ base: 4, md: 8 }}>
          <Flex w="100%" wrap="wrap" justifyContent="space-around">
            <Flex justifyContent="center" marginBlock="10px">
              <VoteButton
                voteStatus={CandidateButtonState(selectedCandidate)}
                onClick={() => addOrRemoveVoteSelection(selectedCandidate)}
              />
            </Flex>

            {(selectedCandidate.isVoteAdded || selectedCandidate.isVoted) && (
              <Flex justifyContent="center" marginBlock="10px">
                <VoteButton
                  voteStatus={VoteButtonStates.REMOVEVOTE}
                  onClick={() => addOrRemoveVoteSelection(selectedCandidate)}
                />
              </Flex>
            )}
          </Flex>
        </Box>
        <Box mt={5}>
          <Grid gridTemplateColumns="100%">
            <GridItem px="25px" pb="10px">
              <Text
                fontSize={18}
                fontWeight={400}
                textAlign="start"
                fontFamily="tlm"
                color={selectedCandidate.flagged ? Colors.RADICAL_RED : Colors.SNOW_WHITE}
              >
                {selectedCandidate.flagged ? 'Flagged' : selectedCandidate.profile.description}
              </Text>
            </GridItem>
          </Grid>
        </Box>
      </Box>

      {/* PROPOSALS TABLE */}
      <Box mt={5} bg={Colors.BLACK_SOLID_65} display={{ base: 'none', '2xl': 'flex' }}>
        {/* PROPOSALS TABLE */}
        <ProposalsTableVirtualised />
      </Box>
    </>
  )
}
