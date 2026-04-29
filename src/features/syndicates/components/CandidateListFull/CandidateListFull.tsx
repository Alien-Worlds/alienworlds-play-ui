import { MutableRefObject, useRef } from 'react'

import { ReverseSortingIcon, SortingIcon, ChatIcon } from '@alien-worlds/icons'
import { Button, Dropdown, PlaceRing, Option } from '@alien-worlds/uikit'
import { Box, css, Flex, Grid, GridItem, HStack, SimpleGrid, Text, VStack } from '@chakra-ui/react'
import { GlossaryInfoIcon } from 'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon'
import { TooltipLocations } from 'features/glossary/utils/glossaryConst'
import { MemberTermsStatusBadge } from 'features/syndicates/components/MemberTermsStatusBadge/MemberTermsStatusBadge'
import {
  CandidateIconState,
  candidatesSortOptions,
  GetCheckIconFull,
  GetListSignStatusButton,
  StyledBox,
} from 'features/syndicates/pages/CandidateListHelper'
import {
  CandidatesSortByOptions,
  VoteButtonStates,
} from 'features/syndicates/types/governanceTypes'
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
import { formatNumber } from 'shared/util/numbers'
import { useActions } from 'store'

import { Constants } from '../../../../shared/util/constants'

type CandidateListFullProps = {
  candidateList: Candidate[]
  onClickListItem: (walletId: string) => void
  addOrRemoveVoteSelection: (candidate: Candidate) => void
  votedCandidates: Candidate[]
  CheckTermsAndConditionValidation: () => boolean
  isSelectionTouched: boolean
  candidatesFilter: string
  setCandidatesFilter: (value: string) => void
  setMenuVisible: (value: boolean) => void
  reverseCandidatesSorting: boolean
  setReverseCandidatesSorting: (value: boolean) => void
  currentMemberTermsVersion: number
  clickAwayRef: MutableRefObject<any>
  votePower: number
  showRefreshVotesButton: boolean
  refreshVotes: () => void
}

