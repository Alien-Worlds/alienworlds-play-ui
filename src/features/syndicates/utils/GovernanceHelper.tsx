import {
  CanceledIcon,
  CheckIcon2,
  CrossIcon,
  PlusIcon,
  DropDownIcon,
  UpdateIcon,
} from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Box, chakra, Flex, HStack, Icon, Text, Th, Tr } from '@chakra-ui/react'
import { LoreSortBy, LoreTableColumns } from 'features/lore/types/loreTypes'
import {
  CandidatesSortByOptions,
  ProposalsTableColumns,
  ProposalStatus,
  ProposalActionStatus,
  ProposalButtonStatus,
  ProposalsSortBy,
  ProposalStatusButton,
  VoteButtonStates,
  VoteButtonTypes,
  FlattenedProposal,
} from 'features/syndicates/types/governanceTypes'
import { motion } from 'framer-motion'
import { Candidate, MsigsResponse } from 'graphql/types'
import {
  toLower,
  sortBy as sort,
  reverse,
  some,
  truncate,
  find,
  filter,
  includes,
  startCase,
  get,
  isEmpty,
  toUpper,
} from 'lodash'
import { DateTime } from 'luxon'
import { matchPath, matchRoutes } from 'react-router-dom'
import { Column } from 'react-virtualized'
import { Colors } from 'shared/util/colors'
import { dacList } from 'shared/util/helpers'
import { useActions, useAppState } from 'store'
import { PagePath } from 'store/main/types'

export const VoteButton = ({ voteStatus, onClick, postfix, isDisabled }: VoteButtonTypes) => {
  switch (voteStatus) {
    case VoteButtonStates.NOVOTE:
      return (
        <Button
          onClick={() => onClick()}
          size="md"
          height="46px"
          minWidth="170px"
          width="212px"
          leftIcon={<PlusIcon boxSize={23} />}
          variant="radium"
          fontFamily="Titillium Web"
          fontSize={18}
          fontWeight={400}
        >
          Add Your Vote
        </Button>
      )
    case VoteButtonStates.VOTEADDED:
      return (
        <Box
          minW="170px"
          w="170px"
          h="40px"
          height="46px"
          fontSize={18}
          borderRadius="25px"
          borderColor={Colors.INDIGO}
          borderWidth={2}
          backgroundColor={Colors.SNOW_WHITE}
          justifyContent="center"
          display="flex"
        >
          <HStack>
            <Icon as={CheckIcon2} style={{ width: 23, height: 23, color: Colors.INDIGO }} />
            <Text fontSize={18} fontFamily="tlm" fontWeight={400} color={Colors.INDIGO}>
              {' '}
              Vote Added
            </Text>
          </HStack>
        </Box>
      )
    case VoteButtonStates.VOTESIGNED:
      return (
        <Box
          h="39px"
          minW="170px"
          w="170px"
          height="46px"
          fontSize={18}
          backgroundColor={Colors.INDIGO}
          borderRadius="25px"
          justifyContent="center"
          display="flex"
          alignItems="center"
          gap={1}
        >
          <Icon as={CheckIcon2} style={{ width: 20, height: 20 }} />
          <Text fontFamily="tlm" fontWeight={400}>
            {' '}
            Vote Signed {postfix ? `${postfix}/2` : ''}
          </Text>
        </Box>
      )
    case VoteButtonStates.REMOVEVOTE:
      return (
        <Button
          onClick={() => onClick()}
          size="md"
          height="46px"
          minWidth="170px"
          width="212px"
          leftIcon={<CanceledIcon boxSize={23} />}
          variant="alert"
          fontFamily="Titillium Web"
          fontSize={18}
          fontWeight={400}
        >
          Remove Vote
        </Button>
      )
    case VoteButtonStates.SIGNVOTE:
      return (
        <Button
          onClick={() => onClick()}
          size="sm"
          height="45px !important"
          maxHeight="45px !important"
          minWidth="190px"
          width="max-content"
          fontSize={18}
          cursor={isDisabled ? 'not-allowed' : 'pointer'}
          variant={isDisabled ? 'hydrogen' : 'alkaline'}
          fontFamily="Titillium Web"
          fontWeight={400}
          disabled={isDisabled}
        >
          Sign Your Votes {postfix}/2
        </Button>
      )
    case VoteButtonStates.REFRESHVOTES:
      return (
        <Box
          h="46px"
          minW="170px"
          w="170px"
          backgroundColor={Colors.TRANSPARENT}
          borderRadius="25px"
          border="2px solid white"
          justifyContent="center"
          _hover={{
            backgroundColor: Colors.SNOW_WHITE,
            color: 'black',
          }}
          display="flex"
          alignItems="center"
          gap={1}
          cursor="pointer"
          onClick={() => onClick()}
        >
          <Icon as={UpdateIcon} style={{ width: 20, height: 20 }} />
          <Text fontFamily="tlm" fontWeight={400}>
            {' '}
            Refresh Votes
          </Text>
        </Box>
      )
    default:
      return null
  }
}

