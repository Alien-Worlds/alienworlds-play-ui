import {
  buildDaoDetails,
  buildDaoGlobals,
  buildTreasury,
  buildWalletDaoDetails,
} from 'features/syndicates/testUtils/fixtures'

// Stand-ins for the GraphQL hooks the syndicates components read. Point a test at one with:
//   jest.mock('graphql/hooks/useDaoDetails', () =>
//     jest.requireActual('features/syndicates/testUtils/graphqlMock').modules.useDaoDetails)
// and call `mockGraphql({ ... })` in a beforeEach (CRA resets mock implementations before every
// test). Tests assert on `graphqlHooks.useDaoDetails` etc. to check which DAO a component asks for.
//
// Each value may be a function of the hook's arguments, e.g. to answer the planet and its union
// differently: `daoDetails: (dacId) => (dacId === 'kavianunn' ? union : planet)`.

type Value<T = any> = T | ((...args: any[]) => T)

export type GraphqlData = {
  daoDetails?: Value
  walletDaoDetails?: Value
  daoGlobals?: Value
  dacTreasury?: Value
  msigsProposals?: Value
  walletDetails?: Value
  daoDetailsStructed?: Value
  userDaoBalances?: Value
  /** Every hook reports loading. */
  loading?: boolean
}

export const graphqlHooks = {
  useDaoDetails: jest.fn(),
  useWalletDaoDetails: jest.fn(),
  useDaoGlobals: jest.fn(),
  useDaoTreasuries: jest.fn(),
  useMsigsProposals: jest.fn(),
  useWalletDetails: jest.fn(),
  useStructuredDaoDetail: jest.fn(),
  useUserDaoBalances: jest.fn(),
}

/** Refetch handed out by every hook; reset before each test like the hooks. */
export const mockRefetch = jest.fn()

const resolve = (value: Value, args: unknown[]) =>
  typeof value === 'function' ? value(...args) : value

const answer =
  <K extends string>(key: K, value: Value, loading: boolean) =>
  (...args: unknown[]) => ({
    [key]: resolve(value, args),
    loading,
    error: undefined,
    refetch: mockRefetch,
  })

export const mockGraphql = ({
  daoDetails = buildDaoDetails(),
  walletDaoDetails = buildWalletDaoDetails(),
  daoGlobals = buildDaoGlobals(),
  dacTreasury = (ids: string[]) => ids.map((id) => buildTreasury(id)),
  msigsProposals = [],
  walletDetails = { tag: 'Voter Tag', wallet: 'voter.wam' },
  daoDetailsStructed = undefined,
  userDaoBalances = {},
  loading = false,
}: GraphqlData = {}) => {
  graphqlHooks.useDaoDetails.mockImplementation(answer('daoDetails', daoDetails, loading))
  graphqlHooks.useWalletDaoDetails.mockImplementation(
    answer('walletDaoDetails', walletDaoDetails, loading)
  )
  graphqlHooks.useDaoGlobals.mockImplementation(answer('daoGlobals', daoGlobals, loading))
  graphqlHooks.useDaoTreasuries.mockImplementation(answer('dacTreasury', dacTreasury, loading))
  graphqlHooks.useMsigsProposals.mockImplementation(
    answer('msigsProposals', msigsProposals, loading)
  )
  graphqlHooks.useWalletDetails.mockImplementation(answer('walletDetails', walletDetails, loading))
  graphqlHooks.useStructuredDaoDetail.mockImplementation(
    answer('daoDetailsStructed', daoDetailsStructed ?? daoDetails, loading)
  )
  graphqlHooks.useUserDaoBalances.mockImplementation(
    answer('userDaoBalances', userDaoBalances, loading)
  )
}

// What each hook module exports, forwarding to the mocks above.
export const modules = {
  useDaoDetails: { useDaoDetails: (...args: any[]) => graphqlHooks.useDaoDetails(...args) },
  useWalletDaoDetails: {
    useWalletDaoDetails: (...args: any[]) => graphqlHooks.useWalletDaoDetails(...args),
  },
  useDaoGlobals: { useDaoGlobals: (...args: any[]) => graphqlHooks.useDaoGlobals(...args) },
  useDaoTreasury: {
    useDaoTreasuries: (...args: any[]) => graphqlHooks.useDaoTreasuries(...args),
  },
  useMsigsProposals: {
    useMsigsProposals: (...args: any[]) => graphqlHooks.useMsigsProposals(...args),
  },
  useWalletDetails: {
    useWalletDetails: (...args: any[]) => graphqlHooks.useWalletDetails(...args),
  },
  useStructuredDaoDetail: {
    useStructuredDaoDetail: (...args: any[]) => graphqlHooks.useStructuredDaoDetail(...args),
  },
  useUserDaoBalances: {
    useUserDaoBalances: (...args: any[]) => graphqlHooks.useUserDaoBalances(...args),
  },
}
