import { ReactNode, createContext, useContext, useMemo } from 'react'

import { useLores } from 'graphql/hooks/useLoreProposals'
import { useWalletDetails } from 'graphql/hooks/useWalletDetails'
import { LoreProposal, WalletDetailsResponse, loresResponse } from 'graphql/types'
import { useAppState } from 'store'

type LoreDataContextValue = {
  lores: loresResponse | null
  proposals: LoreProposal[]
  globals: loresResponse['globals'] | undefined
  walletDetails: WalletDetailsResponse | null
  loreVoterInfo: WalletDetailsResponse['tokenized_lore'] | undefined
  loadingLores: boolean
  walletDetailsLoading: boolean
}

const LoreDataContext = createContext<LoreDataContextValue | undefined>(undefined)

export function LoreDataProvider({ children }: { children: ReactNode }) {
  const {
    wax: { walletId },
  } = useAppState()
  const { lores, loading: loadingLores } = useLores()
  const { walletDetails, loading: walletDetailsLoading } = useWalletDetails(walletId)

  const value = useMemo<LoreDataContextValue>(
    () => ({
      lores: lores ?? null,
      proposals: lores?.proposals ?? [],
      globals: lores?.globals,
      walletDetails: walletDetails ?? null,
      loreVoterInfo: walletDetails?.tokenized_lore,
      loadingLores,
      walletDetailsLoading,
    }),
    [lores, walletDetails, loadingLores, walletDetailsLoading]
  )

  return <LoreDataContext.Provider value={value}>{children}</LoreDataContext.Provider>
}

export function useLoreData(): LoreDataContextValue {
  const context = useContext(LoreDataContext)
  if (!context) {
    throw new Error('useLoreData must be used within a LoreDataProvider')
  }
  return context
}

export function useLoreGlobals() {
  const { globals } = useLoreData()
  return globals
}

export function useLoreProposals() {
  const { proposals } = useLoreData()
  return proposals
}

export function useLoreLoadingState() {
  const { loadingLores, walletDetailsLoading } = useLoreData()
  return { loadingLores, walletDetailsLoading }
}

export function useLoreVotingInfo() {
  const { loreVoterInfo, walletDetails } = useLoreData()
  return { loreVoterInfo, walletDetails }
}
