import { act, fireEvent, screen } from '@testing-library/react'
import { AddStakingVotePower } from 'features/syndicates/components/AddStakingVotePower/AddStakingVotePower'
import { StakingVotePower } from 'features/syndicates/components/StakingVotePower/StakingVotePower'
import { StakingVotePowerWithReleaseTimer } from 'features/syndicates/modals/StakingVotePowerWithReleaseTimer/StakingVotePowerWithReleaseTimer'
import { buildDaoDetails, buildWalletDaoDetails } from 'features/syndicates/testUtils/fixtures'
import { graphqlHooks, mockGraphql } from 'features/syndicates/testUtils/graphqlMock'
import { mockApolloClient, stubResizeObserver } from 'features/syndicates/testUtils/mocks'
import {
  mockStore,
  renderSyndicates,
  updateMockState,
} from 'features/syndicates/testUtils/mockStore'
import { DAO_WALLET_DETAILS_QUERY } from 'graphql/queries/daoWalletDetails'
import { USER_DAO_BALANCES } from 'graphql/queries/userDaoBalances'
import { useModalStore } from 'shared/store/modalStore'
import { useSessionStore } from 'shared/store/sessionStore'
import { RequestState } from 'store/wax/types'

// The three vote power staking modals share one flow: enter an amount, confirm on
// ConfirmStakingPower, call wax.tryStakeVotePower, and close once wax.actionProgressState
// reports success.

jest.mock('store', () => jest.requireActual('features/syndicates/testUtils/mockStore').storeMock)
jest.mock(
  'graphql/hooks/useDaoDetails',
  () => jest.requireActual('features/syndicates/testUtils/graphqlMock').modules.useDaoDetails
)
jest.mock(
  'graphql/hooks/useWalletDaoDetails',
  () => jest.requireActual('features/syndicates/testUtils/graphqlMock').modules.useWalletDaoDetails
)
jest.mock(
  '@alien-worlds/uikit',
  () => jest.requireActual('features/syndicates/testUtils/mocks').uikitMock
)
jest.mock(
  '@apollo/client',
  () => jest.requireActual('features/syndicates/testUtils/mocks').apolloMock
)
jest.mock(
  'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon',
  () => jest.requireActual('features/syndicates/testUtils/mocks').glossaryIconMock
)
jest.mock(
  'features/mining/components/PlanetLand/Components/PlanetImage',
  () => jest.requireActual('features/syndicates/testUtils/mocks').planetImageMock
)
jest.mock('shared/util/analytics', () => ({ collectEvent: jest.fn() }))

const cases = [
  ['StakingVotePower', StakingVotePower, 'StakingVotePower'],
  ['AddStakingVotePower', AddStakingVotePower, 'AddStakingVotePower'],
  [
    'StakingVotePowerWithReleaseTimer',
    StakingVotePowerWithReleaseTimer,
    'StakingVotePowerWithRelease',
  ],
] as const

const daoDetails = buildDaoDetails()

const setup = (Component: () => JSX.Element, modalName: string) => {
  const wax = { tryStakeVotePower: jest.fn(), resetActionProgressState: jest.fn() }
  mockStore({
    state: { wax: { selectedDacId: 'kavian', actionProgressState: null } },
    actions: { wax },
  })
  useModalStore.getState().setPrimaryModalActive({ modalName: modalName as any, value: true })
  renderSyndicates(<Component />)
  return wax
}

const isOpen = (modalName: string) => useModalStore.getState().primaryModals[modalName]

beforeAll(stubResizeObserver)

beforeEach(() => {
  useSessionStore.setState({ walletId: 'voter.wam', isDemoUser: false })
  mockGraphql({
    daoDetails,
    // 2 days current delay, 100 KAV available.
    walletDaoDetails: buildWalletDaoDetails(),
  })
})

describe.each(cases)('%s', (_, Component, modalName) => {
  it('reads the selected planet and the wallet', () => {
    setup(Component, modalName)

    expect(graphqlHooks.useDaoDetails).toHaveBeenLastCalledWith('kavian')
    expect(graphqlHooks.useWalletDaoDetails).toHaveBeenLastCalledWith({
      dacId: 'kavian',
      walletId: 'voter.wam',
    })
  })

  it('renders nothing while loading', () => {
    mockGraphql({ loading: true })
    setup(Component, modalName)

    expect(screen.queryByLabelText('amount')).not.toBeInTheDocument()
  })

  it('stakes the amount, keeping the current release time, then refetches the balances', async () => {
    const { tryStakeVotePower } = setup(Component, modalName)

    fireEvent.change(screen.getByLabelText('amount'), { target: { value: '10' } })
    fireEvent.click(screen.getByRole('button', { name: /^Stake 10\.0000 TLM in\s+Kavian$/ }))
    await act(async () => {})
    fireEvent.click(screen.getByRole('button', { name: 'Yes, Stake this Vote Power' }))
    await act(async () => {})

    expect(tryStakeVotePower).toHaveBeenCalledWith({
      planet: daoDetails,
      amount: 10,
      releaseTime: 2,
      currentVotingDelay: 2,
    })
    expect(mockApolloClient.refetchQueries).toHaveBeenCalledWith({
      include: [DAO_WALLET_DETAILS_QUERY, USER_DAO_BALANCES],
    })
  })

  it('closes and resets the progress once the staking succeeds', () => {
    const { resetActionProgressState } = setup(Component, modalName)

    updateMockState('wax', { actionProgressState: RequestState.Succeeded })

    expect(isOpen(modalName)).toBe(false)
    expect(resetActionProgressState).toHaveBeenCalled()
  })

  it('stays open while in progress or after a failure', () => {
    setup(Component, modalName)

    updateMockState('wax', { actionProgressState: RequestState.InProgress })
    updateMockState('wax', { actionProgressState: RequestState.Failed })

    expect(isOpen(modalName)).toBe(true)
  })
})

it('StakingVotePower also resets the progress each time it changes (its effect cleanup)', () => {
  const { resetActionProgressState } = setup(StakingVotePower, 'StakingVotePower')
  expect(resetActionProgressState).not.toHaveBeenCalled()

  // The effect's cleanup runs before each new value.
  updateMockState('wax', { actionProgressState: RequestState.InProgress })

  expect(resetActionProgressState).toHaveBeenCalledTimes(1)
})
