import { useEffect, useState, useRef } from 'react'

import { Box, Grid, GridItem } from '@chakra-ui/react'
import { CandidateCard } from 'features/syndicates/components/CandidateCard/CandidateCard'
import { CandidateListFull } from 'features/syndicates/components/CandidateListFull/CandidateListFull'
import { CandidateListSmall } from 'features/syndicates/components/CandidateListSmall/CandidateListSmall'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import {
  CandidateButtonState,
  candidatesSortOptions,
} from 'features/syndicates/pages/CandidateListHelper'
import { sortCandidates } from 'features/syndicates/utils/GovernanceHelper'
import { useStructuredDaoDetail } from 'graphql/hooks/useStructuredDaoDetail'
import { useWalletDaoDetails } from 'graphql/hooks/useWalletDaoDetails'
import { Candidate, DaoWalletDetailsResponse } from 'graphql/types'
import { cloneDeep, filter, find, get, isEmpty, map } from 'lodash'
import { generatePath, useNavigate, useParams } from 'react-router'
import { useClickAway } from 'react-use'
import { useScreenSize } from 'shared/util/hooks'
import { useActions, useAppState } from 'store'
import { toastErrorMessage } from 'store/main/actions'
import { PagePath } from 'store/main/types'

export const CandidateListPage = () => {
  const {
    wax: { updateVotedCandidates },
    main: { showGovernanceSignCandidateVotePage },
    modal: { setPrimaryModalActive, setSecondaryModalActive },
  } = useActions()
  const {
    wax: {
      walletId,
      votedCandidatesList,

      termsAccepted,

      selectedDacId,
      selectedDacCandidateWalletId,
    },
  } = useAppState()

  const { daoDetailsStructed } = useStructuredDaoDetail({
    dacId: selectedDacId,
    walletId: walletId,
  })

  const {
    walletDaoDetails,
    loading: walletDaoDetailsLoading,
  }: { walletDaoDetails: DaoWalletDetailsResponse; loading: boolean } = useWalletDaoDetails({
    dacId: selectedDacId,
    walletId,
  })
  const votePower = walletDaoDetails?.vote_weight?.weight
  const currentMemberTermsVersion = get(daoDetailsStructed, 'member_terms.version', 0)
  const hasSignedCurrentDaoTerms =
    walletDaoDetails?.agreed_terms_version === currentMemberTermsVersion
  const ref = useRef(null)
  const navigate = useNavigate()
  const { isMediumScreen } = useScreenSize()
  const [, setMenuVisible] = useState(false)
  useClickAway(ref, () => setMenuVisible(false))
  const [isAlreadyVotedTwo, setAlreadyVotedTwo] = useState(false)
  const [isSelectionTouched, setIsSelectionTouched] = useState(false)
  const [showRefreshVotesButton, setShowRefreshVotesButton] = useState(false)

  const [selectedCandidate, setSelectedCandidate] = useState<Candidate>(null)
  const [reverseCandidatesSorting, setReverseCandidatesSorting] = useState<boolean>(false)
  const [alreadyVotedCandidates, setAlreadyVotedCandidates] = useState<Candidate[]>([])
  const [candidatesFilter, setCandidatesFilter] = useState<string>(candidatesSortOptions[0].value)
  const [candidateList, setCandidateList] = useState<Candidate[]>()
  const { planetId, walletId: walletIdParam } = useParams<{ planetId: string; walletId: string }>()

  const selectCandidateByWalletId = (candidates: Candidate[], walletId: string) => {
    return map(candidates, (candidate) => {
      return candidate.candidate_name === walletId
        ? { ...candidate, isSelected: true }
        : { ...candidate, isSelected: false }
    })
  }

  const onClickListItem = (walletId: string) => {
    window.scrollTo({ top: 0, behavior: 'auto' })
    const updatedCandidateList = selectCandidateByWalletId(candidateList, walletId)
    setCandidateList(updatedCandidateList)
    navigate(generatePath(PagePath.GovernanceCandidateProfile, { planetId, walletId }))
  }

  const addOrRemoveVoteSelection = ({ candidate_name, isVoteAdded, isVoted }: Candidate) => {
    // check the limit only when adding new votes, not removing
    if (!isVoteAdded && !isVoted && votedCandidatesList && votedCandidatesList.length === 2) {
      setAlreadyVotedTwo(true)
      return
    }

    setIsSelectionTouched(true)

    let updateCandidateList: Candidate[]

    if (isVoteAdded) {
      // "remove vote" case
      updateCandidateList = map(candidateList, (candidate) => {
        return candidate.candidate_name === candidate_name
          ? { ...candidate, isVoteAdded: false, isVoted: false }
          : candidate
      })
    } else if (isVoted) {
      // "remove signed vote"
      updateCandidateList = map(candidateList, (candidate) => {
        return candidate.candidate_name === candidate_name
          ? { ...candidate, isVoteAdded: false, isVoted: false, isSignedVoteRemoved: true }
          : candidate
      })
    } else {
      // "add vote" case
      updateCandidateList = map(candidateList, (candidate) => {
        return candidate.candidate_name === candidate_name
          ? { ...candidate, isVoteAdded: true }
          : candidate
      })
    }

    setCandidateList(updateCandidateList)

    const votedList = filter(updateCandidateList, (candidate) => {
      return candidate.isVoted || candidate.isVoteAdded
    })
    updateVotedCandidates(cloneDeep(votedList))
  }

  const CheckTermsAndConditionValidation = () => {
    const candidatesWithUnsignedMemberTerms = filter(votedCandidatesList, {
      hasSignedCurrentDaoTerms: false,
    })
    if (candidatesWithUnsignedMemberTerms.length > 1) {
      toastErrorMessage('Both of your Candidates have not signed the latest DAO Terms.')
    } else if (candidatesWithUnsignedMemberTerms.length === 1) {
      toastErrorMessage(
        `${candidatesWithUnsignedMemberTerms[0].profile.givenName} has not signed the latest DAO Terms.`
      )
    } else if (!hasSignedCurrentDaoTerms || !termsAccepted) {
      setSecondaryModalActive({ modalName: 'NotSignedMemberTermsModal', value: true })
    }
    if (
      candidatesWithUnsignedMemberTerms &&
      candidatesWithUnsignedMemberTerms.length === 0 &&
      hasSignedCurrentDaoTerms &&
      termsAccepted
    ) {
      return true
    }

    return false
  }

  const refreshVotes = () => {
    //updateVotedCandidates(votedCandidates)
    setPrimaryModalActive({ modalName: 'SignVoteModal', value: true })
  }

  useEffect(() => {
    if (candidateList && candidateList.length > 0) {
      setSelectedCandidate(find(candidateList, { isSelected: true }))
      // setVotedCandidates(
      //   filter(candidateList, (candidate) => {
      //     return candidate.isVoted || candidate.isVoteAdded
      //   })
      // )
    }
  }, [candidateList])

  useEffect(() => {
    if (!isEmpty(daoDetailsStructed) && isEmpty(candidateList)) {
      const previouslyVotedCandidates = filter(
        get(daoDetailsStructed, 'candidates.candidates', []),
        { isVoted: true }
      )
      const preSelectedCandidate = selectCandidateByWalletId(
        get(daoDetailsStructed, 'candidates.candidates', []),
        selectedDacCandidateWalletId
      )

      setCandidateList(preSelectedCandidate)

      updateVotedCandidates(cloneDeep(previouslyVotedCandidates))

      setAlreadyVotedCandidates(cloneDeep(previouslyVotedCandidates))

      setIsSelectionTouched(false)
    }
  }, [daoDetailsStructed, candidateList])

  useEffect(() => {
    if (candidateList && candidateList.length > 0 && candidateList[0].isVoted !== undefined) {
      // const voted = filter(candidateList, { isVoted: true })
      //updateVotedCandidates(cloneDeep(voted))
    }
  }, [candidateList])

  useEffect(() => {
    if (isAlreadyVotedTwo) {
      toastErrorMessage('Already Voted For Two Candidates, Try Removing one')
      setAlreadyVotedTwo(false)
    }
  }, [isAlreadyVotedTwo])

  useEffect(() => {
    showGovernanceSignCandidateVotePage({ id: planetId, walletId: walletIdParam })
  }, [])

  useEffect(() => {
    const newSortedCandidates = sortCandidates(
      candidatesFilter,
      reverseCandidatesSorting,
      candidateList
    )

    setCandidateList(newSortedCandidates)
  }, [candidatesFilter, reverseCandidatesSorting])

  useEffect(() => {
    if (votedCandidatesList && votedCandidatesList.length === 2) {
      const votedCandidatesWalletIds = map(votedCandidatesList, 'candidate_name')

      const candidatesHaveBeenVoted = filter(alreadyVotedCandidates, (candidate) =>
        votedCandidatesWalletIds.includes(candidate.candidate_name)
      )
      const areBothCandidatesHaveBeenVoted = candidatesHaveBeenVoted.length === 2
      setShowRefreshVotesButton(areBothCandidatesHaveBeenVoted)
    } else {
      setShowRefreshVotesButton(false)
    }
  }, [votedCandidatesList])

  useEffect(() => {
    if (selectedDacCandidateWalletId) {
      onClickListItem(selectedDacCandidateWalletId)
    }
  }, [selectedDacCandidateWalletId])

  useEffect(() => {
    if (!walletIdParam) {
      setSelectedCandidate(null)
      setIsSelectionTouched(false)
    }
  }, [walletIdParam])

  if (walletDaoDetailsLoading) return <LoadingSpinner />
  if (candidateList && candidateList.length > 0) {
    return (
      <Box mt={6}>
        {!selectedCandidate && isMediumScreen && (
          <CandidateListFull
            candidateList={candidateList}
            onClickListItem={onClickListItem}
            addOrRemoveVoteSelection={addOrRemoveVoteSelection}
            votedCandidates={votedCandidatesList}
            CheckTermsAndConditionValidation={CheckTermsAndConditionValidation}
            isSelectionTouched={isSelectionTouched}
            candidatesFilter={candidatesFilter}
            setCandidatesFilter={setCandidatesFilter}
            setMenuVisible={setMenuVisible}
            reverseCandidatesSorting={reverseCandidatesSorting}
            setReverseCandidatesSorting={setReverseCandidatesSorting}
            clickAwayRef={ref}
            votePower={votePower}
            showRefreshVotesButton={showRefreshVotesButton}
            refreshVotes={refreshVotes}
            currentMemberTermsVersion={currentMemberTermsVersion}
          />
        )}

        {!selectedCandidate && !isMediumScreen && (
          <Grid gridTemplateColumns="100%" gap="4">
            <GridItem>
              <CandidateListSmall
                candidateList={candidateList}
                onClickListItem={onClickListItem}
                votedCandidates={votedCandidatesList}
                CheckTermsAndConditionValidation={CheckTermsAndConditionValidation}
                isSelectionTouched={isSelectionTouched}
                votePower={votePower}
                showRefreshVotesButton={showRefreshVotesButton}
                refreshVotes={refreshVotes}
              />
            </GridItem>
          </Grid>
        )}

        {selectedCandidate && (
          <Grid
            gap="4"
            display={{ base: 'flex', '2xl': 'grid' }}
            flexDirection={{ base: 'column', '2xl': 'row' }}
            gridTemplateColumns={
              selectedCandidate && isMediumScreen ? '55% calc(45% - 15px)' : '100%'
            }
          >
            <GridItem width="100%">
              <CandidateCard
                selectedCandidate={selectedCandidate}
                addOrRemoveVoteSelection={addOrRemoveVoteSelection}
                CandidateButtonState={CandidateButtonState}
              />
            </GridItem>

            <GridItem>
              <CandidateListSmall
                candidateList={candidateList}
                onClickListItem={onClickListItem}
                votedCandidates={votedCandidatesList}
                CheckTermsAndConditionValidation={CheckTermsAndConditionValidation}
                isSelectionTouched={isSelectionTouched}
                votePower={votePower}
                showRefreshVotesButton={showRefreshVotesButton}
                refreshVotes={refreshVotes}
              />
            </GridItem>
          </Grid>
        )}
      </Box>
    )
  }
  return <LoadingSpinner />
}