export const sortCandidates = (
  candidateSorter: string,
  sortingReversed: boolean,
  candidateList: Candidate[]
) => {
  let orderedCandidateList: Candidate[] = []

  if (candidateList && candidateList.length > 0) {
    switch (candidateSorter) {
      case CandidatesSortByOptions.RANK:
        orderedCandidateList = reverse(sort(candidateList, (cand: Candidate) => cand.rank))
        break
      case CandidatesSortByOptions.VOTEPOWER:
        orderedCandidateList = reverse(
          sort(candidateList, (cand: Candidate) => cand.total_vote_power)
        )
        break
      case CandidatesSortByOptions.VOTEDECAY:
        orderedCandidateList = reverse(
          sort(candidateList, (cand: Candidate) => cand.avg_vote_time_stamp)
        )
        break
      case CandidatesSortByOptions.TOTALVOTES:
        orderedCandidateList = reverse(sort(candidateList, (cand: Candidate) => cand.number_voters))
        break
      case CandidatesSortByOptions.GIVENNAME:
        orderedCandidateList = sort(candidateList, [
          (cand: Candidate) => toLower(cand.profile.givenName),
        ])
        break
      default:
        orderedCandidateList = candidateList
        break
    }

    if (sortingReversed) reverse(orderedCandidateList)
  }
  return orderedCandidateList
}

// #region Custodian Proposals
// Table functions
export const generateRandomProposalName = () => {
  function choices(population: String, k: number) {
    const out = []
    for (let i = 0; i < k; i += 1) {
      out.push(population[Math.floor(population.length * Math.random())])
    }
    return out.join('')
  }
  const alphabet = 'abcdefghijklmnopqrstuvwxyz12345'
  return choices(alphabet, 12)
}

export const showCancelOrCleanAction = (proposal: MsigsResponse, walletId: string) => {
  let showAction = false

  // show cancel action (own proposals)
  if (
    proposal.state !== ProposalStatus.EXECUTED &&
    proposal.state !== ProposalStatus.EXPIRED &&
    proposal.state !== ProposalStatus.CANCELED &&
    proposal.proposer === walletId
  ) {
    showAction = true
  }

  // show clean action (expired/canceled proposals)
  if (
    proposal.state === ProposalStatus.EXECUTED ||
    proposal.state === ProposalStatus.CANCELED ||
    proposal.state === ProposalStatus.EXPIRED
  ) {
    showAction = true
  }
  return showAction
}

export const isCancelableProposal = (proposal: FlattenedProposal, walletId: string) => {
  let isCancelable: boolean = false

  if (
    proposal?.createdBy === walletId &&
    proposal.status !== toLower(ProposalStatus.CANCELED) &&
    proposal.status !== toLower(ProposalStatus.EXPIRED) &&
    proposal.status !== toLower(ProposalStatus.EXECUTED)
  ) {
    isCancelable = true
  }
  return isCancelable
}

export const isActionableProposal = (proposal: MsigsResponse) => {
  let isActionable: boolean = false

  if (
    proposal.state !== ProposalStatus.CANCELED &&
    proposal.state !== ProposalStatus.EXPIRED &&
    proposal.state !== ProposalStatus.EXECUTED &&
    (proposal.state === ProposalStatus.APPROVABLE || proposal.state === ProposalStatus.EXECUTE)
  ) {
    isActionable = true
  }
  return isActionable
}

