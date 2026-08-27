import { create } from 'zustand'

interface ProfileStore {
  claimingStates: Record<string, boolean>
  setClaiming: (key: string, value: boolean) => void
}

export const useProfileStore = create<ProfileStore>((set) => ({
  claimingStates: {},
  setClaiming: (key, value) =>
    set((state) => ({ claimingStates: { ...state.claimingStates, [key]: value } })),
}))
