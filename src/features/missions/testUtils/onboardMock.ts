// Stand-in for `@web3-onboard/react` (the BSC wallet connection), shared by missions tests:
//   jest.mock('@web3-onboard/react', () => jest.requireActual('features/missions/testUtils/onboardMock').onboardMock)
// Set what the hooks return with `mockOnboard({ ... })`; `connect` and `setChain` are jest.fns.

type OnboardState = {
  wallets: any[]
  wallet: any
  connecting: boolean
  connectedChain: { id: string } | null
  connect: jest.Mock
  setChain: jest.Mock
  updateAccountCenter: jest.Mock
}

const onboard: OnboardState = {
  wallets: [],
  wallet: null,
  connecting: false,
  connectedChain: null,
  connect: jest.fn(),
  setChain: jest.fn(),
  updateAccountCenter: jest.fn(),
}

export const mockOnboard = (overrides: Partial<OnboardState> = {}) => {
  Object.assign(onboard, {
    wallets: [],
    wallet: null,
    connecting: false,
    connectedChain: null,
    connect: jest.fn(async () => []),
    setChain: jest.fn(async () => true),
    updateAccountCenter: jest.fn(),
    ...overrides,
  })
  return onboard
}

/** A connected wallet as web3-onboard reports it. */
export const onboardWallet = (
  address = '0xabc0000000000000000000000000000000000001',
  label = 'MetaMask'
) => ({
  label,
  provider: {},
  accounts: [{ address }],
})

export const onboardMock = {
  useWallets: () => onboard.wallets,
  useConnectWallet: () => [
    { wallet: onboard.wallet, connecting: onboard.connecting },
    onboard.connect,
  ],
  useSetChain: () => [{ connectedChain: onboard.connectedChain }, onboard.setChain],
  useAccountCenter: () => onboard.updateAccountCenter,
}