export const getProposalHoverColor = (status: string) => {
  let color: string

  if (!status) return Colors.GALLERY

  switch (toUpper(status)) {
    case ProposalStatus.APPROVABLE:
      color = Colors.ROBIN_EGG_BLUE_TRANSLUCENT
      break
    case ProposalStatus.PENDING:
      color = Colors.MAIN_YELLOW_TRANSLUCENT
      break
    case ProposalStatus.EXECUTE:
    case ProposalStatus.EXECUTED:
      color = Colors.MARINER_TRANSLUCENT
      break
    case ProposalStatus.CANCELED:
    case ProposalStatus.EXPIRED:
      color = Colors.RADICAL_RED_TRANSLUCENT
      break
    default:
      break
  }
  return color
}

export const getProposalActionColor = (proposal: MsigsResponse) => {
  let color: string

  if (!proposal) return Colors.SNOW_WHITE

  switch (proposal.state) {
    case ProposalStatus.APPROVABLE:
      color = Colors.ROBIN_EGG_BLUE
      break
    case ProposalStatus.PENDING:
      color = Colors.MAIN_YELLOW
      break
    case ProposalStatus.EXECUTE:
    case ProposalStatus.EXECUTED:
      color = Colors.MARINER
      break
    case ProposalStatus.CANCELED:
    case ProposalStatus.EXPIRED:
      color = Colors.RADICAL_RED
      break
    default:
      break
  }
  return color
}

export const getProposalHoverCursor = (proposal: MsigsResponse) => {
  return isActionableProposal(proposal) ? 'pointer' : 'default'
}

export const getProposalBgColor = (proposal: MsigsResponse) => {
  let color: string

  if (!proposal) return Colors.SNOW_WHITE

  switch (proposal.state) {
    case ProposalStatus.PENDING:
    case ProposalStatus.CANCELED:
    case ProposalStatus.EXPIRED:
    case ProposalStatus.EXECUTED:
      color = Colors.TRANSPARENT
      break
    case ProposalStatus.APPROVABLE:
    case ProposalStatus.EXECUTE:
      color = Colors.MARINER
      break
    default:
      color = Colors.ROBIN_EGG_BLUE
      break
  }
  return color
}

export const getProposalDetailsVotesColor = (status: string) => {
  let color: string

  if (!status) return Colors.SNOW_WHITE

  switch (toUpper(status)) {
    case ProposalStatus.APPROVABLE:
    case ProposalStatus.PENDING:
    case ProposalStatus.EXECUTE:
      color = Colors.DANDELION
      break
    case ProposalStatus.CANCELED:
    case ProposalStatus.EXPIRED:
      color = Colors.RADICAL_RED
      break
    case ProposalStatus.EXECUTED:
      color = Colors.MARINER
      break
    default:
      color = Colors.SNOW_WHITE
      break
  }
  return color
}

export const getProposalDashboardVotesColor = (proposal: MsigsResponse) => {
  let color: string

  if (!proposal) return Colors.SNOW_WHITE

  switch (proposal.state) {
    case ProposalStatus.APPROVABLE:
      color = Colors.DANDELION
      break
    case ProposalStatus.PENDING:
      color = Colors.TRANSPARENT
      break
    case ProposalStatus.EXECUTE:
    case ProposalStatus.EXECUTED:
      color = Colors.MARINER
      break
    case ProposalStatus.CANCELED:
    case ProposalStatus.EXPIRED:
      color = Colors.RADICAL_RED
      break
    default:
      break
  }
  return color
}

export const getProposalDashboardTextColor = (proposal: MsigsResponse) => {
  let color: string

  if (!proposal) return Colors.SNOW_WHITE

  switch (proposal.state) {
    case ProposalStatus.APPROVABLE:
    case ProposalStatus.EXECUTE:
      color = Colors.SNOW_WHITE
      break
    case ProposalStatus.PENDING:
      color = Colors.TRANSPARENT
      break
    case ProposalStatus.CANCELED:
    case ProposalStatus.EXPIRED:
      color = Colors.RADICAL_RED
      break
    case ProposalStatus.EXECUTED:
      color = Colors.MARINER
      break
    default:
      break
  }
  return color
}

export const getProposalDetailsTextColor = (status: string) => {
  let color: string

  if (!status) return Colors.SNOW_WHITE

  switch (toUpper(status)) {
    case ProposalStatus.APPROVABLE:
    case ProposalStatus.PENDING:
    case ProposalStatus.EXECUTE:
      color = Colors.DANDELION
      break
    case ProposalStatus.CANCELED:
    case ProposalStatus.EXPIRED:
      color = Colors.RADICAL_RED
      break
    case ProposalStatus.EXECUTED:
      color = Colors.MARINER
      break
    default:
      color = Colors.SNOW_WHITE
      break
  }
  return color
}

