import { useQuery } from '@apollo/client'
import { DAO_DETAILS_QUERY } from 'graphql/queries/daoDetails'
import { DAO_WALLET_DETAILS_QUERY } from 'graphql/queries/daoWalletDetails'
import { Candidate } from 'graphql/types'
import { cloneDeep, get, map } from 'lodash'

const useStructuredDaoDetail = ({ dacId, walletId }: { dacId: string; walletId: string }) => {
  const shouldFetchDaoDetails = dacId && dacId.length > 0
  const { data: daoDetailsData, loading: daoDetailsLoading } = useQuery(DAO_DETAILS_QUERY, {
    variables: {
      dacId: dacId,
      sortBy: 'decay_rank',
      activeCandidates: true,
      reverse: false,
      limit: 100,
      custodiansSortBy2: 'decay_rank',
      custodiansReverse2: false,
      custodiansLimit2: 10,
    },
    fetchPolicy: 'cache-first', // Uses cache if available, no extra request
    nextFetchPolicy: 'cache-and-network',
    skip: !shouldFetchDaoDetails,
    // Fetches fresh data when needed
  })
  const daoDetails = get(daoDetailsData, 'dao_details', null)

  const shouldFetch = walletId && walletId.length > 0 && dacId && dacId.length > 0
  const {
    data,
    loading: walletDetailsLoading,
    error,
    refetch,
  } = useQuery(DAO_WALLET_DETAILS_QUERY, {
    variables: {
      wallet: walletId,
      dac_id: dacId,
    },
    fetchPolicy: 'cache-first',
    skip: !shouldFetch,
    // Uses cache if available, no extra request
    // Fetches fresh data when needed
  })

  let candidates: Candidate[] = get(daoDetails, 'candidates.candidates', [])
  const walletDaoDetails = get(data, 'dao_wallet_details', null)
  const currentMemberTermsVersion = get(daoDetails, 'member_terms.version', 0)
  const userVotedCandidates = get(walletDaoDetails, 'votes.candidates', [])
  candidates = map(candidates, (candidate) => ({
    ...candidate, // Spread existing properties
    isSelected: false,
    isVoteAdded: false,
    isSignedVoteRemoved: false,
    rankIndex: candidates.indexOf(candidate),
    isVoted: userVotedCandidates.includes(candidate.candidate_name),
    voteDecay: Math.floor(
      (new Date().getTime() - new Date(candidate.avg_vote_time_stamp).getTime()) /
        (1000 * 60 * 60 * 24)
    ),
    hasSignedCurrentDaoTerms: candidate.member_terms_version === currentMemberTermsVersion,
  }))
  const loading = daoDetailsLoading || walletDetailsLoading
  let daoDetailsStructed = loading ? undefined : cloneDeep(daoDetails)
  if (
    daoDetailsStructed &&
    daoDetailsStructed.candidates &&
    daoDetailsStructed.candidates.candidates.length > 0
  ) {
    daoDetailsStructed.candidates.candidates = candidates
  }

  return { daoDetailsStructed, loading, error, refetch }
}

export { useStructuredDaoDetail }
