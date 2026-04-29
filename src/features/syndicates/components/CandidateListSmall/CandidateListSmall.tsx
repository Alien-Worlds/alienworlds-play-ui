import { useRef } from 'react'

import { CandiateIcon } from '@alien-worlds/icons'
import { PlaceRing } from '@alien-worlds/uikit'
import { Box, Flex, HStack, Stack, Text, VStack } from '@chakra-ui/react'
import { MemberTermsStatusBadge } from 'features/syndicates/components/MemberTermsStatusBadge/MemberTermsStatusBadge'
import {
  CandidateIconState,
  GetCheckIcon,
  GetListSignStatusButton,
  StyledBox,
} from 'features/syndicates/pages/CandidateListHelper'
import { VoteButtonStates } from 'features/syndicates/types/governanceTypes'
import { VoteButton } from 'features/syndicates/utils/GovernanceHelper'
import { Candidate } from 'graphql/types'
import { AutoSizer, CellMeasurer, CellMeasurerCache, List, WindowScroller } from 'react-virtualized'
import { Colors } from 'shared/util/colors'
import {
  candidatesGradientColors,
  candidatesHoverGradientColors,
  fallbackAvatarSrc,
  getDacPlaceRingVariantByPlace,
  getVoteDecayColor,
  pluralize,
} from 'shared/util/helpers'
import { useScreenSize } from 'shared/util/hooks'
import { formatNumber } from 'shared/util/numbers'
import { useActions } from 'store'

import { Constants } from '../../../../shared/util/constants'

type CandidateListSmallProps = {
  candidateList: Candidate[]
  onClickListItem: (walletId: string) => void
  votedCandidates: Candidate[]
  CheckTermsAndConditionValidation: () => boolean
  isSelectionTouched: boolean
  votePower: number
  showRefreshVotesButton: boolean
  refreshVotes: () => void
}