export const getProposalTitle = (proposal: MsigsResponse) => {
  let fullTitle: string
  let formattedTitle: string
  const titleOptions = {
    length: 30,
    separator: '',
  }
  const hasClaimBudget = some(proposal?.unpacked?.actions, { name: 'claimbudget' })
  if (hasClaimBudget) {
    formattedTitle = 'BUDGET'
  } else {
    fullTitle = find(proposal.metadata, (c) => c.key === 'title')?.value
    formattedTitle = truncate(fullTitle, titleOptions)
  }
  return formattedTitle
}

export const getProposalMinTextColor = (proposal: MsigsResponse) => {
  let color: string

  if (!proposal) return Colors.SNOW_WHITE

  switch (proposal.state) {
    case ProposalStatus.APPROVABLE:
    case ProposalStatus.PENDING:
    case ProposalStatus.EXECUTE:
      color = Colors.DANDELION
      break
    case ProposalStatus.CANCELED:
    case ProposalStatus.EXPIRED:
      color = Colors.RADICAL_RED
      break
    case ProposalStatus.EXECUTED:
      color = Colors.MARINER
      break
    default:
      color = Colors.SNOW_WHITE
      break
  }
  return color
}

export const getProposalStatusTextAndColor = (proposal: MsigsResponse) => {
  let text: string
  let color: string

  const hasUserVoted = some(proposal.provided_approvals, (approval) => {
    return approval.actor === proposal.proposer
  })
  const hasClaimBudget = some(proposal?.unpacked?.actions, { name: 'claimbudget' })
  if (hasClaimBudget && proposal.state === ProposalStatus.EXECUTED) {
    text = ProposalActionStatus.EXECUTED
    color = Colors.MARINER
  } else if (hasUserVoted) {
    text = ProposalActionStatus.VOTED
    color = Colors.CARIBBEAN_GREEN
  } else {
    text = ProposalActionStatus.CREATED
    color = Colors.SNOW_WHITE
  }
  return { text, color }
}

export const getProposalDashboardActionTextAndState = (proposal: FlattenedProposal, walletId) => {
  let text: string
  let state: ProposalButtonStatus = null

  if (!proposal) {
    text = ProposalActionStatus.PENDING
    state = ProposalButtonStatus.PENDING
    return { text, state }
  }

  switch (toUpper(proposal.status)) {
    case ProposalStatus.APPROVABLE:
      if (find(proposal.approvals, (p) => p.actor === walletId)) {
        text = ProposalActionStatus.PENDING
        state = ProposalButtonStatus.PENDING
      } else {
        text = ProposalActionStatus.APPROVE
        state = ProposalButtonStatus.APPROVE
      }
      break

    case ProposalStatus.EXECUTE:
      text = ProposalActionStatus.EXECUTE
      state = ProposalButtonStatus.EXECUTE
      break
    case ProposalStatus.CANCELED:
      text = ProposalActionStatus.CANCELED
      break
    case ProposalStatus.EXPIRED:
      text = ProposalActionStatus.EXPIRED
      break
    case ProposalStatus.EXECUTED:
      text = ProposalActionStatus.EXECUTED
      break
    default:
      break
  }
  return { text, state }
}

export const getProposalDetailsActionTextAndState = (proposal: MsigsResponse) => {
  let text: string
  let state: ProposalButtonStatus = null

  if (!proposal) {
    text = ProposalActionStatus.PENDING
    state = ProposalButtonStatus.PENDING
    return { text, state }
  }

  switch (proposal.state) {
    case ProposalStatus.APPROVABLE:
      text = ProposalActionStatus.PENDING
      state = ProposalButtonStatus.PENDING
      break
    case ProposalStatus.EXECUTE:
      text = ProposalActionStatus.PENDING
      state = ProposalButtonStatus.PENDING
      break
    case ProposalStatus.PENDING:
      text = ProposalActionStatus.PENDING
      state = ProposalButtonStatus.PENDING
      break
    case ProposalStatus.CANCELED:
      text = ProposalActionStatus.CANCELED
      break
    case ProposalStatus.EXPIRED:
      text = ProposalActionStatus.EXPIRED
      break
    case ProposalStatus.EXECUTED:
      text = ProposalActionStatus.EXECUTED
      break
    default:
      break
  }
  return { text, state }
}

