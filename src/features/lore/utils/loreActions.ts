import { toNumber } from 'lodash'
import { Constants } from 'shared/util/constants'

/**
 * Builders for the lore.worlds transaction actions. Ported from Overmind's `wax.api`
 * (`stakeVotePowerLore`, `unStakeLore`, `claimLoreReward`, `loreVote`, `submitLore`).
 */

const auth = (walletId: string) => [{ actor: walletId, permission: 'active' }]

export const buildStakeActions = (walletId: string, amount: string) => [
  {
    account: Constants.CONTRACT_ALIEN_WORLDS,
    name: Constants.CONTRACT_TABLE_TRANSFER,
    authorization: auth(walletId),
    data: {
      from: walletId,
      to: Constants.CONTRACT_LORE_WORLDS,
      memo: 'staking for lore',
      quantity: `${parseFloat(amount).toFixed(4)} TLM`,
    },
  },
  {
    account: Constants.CONTRACT_LORE_WORLDS,
    name: Constants.CONTRACT_TABLE_STAKE,
    authorization: auth(walletId),
    data: { account: walletId },
  },
]

export const buildUnstakeActions = (walletId: string) => [
  {
    account: Constants.CONTRACT_LORE_WORLDS,
    name: Constants.CONTRACT_TABLE_UNSTAKE,
    authorization: auth(walletId),
    data: { account: walletId },
  },
  {
    account: Constants.CONTRACT_LORE_WORLDS,
    name: Constants.CONTRACT_TABLE_REFUND,
    authorization: auth(walletId),
    data: { account: walletId },
  },
]

export const buildClaimRewardActions = (walletId: string) => [
  {
    account: Constants.CONTRACT_LORE_WORLDS,
    name: Constants.CONTRACT_LORE_WORLD_CLAIM_REWARD,
    authorization: auth(walletId),
    data: { voter: walletId },
  },
]

export type LoreVoteInput = { proposalId: number; vote: string; votePower: number }

export const buildVoteActions = (
  walletId: string,
  { proposalId, vote, votePower }: LoreVoteInput
) => [
  {
    account: Constants.CONTRACT_LORE_WORLDS,
    name: Constants.CONTRACT_LORE_WORLD_VOTE,
    authorization: auth(walletId),
    data: {
      voter: walletId,
      proposal_id: proposalId,
      vote,
      vote_power: `${votePower.toFixed(4)} VP`,
    },
  },
]

export type SubmitLoreInput = { title: string; url: string; description: string; fee: string }

/** Pays the submission fee, then proposes the pull request (id taken from the URL) as lore. */
export const buildSubmitActions = (
  walletId: string,
  { title, url, description, fee }: SubmitLoreInput
) => {
  const id = toNumber(url.split('/').pop())
  return [
    {
      account: Constants.CONTRACT_ALIEN_WORLDS,
      name: Constants.CONTRACT_TABLE_TRANSFER,
      authorization: auth(walletId),
      data: { from: walletId, to: Constants.CONTRACT_LORE_WORLDS, quantity: fee, memo: 'lore' },
    },
    {
      account: Constants.CONTRACT_LORE_WORLDS,
      name: Constants.CONTRACT_MSIG_WORLDS_ACTION_PROPOSE,
      authorization: auth(walletId),
      data: {
        proposal_id: id,
        proposer: walletId,
        title,
        type: 'lore',
        attributes: [
          { key: 'pull_req_id', value: ['uint16', id] },
          { key: 'url', value: ['string', url] },
          { key: 'description', value: ['string', description] },
        ],
      },
    },
  ]
}
