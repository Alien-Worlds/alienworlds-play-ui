import { useSessionStore } from 'shared/store/sessionStore'
import { Constants } from 'shared/util/constants'
import { toastErrorMessage, toastMessage } from 'shared/util/toast'

import { transact } from './transact'

/**
 * The player's TLM claims: mining rewards, landowner commissions and allowance, and unstaked
 * DAO tokens. Used by profile and syndicates. Ported from Overmind's `wax.tryClaim*` actions and
 * their `wax.api` effects.
 */

const auth = (walletId: string) => [{ actor: walletId, permission: 'active' }]

export const buildClaimMiningRewardsActions = (walletId: string) => [
  {
    account: Constants.CONTRACT_M_FEDERATION,
    name: Constants.CONTRACT_M_FEDERATION_ACTION_CLAIMMINES,
    authorization: auth(walletId),
    data: { receiver: walletId },
  },
]

export const buildClaimLandownerCommissionsActions = (walletId: string) => [
  {
    account: Constants.CONTRACT_M_FEDERATION,
    name: Constants.CONTRACT_M_FEDERATION_ACTION_CLAIMCOMMS,
    authorization: auth(walletId),
    data: { receiver: walletId },
  },
]

export const buildClaimLandownerAllowanceActions = (walletId: string) => [
  {
    account: Constants.CONTRACT_LAND_RATINGS,
    name: Constants.CONTRACT_LAND_RATINGS_ACTION_CLAIMPAY,
    authorization: auth(walletId),
    data: { receiver: walletId },
  },
]

/** `symbol` is the DAO token symbol with precision, e.g. "4,NERI". */
export const buildClaimUnstakeActions = (walletId: string, symbol: string) => [
  {
    account: Constants.CONTRACT_TOKEN_WORLDS,
    name: Constants.CONTRACT_TOKEN_WORLDS_ACTION_CLAIMUNSTKES,
    authorization: auth(walletId),
    data: { account: walletId, token_symbol: symbol },
  },
]

/** Signs the claim, toasting the error and resolving false if it fails or nobody is logged in. */
const claim = async (
  build: (walletId: string) => Parameters<typeof transact>[0],
  fallbackError: string,
  successMessage?: string
) => {
  const walletId = useSessionStore.getState().walletId
  if (!walletId) return false

  try {
    await transact(build(walletId))
  } catch (error) {
    toastErrorMessage(error?.toString() || fallbackError)
    console.error(error)
    return false
  }
  if (successMessage) toastMessage(successMessage)
  return true
}

export const claimMiningRewards = () =>
  claim(buildClaimMiningRewardsActions, 'Claim Mining Rewards has failed.')

export const claimLandownerCommissions = () =>
  claim(buildClaimLandownerCommissionsActions, 'Claim Landowner Commissions has failed.')

export const claimLandownerAllowance = () =>
  claim(buildClaimLandownerAllowanceActions, 'Claim Landowner Allowance has failed.')

export const claimUnstake = (symbol: string) =>
  claim(
    (walletId) => buildClaimUnstakeActions(walletId, symbol),
    'Claim TLM has failed',
    'TLM claimed successfully.'
  )