export const getProposalMinActionText = (proposal: MsigsResponse) => {
  let text: string

  switch (proposal.state) {
    case ProposalStatus.APPROVABLE:
      text = ProposalActionStatus.PENDING
      break
    case ProposalStatus.EXECUTE:
      text = ProposalActionStatus.PENDING
      break
    case ProposalStatus.PENDING:
      text = ProposalActionStatus.PENDING
      break
    case ProposalStatus.CANCELED:
      text = ProposalActionStatus.CANCELED
      break
    case ProposalStatus.EXPIRED:
      text = ProposalActionStatus.EXPIRED
      break
    case ProposalStatus.EXECUTED:
      text = ProposalActionStatus.EXECUTED
      break
    default:
      break
  }
  return text
}
export const getFormattedProposalDate = (
  proposalDate: string,
  separator: string,
  excludeTime: boolean = false
): string | undefined => {
  let formattedDate: string | undefined

  const date: DateTime = DateTime.fromISO(proposalDate)

  if (date?.isValid) {
    if (excludeTime) {
      // Format only the date part without time
      formattedDate = date.toFormat(`yyyy${separator}MM${separator}dd`)
    } else {
      // Include both date and time
      formattedDate = date.toBSON()?.toLocaleString()?.replace(',', separator)
    }
  }
  return formattedDate
}

// Table components
export const ProposalStateButton = ({
  proposalStatus,
  isCancel,
  onClick,
}: ProposalStatusButton) => {
  switch (proposalStatus) {
    case ProposalButtonStatus.PENDING:
      return (
        <Box
          width="79px"
          height="22px"
          display="flex"
          borderRadius="5px"
          alignItems="center"
          position="relative"
          justifyContent="center"
          backgroundColor={Colors.ENERGY_YELLOW}
        >
          <Text fontFamily="tlm" fontSize={14} fontWeight={400} color={Colors.BLACK_SOLID_90}>
            {ProposalActionStatus.PENDING}
          </Text>
          {isCancel && (
            <Box
              right={-2}
              width={19}
              height={19}
              display="flex"
              cursor="pointer"
              position="absolute"
              border="1px solid"
              borderRadius="100%"
              justifyContent="center"
              background={Colors.RADICAL_RED}
              borderColor={Colors.BLACK_SOLID_90}
            >
              <CrossIcon width={19} height={19} onClick={() => onClick} />
            </Box>
          )}
        </Box>
      )
    case ProposalButtonStatus.EXECUTE:
      return (
        <Box
          width="79px"
          height="28px"
          display="flex"
          borderRadius="5px"
          alignItems="center"
          justifyContent="center"
          onClick={() => onClick()}
          backgroundColor={Colors.MARINER}
        >
          <Text letterSpacing="0.05em" fontSize={14} fontWeight={600}>
            {ProposalActionStatus.EXECUTE}
          </Text>
        </Box>
      )
    case ProposalButtonStatus.APPROVE:
      return (
        <Box
          width="79px"
          justifyContent="center"
          alignItems="center"
          height="28px"
          borderRadius="5px"
          backgroundColor={Colors.ROBIN_EGG_BLUE}
          borderColor={Colors.BLACK_SOLID_90}
          display="flex"
          onClick={() => onClick()}
        >
          <Text letterSpacing="0.05em" fontSize={14} fontWeight={600}>
            {ProposalActionStatus.APPROVE}
          </Text>
        </Box>
      )
    default:
      return null
  }
}

export const TLabel = ({ text, ...props }) => {
  return (
    <Text {...props} fontSize="14px" fontFamily="tlm" whiteSpace="nowrap" letterSpacing="0.1em">
      {text}
    </Text>
  )
}

