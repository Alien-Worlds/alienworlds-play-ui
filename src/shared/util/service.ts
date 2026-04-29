import coinbaseModule from '@web3-onboard/coinbase'
import injectedModule from '@web3-onboard/injected-wallets'
import { ProviderLabel, WalletFilters } from '@web3-onboard/injected-wallets/dist/types'
import { init } from '@web3-onboard/react'
import walletConnectModule from '@web3-onboard/walletconnect'
import { map } from 'lodash'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'

import alienworldsIcon from '../../assets/images/icons/alien-worlds-icon'
import alienworldslogo from '../../assets/images/icons/alien-worlds-logo'

// Replace with your DApp's Infura ID

const coinbase = coinbaseModule()
const walletConnect = walletConnectModule({
  projectId: config.WalletConnectProjectId,
  version: 2,
  dappUrl: config.WalletConnectDappUrl,
})

const notSupportedWallets: WalletFilters = {
  [ProviderLabel.ApexWallet]: false,
  [ProviderLabel.BifrostWallet]: false,

  [ProviderLabel.Bitski]: false,
  [ProviderLabel.BlockWallet]: false,
  [ProviderLabel.Brave]: false,

  [ProviderLabel.Core]: false,
  [ProviderLabel.DeFiWallet]: false,
  [ProviderLabel.Enkrypt]: false,
  [ProviderLabel.Exodus]: false,
  [ProviderLabel.Frame]: false,
  [ProviderLabel.Frontier]: false,

  [ProviderLabel.InfinityWallet]: false,
  [ProviderLabel.Liquality]: false,
  [ProviderLabel.MathWallet]: false,

  [ProviderLabel.Opera]: false,
  [ProviderLabel.Phantom]: false,
  [ProviderLabel.Rabby]: false,
  [ProviderLabel.Rainbow]: false,
  [ProviderLabel.SafePal]: false,
  [ProviderLabel.Safeheron]: false,
  [ProviderLabel.Sequence]: false,
  [ProviderLabel.Tally]: false,
  [ProviderLabel.Talisman]: false,
  [ProviderLabel.TokenPocket]: false,
  [ProviderLabel.Tokenary]: false,
  [ProviderLabel.Binance]: false,
  [ProviderLabel.XDEFI]: false,
  [ProviderLabel.Zeal]: false,
  [ProviderLabel.Zerion]: false,
  [ProviderLabel.OKXWallet]: false,
  // Force user to use non-injected wallet on mobile and use walletConnect instead
  [ProviderLabel.MetaMask]: ['mobile'],
  [ProviderLabel.Detected]: ['mobile'],
}

const injected = injectedModule({
  // display all wallets even if they are unavailable
  displayUnavailable: false,

  // do a manual sort of injected wallets so that MetaMask and Coinbase are ordered first
  filter: notSupportedWallets,
  sort: (wallets) => {
    const values = {}
    map(wallets, (wal) => {
      values[wal.label] = false
    })

    return (
      [...wallets.filter(({ label }) => label !== 'metamask')]
        // remove undefined values
        .filter((wallet) => wallet)
    )
  },
})

const wallets = [coinbase, injected, walletConnect]

const chainsIDsDevelopment = [
  {
    id: '0x38',
    token: 'BNB',
    label: 'Binance',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
  },
  {
    id: '0x61',
    token: 'BNB',
    label: 'BNB-Testnet',
    rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545/',
  },
]

const chainsIDsProduction = [
  {
    id: '0x38',
    token: 'BNB',
    label: 'Binance',
    rpcUrl: 'https://bsc-dataseed.binance.org/',
  },
]

export const initWeb3Onboard = init({
  wallets,
  chains: config.IsDevelopment ? chainsIDsDevelopment : chainsIDsProduction,
  appMetadata: {
    name: 'Alien Worlds',
    icon: alienworldsIcon,
    logo: alienworldslogo,
    description: ' ',
    recommendedInjectedWallets: [
      { name: 'Coinbase', url: 'https://wallet.coinbase.com/' },
      { name: 'MetaMask', url: 'https://metamask.io' },
      { name: 'Trust Wallet', url: 'https://trustwallet.com/' },
    ],
  },
  accountCenter: {
    desktop: {
      enabled: true,
      position: 'topRight',
    },
    mobile: {
      enabled: true,
      position: 'topRight',
    },
  },
  theme: {
    '--w3o-background-color': Colors.BLACK_SOLID_100,
    '--w3o-foreground-color': Colors.BLACK_SOLID_100,
    '--w3o-text-color': Colors.SNOW_WHITE,
    '--w3o-border-color': Colors.SNOW_WHITE_ALPHA_50,
  },
})
