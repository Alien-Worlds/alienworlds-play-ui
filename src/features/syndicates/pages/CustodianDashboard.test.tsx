import { act, fireEvent, screen } from '@testing-library/react'
import { buildDaoDetails } from 'features/syndicates/testUtils/fixtures'
import { graphqlHooks, mockGraphql } from 'features/syndicates/testUtils/graphqlMock'
import { stubResizeObserver } from 'features/syndicates/testUtils/mocks'
import { mockStore, renderSyndicates } from 'features/syndicates/testUtils/mockStore'
import { useModalStore } from 'shared/store/modalStore'

import { CustodianDashboard } from './CustodianDashboard'

jest.mock('store', () => jest.requireActual('features/syndicates/testUtils/mockStore').storeMock)
jest.mock(
  'graphql/hooks/useDaoDetails',
  () => jest.requireActual('features/syndicates/testUtils/graphqlMock').modules.useDaoDetails
)
jest.mock(
  'graphql/hooks/useMsigsProposals',
  () => jest.requireActual('features/syndicates/testUtils/graphqlMock').modules.useMsigsProposals
)
jest.mock(
  '@alien-worlds/uikit',
  () => jest.requireActual('features/syndicates/testUtils/mocks').uikitMock
)
jest.mock(
  'react-select',
  () => jest.requireActual('features/syndicates/testUtils/mocks').reactSelectMock
)
jest.mock(
  'features/syndicates/components/ProposalsTableVirtualised/ProposalsTableVirtualised',
  () => ({
    ProposalsTableVirtualised: () => null,
  })
)
jest.mock('features/syndicates/utils/GovernanceHelper', () => ({
  ...jest.requireActual('features/syndicates/utils/GovernanceHelper'),
  generateRandomProposalName: () => 'proposal1234',
}))

const actionNames = [
  'tryClaimBudget',
  'tryCreateNewProposal',
  'tryChangeDaoConfigs',
  'trySetDtapConfigs',
  'tryChangeElectionDuration',
] as const

const setup = (selectedDacId = 'kavian') => {
  const wax = Object.fromEntries(actionNames.map((name) => [name, jest.fn()])) as Record<
    (typeof actionNames)[number],
    jest.Mock
  >
  const main = { showGovernanceCustodianDashboard: jest.fn() }
  mockStore({ state: { wax: { selectedDacId } }, actions: { wax, main } })
  renderSyndicates(<CustodianDashboard />, {
    at: `/syndicates/${selectedDacId}/dashboard`,
    path: '/syndicates/:planetId/dashboard',
  })
  return { ...wax, ...main }
}

const proposalType = () => screen.getByLabelText('Select proposal type') as HTMLSelectElement
const chooseType = (value: string) => fireEvent.change(proposalType(), { target: { value } })
const type = (name: string, value: string) => {
  const field =
    name === 'description'
      ? document.querySelector('textarea[name="description"]')
      : screen.getByLabelText(name)
  fireEvent.change(field, { target: { value } })
}
const options = () => Array.from(proposalType().options).map((option) => option.value)

const modals = () => useModalStore.getState().secondaryModals
const confirm = () => act(() => modals().onConfirm())

// The buttons are in the Formik form and submit it too; let its async submit finish.
const click = async (name: string) => {
  fireEvent.click(screen.getByRole('button', { name }))
  await act(async () => {})
}

const titled = {
  proposalTitle: 'Raise the budget',
  proposalDescription: 'More budget for the custodians.',
}

beforeAll(stubResizeObserver)

beforeEach(() => {
  useModalStore.getState().resetAllSecondaryModals()
  mockGraphql({ daoDetails: buildDaoDetails({ owner: 'kavian.dac' }) })
})