export const SortByTh = ({ sortBy, width }) => {
  const {
    wax: { setProposalsFilter },
  } = useActions()
  const {
    wax: { proposalsFilter },
  } = useAppState()

  const onSelectSortBy = (value: ProposalsSortBy) => {
    if (value === proposalsFilter.sortBy) {
      setProposalsFilter({
        ...proposalsFilter,
        reversed: !proposalsFilter.reversed,
      })
      return
    }
    setProposalsFilter({
      ...proposalsFilter,
      sortBy: value,
    })
  }
  return (
    <Th
      width={width}
      border="none"
      padding="10px"
      cursor="pointer"
      onClick={() => onSelectSortBy(sortBy)}
    >
      <chakra.span display="flex">
        <Text
          mr={2}
          pl={3}
          mb={4}
          fontSize="sm"
          fontFamily="tlm"
          fontWeight="bold"
          textTransform="uppercase"
          color={proposalsFilter.sortBy === sortBy ? Colors.SNOW_WHITE : Colors.DI_SERRIA}
        >
          {LoreTableColumns[LoreSortBy[sortBy]]}
        </Text>
        {proposalsFilter.sortBy === sortBy && (
          <>
            {proposalsFilter.reversed ? (
              <motion.div
                initial={{ rotate: '180deg' }}
                animate={{ rotate: '0deg' }}
                exit={{
                  rotate: '180deg',
                  transition: { duration: 0.3 },
                }}
                transition={{ duration: 0.3 }}
              >
                <DropDownIcon boxSize="14px" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ rotate: '0deg' }}
                animate={{ rotate: '180deg', translateY: '-15px' }}
                exit={{
                  rotate: '0deg',
                  transition: { duration: 0.3 },
                }}
                transition={{ duration: 0.3 }}
              >
                <DropDownIcon boxSize="14px" />
              </motion.div>
            )}
          </>
        )}
      </chakra.span>
    </Th>
  )
}

// Table renderers

export function proposalsTableHeaderRenderer(page: string) {
  if (matchPath(PagePath.GovernanceDetails, page)) {
    return (
      <Tr>
        <SortByTh sortBy={ProposalsSortBy.TITLE} width="20%" />
        <SortByTh sortBy={ProposalsSortBy.CREATEDBY} width="10%" />
        <SortByTh sortBy={ProposalsSortBy.TO} width="5%" />
        <SortByTh sortBy={ProposalsSortBy.ITEM} width="12%" />
        <SortByTh sortBy={ProposalsSortBy.DATE} width="8%" />
        <SortByTh sortBy={ProposalsSortBy.VOTES} width="8%" />
        <SortByTh sortBy={ProposalsSortBy.ITEM} width="10%" />
      </Tr>
    )
  }

  if (matchPath(PagePath.GovernanceCandidateProfile, page)) {
    return (
      <Tr>
        <SortByTh sortBy={ProposalsSortBy.ID} width="7%" />
        <SortByTh sortBy={ProposalsSortBy.TITLE} width="15%" />
        <SortByTh sortBy={ProposalsSortBy.TO} width="5%" />
        <SortByTh sortBy={ProposalsSortBy.ITEM} width="12%" />
        <SortByTh sortBy={ProposalsSortBy.DATE} width="15%" />
        <SortByTh sortBy={ProposalsSortBy.ACTION} width="7%" />
        <SortByTh sortBy={ProposalsSortBy.STATUS} width="10%" />
      </Tr>
    )
  }

  if (matchPath(PagePath.GovernanceCustodianDashboard, page)) {
    return (
      <Tr>
        <SortByTh sortBy={ProposalsSortBy.ID} width="7%" />
        <SortByTh sortBy={ProposalsSortBy.TITLE} width="7%" />
        <SortByTh sortBy={ProposalsSortBy.CREATEDBY} width="15%" />
        <SortByTh sortBy={ProposalsSortBy.TO} width="5%" />
        <SortByTh sortBy={ProposalsSortBy.PROPOSAL} width="7%" />
        <SortByTh sortBy={ProposalsSortBy.ITEM} width="12%" />
        <SortByTh sortBy={ProposalsSortBy.VOTES} width="10%" />
        <SortByTh sortBy={ProposalsSortBy.ACTION} width="14%" />
        <SortByTh sortBy={ProposalsSortBy.EXPIRATION} width="10%" />
      </Tr>
    )
  }

  return null
}
type ColumnConfig = {
  label: string
  dataKey: string
  width: number
}