export const CandidateListSmall = ({
  candidateList,
  onClickListItem,
  votedCandidates,
  CheckTermsAndConditionValidation,
  isSelectionTouched,

  votePower,
  showRefreshVotesButton,
  refreshVotes,
}: CandidateListSmallProps) => {
  const { isDesktop } = useScreenSize()

  const cache = useRef(
    new CellMeasurerCache({
      defaultHeight: 40,
      fixedWidth: true,
    })
  )

  const {
    modal: { setPrimaryModalActive, setSecondaryModalActive },
  } = useActions()
  const rowRenderer = ({ index, key, parent, style }) => {
    const candidate = candidateList[index]
    return (
      <CellMeasurer
        key={key}
        cache={cache.current}
        columnCount={1}
        columnIndex={0}
        parent={parent}
        rowIndex={index}
      >
        {({ registerChild }) => (
          <StyledBox
            ref={registerChild}
            style={{
              ...style,
            }}
            p="0px !important"
            px="10px !important"
            border="2px solid transparent"
            _hover={{
              border: `2px solid ${candidatesGradientColors(index + 1)}`,
              background: candidatesHoverGradientColors(index + 1),
            }}
            onClick={() => onClickListItem(candidate.candidate_name)}
          >
            <Stack
              pr="5px"
              direction={{ base: 'column', md: 'row' }}
              alignItems="center"
              h="inherit"
              gap={{ base: 0, md: 2 }}
            >
              <Box display="flex" alignItems="center" gap="10px">
                <GetCheckIcon checkState={CandidateIconState(candidate)} />

                <MemberTermsStatusBadge
                  positionOffset={0}
                  isTermsSigned={candidate.hasSignedCurrentDaoTerms}
                >
                  <PlaceRing
                    radius={5.5}
                    fallbackSrc={fallbackAvatarSrc}
                    variant={getDacPlaceRingVariantByPlace(candidate.rankIndex + 1)}
                    src={candidate.flagged ? fallbackAvatarSrc : candidate?.profile?.image}
                  />
                </MemberTermsStatusBadge>
              </Box>
              <VStack width="100%">
                <Box alignSelf={{ base: 'center', md: 'flex-start' }}>
                  <Text
                    fontFamily="Orbitron"
                    textAlign={{ base: 'center', md: 'left' }}
                    fontSize={14}
                    color={Colors.SNOW_WHITE}
                  >
                    {candidate.flagged ? 'Flagged' : candidate.profile.givenName}
                  </Text>
                  <Text
                    fontFamily="Orbitron"
                    textAlign={{ base: 'center', md: 'left' }}
                    fontSize={12}
                    color={Colors.DI_SERRIA}
                  >
                    {candidate.candidate_name}
                  </Text>
                </Box>

                <Box width="100%" mt={4} alignSelf="flex-start">
                  <HStack justifyContent="space-between">
                    <Text
                      fontFamily="tlm"
                      fontSize={14}
                      textAlign="left"
                      fontWeight={400}
                      color={Colors.GRAY_CHATEAU}
                    >
                      Received Vote Power
                    </Text>
                    <Text
                      fontFamily="Orbitron"
                      textAlign="left"
                      fontSize={14}
                      color={Colors.CARIBBEAN_GREEN}
                    >
                      {formatNumber(candidate.total_vote_power, 0, 0)}
                    </Text>
                  </HStack>
                  {candidate.voteDecay && candidate.voteDecay > 0 && (
                    <HStack justifyContent="space-between" gap={2}>
                      <Text
                        fontFamily="tlm"
                        fontSize={14}
                        textAlign="left"
                        fontWeight={400}
                        color={Colors.GRAY_CHATEAU}
                      >
                        Vote Decay
                      </Text>
                      <Text
                        fontFamily="Orbitron"
                        textAlign="left"
                        fontSize={14}
                        color={getVoteDecayColor(candidate.voteDecay)}
                      >
                        {candidate.voteDecay}{' '}
                        <span
                          style={{
                            fontFamily: 'Titillium Web',
                            fontSize: 12,
                            color: getVoteDecayColor(candidate.voteDecay),
                            fontWeight: 700,
                            marginBottom: 3,
                          }}
                        >
                          {pluralize(candidate.voteDecay, 'Day')}
                        </span>
                      </Text>
                    </HStack>
                  )}
                  <HStack justifyContent="space-between">
                    <Text
                      fontFamily="tlm"
                      fontSize={14}
                      textAlign="left"
                      fontWeight={400}
                      color={Colors.GRAY_CHATEAU}
                    >
                      Total Votes
                    </Text>
                    <Text fontFamily="Orbitron" fontSize={14} color={Colors.SNOW_WHITE}>
                      {candidate.number_voters || 0}
                    </Text>
                  </HStack>
                </Box>
              </VStack>
            </Stack>
          </StyledBox>
        )}
      </CellMeasurer>
    )
  }

  return (
    <Box backgroundColor={Colors.BLACK_SOLID_65} width="100%">
      <Box
        gap={2}
        p={5}
        top={Constants.MAIN_TOPBAR_HEIGHT}
        position="sticky"
        zIndex="sticky"
        backgroundColor={Colors.BLACK_SOLID_100}
      >
        <Flex flexWrap="wrap" alignItems="center">
          <HStack mr={5}>
            <CandiateIcon color={Colors.DI_SERRIA} w={24} h={24} />
            <Text fontFamily="Orbitron" fontWeight={400} fontSize={14}>
              Candidates List
            </Text>
          </HStack>
          <Flex flexWrap="wrap" alignItems="center" justifyContent="space-between" w="100%">
            <Box marginBlock="15px">
              <GetListSignStatusButton
                votedCandidates={votedCandidates}
                onClick={() => {
                  if (votePower === 0) {
                    setSecondaryModalActive({
                      modalName: 'NotEnoughTokensToVoteModal',
                      value: true,
                    })
                  } else {
                    setPrimaryModalActive({ modalName: 'SignVoteModal', value: true })
                  }
                }}
                validation={() => CheckTermsAndConditionValidation()}
                isTouched={isSelectionTouched}
              />
            </Box>
            {showRefreshVotesButton && (
              <VoteButton
                voteStatus={VoteButtonStates.REFRESHVOTES}
                onClick={() => refreshVotes()}
              />
            )}
          </Flex>
        </Flex>
      </Box>

      <WindowScroller>
        {({ height }) => (
          <Box width="100%" paddingBottom={3}>
            <AutoSizer disableHeight>
              {({ width }) => {
                return (
                  <List
                    deferredMeasurementCache={cache.current}
                    autoHeight
                    height={height}
                    backGroundColor={Colors.BLACK_SOLID_65}
                    rowCount={candidateList.length}
                    rowHeight={isDesktop ? 140 : 260}
                    rowRenderer={rowRenderer}
                    width={width}
                    style={{ outline: 'none' }}
                  />
                )
              }}
            </AutoSizer>
          </Box>
        )}
      </WindowScroller>
    </Box>
  )
}
