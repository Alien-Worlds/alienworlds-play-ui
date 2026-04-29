import { CheckCircleIcon, CheckIcon2 } from '@alien-worlds/icons'
import { Option } from '@alien-worlds/uikit'
import { Box, Flex } from '@chakra-ui/react'
import styled from '@emotion/styled'
import {
  CandidatesSortByOptions,
  VoteButtonStates,
} from 'features/syndicates/types/governanceTypes'
import { VoteButton } from 'features/syndicates/utils/GovernanceHelper'
import { Candidate } from 'graphql/types'
import { every } from 'lodash'
import { Colors } from 'shared/util/colors'

export const candidatesSortOptions: Option[] = [
  { value: CandidatesSortByOptions.RANK, label: 'Rank' },
  { value: CandidatesSortByOptions.VOTEPOWER, label: 'Vote Power' },
  { value: CandidatesSortByOptions.TOTALVOTES, label: 'Total Votes' },
  { value: CandidatesSortByOptions.VOTEDECAY, label: 'Vote Decay' },
  { value: CandidatesSortByOptions.GIVENNAME, label: 'Given Name' },
]

enum CheckIconState {
  VOTED = 1,
  ADDED = 2,
}
type CheckIconType = {
  checkState: CheckIconState
}

type CheckIconTypeFull = {
  checkState: CheckIconState
  onClick?: (event?) => void
}

type ListSignStatusType = {
  votedCandidates: Candidate[]
  onClick?: () => void
  validation: () => boolean
  isTouched: boolean
}
export const StyledBox = styled(Box)(() => ({
  padding: 4,
  cursor: 'pointer',
}))
export const GetCheckIcon = ({ checkState }: CheckIconType) => {
  switch (checkState) {
    case CheckIconState.VOTED:
      return (
        <Flex
          width="18px"
          height="18px"
          backgroundColor={Colors.SNOW_WHITE}
          justifyContent="center"
          alignItems="center"
          borderRadius="50%"
        >
          <CheckIcon2 style={{ width: 24, height: 24 }} color={Colors.INDIGO} />
        </Flex>
      )
    case CheckIconState.ADDED:
      return <CheckCircleIcon style={{ width: 18, height: 18 }} color={Colors.RADICAL_RED} />
    default:
      return <Box style={{ width: 18 }}></Box>
  }
}

export const GetCheckIconFull = ({ checkState, onClick }: CheckIconTypeFull) => {
  switch (checkState) {
    case CheckIconState.VOTED:
      return (
        <Flex
          width="20px"
          height="20px"
          backgroundColor={Colors.SNOW_WHITE}
          borderRadius="100%"
          alignItems="center"
          justifyContent="center"
        >
          <CheckIcon2
            style={{ width: 35, height: 35 }}
            color={Colors.INDIGO}
            onClick={(event) => {
              event.stopPropagation()
              onClick()
            }}
          />
        </Flex>
      )
    case CheckIconState.ADDED:
      return (
        <CheckCircleIcon
          style={{ width: 35, height: 35 }}
          color={Colors.RADICAL_RED}
          onClick={(event) => {
            event.stopPropagation()
            onClick()
          }}
        />
      )
    default:
      return (
        <Box
          style={{
            width: 35,
            height: 35,
            borderRadius: '100%',
            borderColor: Colors.LOBLOLLY,
            border: '2px solid',
          }}
          onClick={(event) => {
            event.stopPropagation()
            onClick()
          }}
        />
      )
  }
}

export const VoteSignState = (votedCandidates: Candidate[]) => {
  if (votedCandidates.length === 2 && every(votedCandidates, 'isVoted')) {
    return VoteButtonStates.VOTESIGNED
  }
  if (votedCandidates.length < 3) {
    return VoteButtonStates.SIGNVOTE
  }

  return VoteButtonStates.NOVOTE
}

export const GetListSignStatusButton = ({
  votedCandidates,
  onClick,
  validation,
  isTouched,
}: ListSignStatusType) => {
  const voteStatus = VoteSignState(votedCandidates)
  switch (voteStatus) {
    case VoteButtonStates.VOTESIGNED:
      return (
        <VoteButton voteStatus={VoteButtonStates.VOTESIGNED} postfix={votedCandidates.length} />
      )
    case VoteButtonStates.SIGNVOTE:
      return (
        <VoteButton
          voteStatus={VoteButtonStates.SIGNVOTE}
          postfix={votedCandidates.length}
          isDisabled={!isTouched || votedCandidates.length === 0}
          onClick={() => {
            if (validation()) onClick()
          }}
        />
      )
    case VoteButtonStates.NOVOTE:
      return (
        <VoteButton voteStatus={VoteButtonStates.NOVOTE} postfix={1} onClick={() => onClick()} />
      )
    default:
      return null
  }
}

export const CandidateIconState = (candidate: Candidate) => {
  if (candidate.isVoted) {
    return CheckIconState.VOTED
  }
  if (candidate.isVoteAdded) {
    return CheckIconState.ADDED
  }

  return null
}

export const CandidateButtonState = (candidate: Candidate) => {
  if (candidate.isVoted) {
    return VoteButtonStates.VOTESIGNED
  }
  if (candidate.isVoteAdded) {
    return VoteButtonStates.VOTEADDED
  }
  if (candidate.isSelected) {
    return VoteButtonStates.NOVOTE
  }

  return null
}