const headerRenderer = (
  { dataKey, label, sortBy },
  setSortBy,
  setSortOrderDesc,
  sortOrderDesc,
  currentSortBy
) => {
  return (
    <Flex
      alignItems="center"
      gap={1}
      cursor="pointer"
      onClick={() => {
        if (currentSortBy === sortBy) {
          setSortOrderDesc(!sortOrderDesc)
        } else setSortOrderDesc(true)
        setSortBy(dataKey)
      }}
    >
      <Text>{label}</Text>
      {sortBy === dataKey && sortOrderDesc && <DropDownIcon boxSize="12px" />}
      {sortBy === dataKey && !sortOrderDesc && <DropDownIcon color="red" boxSize="12px" />}
    </Flex>
  )
}
export function proposalsTableHeaderRendererVirtualised(
  page: string,
  setSortBy: (value: string) => void,
  setSortOrderDesc: (value: boolean) => void,
  sortOrderDesc: boolean,
  currentSortBy: string
) {
  const pageColumns: Record<string, ColumnConfig[]> = {
    [PagePath.GovernanceDetails]: [
      { label: 'ID', dataKey: 'id', width: 100 },
      { label: 'Title', dataKey: 'title', width: 300 },
      { label: 'Created By', dataKey: 'createdBy', width: 200 },
      { label: 'To', dataKey: 'to', width: 100 },
      { label: 'Item', dataKey: 'item', width: 200 },
      { label: 'Date Initiated', dataKey: 'date', width: 200 },
      { label: 'VOTES', dataKey: 'votes', width: 150 },
      { label: 'STATUS', dataKey: 'status', width: 150 },
    ],
    [PagePath.GovernanceCandidateProfile]: [
      { label: 'ID', dataKey: 'id', width: 100 },
      { label: 'Title', dataKey: 'title', width: 100 },
      { label: 'To', dataKey: 'to', width: 100 },
      { label: 'Item', dataKey: 'item', width: 100 },
      { label: 'Date Initiated', dataKey: 'date', width: 100 },
      { label: 'Action', dataKey: 'action', width: 100 },
      { label: 'STATUS', dataKey: 'status', width: 100 },
    ],
    [PagePath.GovernanceCustodianDashboard]: [
      { label: 'ID', dataKey: 'id', width: 100 },
      { label: 'Title', dataKey: 'title', width: 100 },
      { label: 'Created By', dataKey: 'createdBy', width: 100 },
      { label: 'To', dataKey: 'to', width: 100 },
      { label: 'Proposal', dataKey: 'proposal', width: 100 },
      { label: 'Item', dataKey: 'item', width: 100 },
      { label: 'VOTES', dataKey: 'votes', width: 100 },
      { label: 'Action', dataKey: 'action', width: 100 },
      { label: 'Expiration', dataKey: 'expiration', width: 100 },
    ],
  }

  const renderColumns = (columns: ColumnConfig[]) =>
    columns.map((column) => (
      <Column
        key={column.dataKey}
        label={column.label}
        dataKey={column.dataKey}
        width={column.width}
        headerRenderer={(props) =>
          headerRenderer(props, setSortBy, setSortOrderDesc, sortOrderDesc, currentSortBy)
        }
        cellRenderer={({ cellData, dataKey, rowData }) => {
          const hasBudgetClaimed = get(rowData, 'hasClaimBudget', false)
          const authorizationTo = get(rowData, 'authorizationTo', '')
          const totalVotes = get(rowData, 'totalVotes', 0)
          const status = get(rowData, 'status', '')
          const pendingOrExecute = ['pending', 'executed'].includes(status)
          const isCancelled = status === 'cancelled'

          switch (startCase(dataKey)) {
            case ProposalsTableColumns.TITLE:

            case ProposalsTableColumns.ITEM:
              return (
                <Text color={hasBudgetClaimed ? Colors.DODGE_BLUE : Colors.SNOW_WHITE}>
                  {hasBudgetClaimed && isEmpty(cellData) ? 'BUDGET' : cellData}
                </Text>
              )
            case ProposalsTableColumns.TO:
              return (
                <Text color={hasBudgetClaimed ? Colors.DODGE_BLUE : Colors.SNOW_WHITE}>
                  {hasBudgetClaimed && isEmpty(cellData) ? authorizationTo : cellData}
                </Text>
              )
            case ProposalsTableColumns.STATUS:
              // case ProposalStatus.PENDING:
              //   case ProposalStatus.EXECUTE:
              //     color = Colors.DANDELION
              //     break

              return (
                <Text
                  color={
                    isCancelled
                      ? Colors.RADICAL_RED
                      : pendingOrExecute
                      ? Colors.DANDELION
                      : Colors.SNOW_WHITE
                  }
                >
                  {hasBudgetClaimed && isEmpty(cellData) ? authorizationTo : startCase(cellData)}
                </Text>
              )
            case ProposalsTableColumns.VOTES:
              return (
                <Text
                  color={
                    isCancelled
                      ? Colors.RADICAL_RED
                      : pendingOrExecute
                      ? Colors.DANDELION
                      : Colors.SNOW_WHITE
                  }
                  ml={2}
                >
                  {cellData + ' / ' + totalVotes}
                </Text>
              )
            case ProposalsTableColumns.EXPIRATION:
              return <Text>{getFormattedProposalDate(cellData, '-', true)}</Text>
            case ProposalsTableColumns.DATE:
              return <Text>{getFormattedProposalDate(cellData, '-', true)}</Text>
            default:
              return <Text style={{ color: Colors.SNOW_WHITE }}>{cellData}</Text>
          }
        }}
      />
    ))

  for (const [path, columns] of Object.entries(pageColumns)) {
    if (matchPath(path, page)) {
      return renderColumns(columns) // Return array of columns
    }
  }

  return null
}