describe('CustodianDashboard', () => {
  it('reports the visit for the planet in the URL', () => {
    const { showGovernanceCustodianDashboard } = setup()

    expect(showGovernanceCustodianDashboard).toHaveBeenCalledWith('kavian')
    expect(graphqlHooks.useDaoDetails).toHaveBeenLastCalledWith('kavian')
    expect(graphqlHooks.useMsigsProposals).toHaveBeenLastCalledWith('kavian')
  })

  it('asks for the proposals of an undefined DAO on a union', () => {
    setup('kavianunn')

    expect(graphqlHooks.useMsigsProposals).toHaveBeenLastCalledWith(undefined)
  })

  describe('on a planet', () => {
    it('offers budget, transfer and election proposals, starting with the budget claim', () => {
      setup()

      expect(options()).toEqual([
        '',
        'claim_budget',
        'transfer_tlm',
        'change_election_configs',
        'election_period',
      ])
      expect(proposalType().value).toBe('claim_budget')
    })

    it('claims the budget from the DAO owner', async () => {
      const { tryClaimBudget } = setup()

      await click('Claim Budget')

      expect(tryClaimBudget).toHaveBeenCalledWith({
        metadata: [],
        expirationDays: 7,
        dac_id: 'kavian',
        proposer: 'kavian.dac',
        proposal_name: 'proposal1234',
      })
    })

    it("can't claim while a budget claim is pending", () => {
      mockGraphql({
        daoDetails: buildDaoDetails(),
        msigsProposals: [{ state: 'APPROVABLE', unpacked: { actions: [{ name: 'claimbudget' }] } }],
      })
      setup()

      expect(screen.getByRole('button', { name: 'Claim Budget' })).toBeDisabled()
      expect(screen.getByText('Budget Pending')).toBeInTheDocument()
    })

    it('never sees a claimed budget: executed claims are filtered out before being counted', () => {
      mockGraphql({
        daoDetails: buildDaoDetails(),
        msigsProposals: [{ state: 'EXECUTED', unpacked: { actions: [{ name: 'claimbudget' }] } }],
      })
      setup()

      expect(screen.getByRole('button', { name: 'Claim Budget' })).toBeEnabled()
      expect(screen.queryByText('Budget Claimed')).not.toBeInTheDocument()
    })

    it('proposes a TLM transfer after the disclaimer', async () => {
      const { tryCreateNewProposal } = setup()
      chooseType('transfer_tlm')
      type('title', 'Fund the bridge')
      type('to', 'worker.wam')
      type('item', '25')
      type('memo', 'Bridge work')
      type('description', 'Build a bridge.')

      await click('Create New')
      expect(modals().BlockchainSubmitDisclaimerModal).toBe(true)
      confirm()

      expect(tryCreateNewProposal).toHaveBeenCalledWith({
        tx_actions: [],
        expirationDays: 7,
        dac_id: 'kavian',
        proposal_to: 'worker.wam',
        proposal_memo: 'Bridge work',
        proposer: 'kavian.dac',
        proposal_quantity: '25',
        proposal_name: 'proposal1234',
        metadata: [
          { key: 'title', value: 'Fund the bridge' },
          { key: 'description', value: 'Build a bridge.' },
        ],
      })
    })

    it("doesn't propose a transfer until every field is filled", async () => {
      setup()
      chooseType('transfer_tlm')
      type('title', 'Fund the bridge')

      await click('Create New')

      expect(modals().BlockchainSubmitDisclaimerModal).toBe(false)
    })

    it('proposes new election configs, with half the custodians as votes and threshold', async () => {
      const { tryChangeDaoConfigs } = setup()
      chooseType('change_election_configs')
      fireEvent.change(screen.getByLabelText('Select number of custodians'), {
        target: { value: '11' },
      })
      type('title', titled.proposalTitle)
      type('description', titled.proposalDescription)

      await click('Change Configs')
      expect(modals().BlockchainChangeDaoConfigsDisclaimerModal).toBe(true)
      confirm()

      expect(tryChangeDaoConfigs).toHaveBeenCalledWith({
        dac_id: 'kavian',
        maxvotes: 5,
        auththreshold: 5,
        numelected: 11,
        proposalName: 'proposal1234',
        ...titled,
        proposer: 'kavian.dac',
      })
    })

    it('proposes an election period, 30 days by default', async () => {
      const { tryChangeElectionDuration } = setup()
      chooseType('election_period')
      type('title', titled.proposalTitle)
      type('description', titled.proposalDescription)

      await click('Create Proposal')
      expect(modals().BlockchainSubmitDisclaimerModal).toBe(true)
      confirm()

      expect(tryChangeElectionDuration).toHaveBeenCalledWith({
        dac_id: 'kavian',
        electionDuration: 30,
        proposer: 'kavian.dac',
        ...titled,
        proposalName: 'proposal1234',
      })
    })
  })

  describe('on a union', () => {
    it('offers DTAP, transfer and election period proposals, starting with DTAP', () => {
      setup('kavianunn')

      expect(options()).toEqual(['', 'dtap_reward', 'transfer_tlm', 'election_period'])
      expect(proposalType().value).toBe('dtap_reward')
    })

    it("proposes a DTAP rate for the union's planet: 50% while the slider shows 5", async () => {
      const { trySetDtapConfigs } = setup('kavianunn')
      type('title', titled.proposalTitle)
      type('destination', 'dest.wam')
      type('description', titled.proposalDescription)

      await click('Create Proposal')
      expect(modals().BlockchainDTAPDisclaimerModal).toBe(true)
      confirm()

      expect(trySetDtapConfigs).toHaveBeenCalledWith({
        dac_id: 'kavianunn',
        claim_rate_perc_x100: 5000,
        destination: 'dest.wam',
        planet_name: 'kavian.world',
        proposer: 'kavian.dac',
        ...titled,
        proposalName: 'proposal1234',
      })
      expect(screen.getByRole('slider', { name: 'slider-ex-6' })).toHaveAttribute(
        'aria-valuenow',
        '5'
      )
    })
  })
})