export const CandidateListFull = ({
  candidateList,
  onClickListItem,
  addOrRemoveVoteSelection,
  votedCandidates,
  CheckTermsAndConditionValidation,
  isSelectionTouched,
  candidatesFilter,
  setCandidatesFilter,
  setMenuVisible,
  reverseCandidatesSorting,
  setReverseCandidatesSorting,
  currentMemberTermsVersion,
  clickAwayRef,
  votePower,
  showRefreshVotesButton,
  refreshVotes,
}: CandidateListFullProps) => {
  const cacheFullRow = useRef(
    new CellMeasurerCache({
      defaultHeight: 40,
      fixedWidth: true,
    })
  )
  const {
    modal: { setSecondaryModalActive, setPrimaryModalActive },
  } = useActions()

  const rowFullRenderer = ({ index, key, parent, style }) => {
    const candidate = candidateList[index]
    return (
      <CellMeasurer
        key={key}
        cache={cacheFullRow.current}
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
            border="2px solid transparent"
            _hover={{
              border: `2px solid ${candidatesGradientColors(index + 1)}`,
              background: candidatesHoverGradientColors(index + 1),
            }}
            onClick={() => onClickListItem(candidate.candidate_name)}
          >
            <HStack gap={2}>
              <Box
                display="flex"
                alignItems="center"
                height={130}
                gap={4}
                width="full"
                justifyContent="space-around"
              >
                <SimpleGrid
                  gridTemplateColumns="5% 5% 25% 18% 18% 8% 10%"
                  width="full"
                  alignItems="center"
                  gridColumnGap="2%"
                  px="1%"
                >
                  <Box justifySelf="center">
                    <GetCheckIconFull
                      checkState={CandidateIconState(candidate)}
                      onClick={() => addOrRemoveVoteSelection(candidate)}
                    />
                  </Box>

                  <Box alignSelf="center">
                    <Text
                      fontSize={22}
                      fontFamily="orb"
                      textAlign="center"
                      color={Colors.SNOW_WHITE}
                    >
                      {/* TODO Rank Index */}
                      {index + 1}
                    </Text>
                  </Box>
                  <HStack overflow="hidden">
                    <MemberTermsStatusBadge
                      positionOffset={1}
                      isTermsSigned={candidate.member_terms_version === currentMemberTermsVersion}
                    >
                      <PlaceRing
                        radius={5.5}
                        fallbackSrc={fallbackAvatarSrc}
                        variant={getDacPlaceRingVariantByPlace(index + 1)}
                        src={candidate.flagged ? fallbackAvatarSrc : candidate?.profile?.image}
                      />
                    </MemberTermsStatusBadge>
                    <VStack alignItems="flex-start">
                      <Text
                        fontFamily="Orbitron"
                        textAlign="left"
                        fontSize={20}
                        color={Colors.SNOW_WHITE}
                        mb="-10px"
                      >
                        {candidate.flagged ? 'Flagged' : candidate?.profile?.givenName}
                      </Text>
                      <Text
                        fontFamily="tlm"
                        textAlign="left"
                        fontSize={18}
                        color={Colors.DI_SERRIA}
                      >
                        {candidate?.candidate_name}
                      </Text>
                    </VStack>
                  </HStack>

                  <Box alignSelf="center">
                    <Text
                      fontFamily="Orbitron"
                      textAlign="left"
                      ml="-10px"
                      fontSize={22}
                      color={Colors.DODGE_BLUE}
                    >
                      {formatNumber(candidate.rank, 0, 0)}
                    </Text>
                  </Box>

                  <Box alignSelf="center">
                    <Text
                      fontFamily="Orbitron"
                      textAlign="left"
                      ml="-10px"
                      fontSize={22}
                      color={Colors.CARIBBEAN_GREEN}
                    >
                      {formatNumber(candidate.total_vote_power, 0, 0)}
                    </Text>
                  </Box>

                  <Box alignSelf="center">
                    <Text fontFamily="Orbitron" fontSize={22} color={Colors.SNOW_WHITE}>
                      {formatNumber(candidate.number_voters, 0, 0)}
                    </Text>
                  </Box>

                  <Box alignSelf="center">
                    {candidate.voteDecay && candidate.voteDecay > 0 ? (
                      <Text
                        fontFamily="Orbitron"
                        fontSize={22}
                        color={getVoteDecayColor(candidate.voteDecay)}
                      >
                        {candidate.voteDecay}{' '}
                        <span
                          style={{
                            fontFamily: 'Titillium Web',
                            fontSize: 17,
                            color: getVoteDecayColor(candidate.voteDecay),
                            fontWeight: 700,
                            marginBottom: 3,
                            verticalAlign: 'middle',
                            textTransform: 'uppercase',
                          }}
                        >
                          {pluralize(candidate.voteDecay, 'Day')}
                        </span>
                      </Text>
                    ) : (
                      <Text fontFamily="Orbitron" fontSize={26} color={Colors.RADICAL_RED}>
                        N/A
                      </Text>
                    )}
                  </Box>
                </SimpleGrid>
              </Box>
            </HStack>
          </StyledBox>
        )}
      </CellMeasurer>
    )
  }

  return (
    <Grid gridTemplateColumns="100%" gap="4">
      <GridItem>
        <Box backgroundColor={Colors.BLACK_SOLID_65} width="full">
          <Box
            gap={2}
            p={5}
            top={Constants.MAIN_TOPBAR_HEIGHT}
            position="sticky"
            zIndex="sticky"
            backgroundColor={Colors.BLACK_SOLID_100}
          >
            <Flex flexWrap="wrap" alignItems="center" justifyContent="start" w="100%">
              <Flex flexWrap="wrap" alignItems="center" justifyContent="start">
                <HStack mr={5}>
                  <ChatIcon color={Colors.DI_SERRIA} boxSize={20} />
                  <Text fontFamily="Orbitron" fontWeight={400} fontSize={22}>
                    Voting
                  </Text>
                </HStack>
                <Flex flexWrap="wrap" alignItems="center" justifyContent="start">
                  <Box marginBlock="10px" marginInline="10px">
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
                    <Box marginBlock="10px" marginInline="10px">
                      <VoteButton
                        voteStatus={VoteButtonStates.REFRESHVOTES}
                        onClick={() => refreshVotes()}
                      />
                    </Box>
                  )}
                </Flex>
              </Flex>

              <HStack ml="auto">
                <Flex alignItems="center" justifyContent="flex-end" width="100%">
                  <Text fontFamily="Titillium Web" color="#fff" mr={3} w="55px">
                    Sort by
                  </Text>
                  <Flex ref={clickAwayRef} direction="column" position="relative" width="150px">
                    <Dropdown
                      options={candidatesSortOptions}
                      onChange={(item: Option) => {
                        setCandidatesFilter(item?.value)
                        setMenuVisible(false)
                      }}
                      variant="simple"
                      size="md"
                    />
                  </Flex>
                </Flex>
                <Flex mr="15px">
                  <Button
                    variant="dark"
                    size="sm"
                    color="white"
                    onClick={() => {
                      setReverseCandidatesSorting(!reverseCandidatesSorting)
                    }}
                    rightIcon={
                      reverseCandidatesSorting ? (
                        <ReverseSortingIcon boxSize={24} />
                      ) : (
                        <SortingIcon boxSize={24} />
                      )
                    }
                    fontFamily="Titillium Web"
                  >
                    {' '}
                    {reverseCandidatesSorting ? 'Z-A' : 'A-Z'}
                  </Button>
                </Flex>
              </HStack>
            </Flex>
            <Box position="absolute" right={2} top={2}>
              <GlossaryInfoIcon
                width={20}
                height={20}
                color={Colors.SNOW_WHITE}
                glossaryId={TooltipLocations.GOVERNANCE_CANDIDATE_VOTING}
              />
            </Box>
          </Box>
          <SimpleGrid
            gridTemplateColumns="5% 5% 25% 18% 18% 8% 10%"
            width="full"
            alignItems="center"
            gridColumnGap="2%"
            padding="10px 30px 10px 15px"
          >
            <Box>
              <Text
                fontFamily="tlm"
                textAlign="center"
                fontSize={18}
                color={Colors.GRAY_CHATEAU}
                sx={{ textWrap: 'nowrap' }}
              >
                Vote
              </Text>
            </Box>
            <Box>
              <Text
                fontFamily="tlm"
                textAlign="center"
                fontSize={18}
                color={Colors.GRAY_CHATEAU}
                css={css({
                  wordWrap: 'normal',
                })}
              >
                Rank
              </Text>
            </Box>
            <Box>
              <Text
                fontFamily="tlm"
                textAlign="left"
                fontSize={18}
                color={Colors.GRAY_CHATEAU}
                fontWeight={candidatesFilter === CandidatesSortByOptions.GIVENNAME ? 600 : 400}
              >
                Candidate
              </Text>
            </Box>
            <Flex alignItems="center" gap={1}>
              <Text
                fontFamily="tlm"
                textAlign="left"
                fontSize={18}
                color={Colors.GRAY_CHATEAU}
                fontWeight={candidatesFilter === CandidatesSortByOptions.RANK ? 600 : 400}
              >
                Score
              </Text>
            </Flex>
            <Flex alignItems="center" gap={1}>
              <Text
                fontFamily="tlm"
                textAlign="left"
                fontSize={18}
                color={Colors.GRAY_CHATEAU}
                fontWeight={candidatesFilter === CandidatesSortByOptions.VOTEPOWER ? 600 : 400}
              >
                Voting Power
              </Text>
              <GlossaryInfoIcon
                width={15}
                glossaryId={TooltipLocations.GOVERNANCE_CANDIDATE_VOTING_POWER}
                right={10}
                top={10}
              />
            </Flex>
            <Box>
              <Text
                fontFamily="tlm"
                textAlign="left"
                fontSize={18}
                color={Colors.GRAY_CHATEAU}
                fontWeight={candidatesFilter === CandidatesSortByOptions.TOTALVOTES ? 600 : 400}
              >
                Total Votes
              </Text>
            </Box>
            <Flex alignItems="center" gap={1}>
              <Text
                fontFamily="tlm"
                textAlign="left"
                fontSize={18}
                color={Colors.GRAY_CHATEAU}
                fontWeight={candidatesFilter === CandidatesSortByOptions.VOTEDECAY ? 600 : 400}
              >
                Vote Decay
              </Text>
              <GlossaryInfoIcon
                width={15}
                glossaryId={TooltipLocations.GOVERNANCE_CANDIDATE_VOTE_DECAY}
                right={10}
                top={10}
              />
            </Flex>
          </SimpleGrid>
          <WindowScroller>
            {({ height }) => (
              <Box width="100%" paddingBottom={3}>
                <AutoSizer disableHeight>
                  {({ width }) => (
                    <List
                      deferredMeasurementCache={cacheFullRow.current}
                      autoHeight
                      height={height}
                      backGroundColor={Colors.BLACK_SOLID_65}
                      rowCount={candidateList.length}
                      rowHeight={140}
                      rowRenderer={rowFullRenderer}
                      width={width}
                    />
                  )}
                </AutoSizer>
              </Box>
            )}
          </WindowScroller>
        </Box>
      </GridItem>
    </Grid>
  )
}