export function proposalsTableRowRenderer(page: string) {
  const defaultTableColumns = Object.values(ProposalsTableColumns)

  if (matchPath(PagePath.GovernanceDetails, page)) {
    return filter(
      defaultTableColumns,
      (i) =>
        i !== ProposalsTableColumns.STATUS &&
        i !== ProposalsTableColumns.PROPOSAL &&
        i !== ProposalsTableColumns.EXPIRATION
    )
  }

  if (
    matchRoutes(
      [
        { path: PagePath.GovernanceSignCandidateVote },
        { path: PagePath.GovernanceCandidateProfile },
      ],
      page
    )
  ) {
    return filter(
      defaultTableColumns,
      (i) =>
        i !== ProposalsTableColumns.CREATEDBY &&
        i !== ProposalsTableColumns.PROPOSAL &&
        i !== ProposalsTableColumns.VOTES &&
        i !== ProposalsTableColumns.EXPIRATION
    )
  }

  if (matchPath(PagePath.GovernanceCustodianDashboard, page)) {
    return filter(
      defaultTableColumns,
      (i) => i !== ProposalsTableColumns.DATE && i !== ProposalsTableColumns.STATUS
    )
  }

  return null
}

// Proposal statuses
export function setProposalStatus(proposal, approvals) {
  // 0 - APPROVABLE
  if (proposal.state === ProposalStatus.APPROVABLE && new Date(proposal.expiration) > new Date()) {
    proposal.state = ProposalStatus.APPROVABLE
  }
  // 1 - EXECUTED
  if (proposal.state === ProposalStatus.EXECUTED) {
    proposal.state = ProposalStatus.EXECUTED
  }
  // 2 - CANCELED
  if (proposal.state === ProposalStatus.CANCELED) {
    proposal.state = ProposalStatus.CANCELED
  }
  // 5 - EXECUTE
  if (proposal.state === ProposalStatus.APPROVABLE && approvals.provided_approvals?.length === 3) {
    proposal.state = ProposalStatus.EXECUTE
  }
  // 6 - EXPIRED
  if (
    new Date(proposal.expiration) < new Date() &&
    proposal.state !== ProposalStatus.CANCELED &&
    proposal.state !== ProposalStatus.EXECUTED
  ) {
    proposal.state = ProposalStatus.EXPIRED
  }

  return proposal
}

interface PlanetImages {
  candidates: string
  select: string
  details: string
  default: string
}
// governance images

export function getPlanetImages(planet: string) {
  const result: PlanetImages = { candidates: null, select: null, details: null, default: null }
  const planetWithImage = [
    dacList.eye,
    dacList.mag,
    dacList.kav,
    dacList.nar,
    dacList.ner,
    dacList.vel,
  ]
  if (planet && !includes(planetWithImage, planet)) {
    result['default'] = 'alienworlds-db-bg-governance.jpg'
    return result
  }

  result['candidates'] = `alienworlds-planet-bg-${planet}-candidates.jpg`
  result['details'] = `alienworlds-planet-bg-${planet}-details.jpg`
  result['select'] = `alienworlds-planet-bg-${planet}-select.jpg`
  return result
}

// #endregion
