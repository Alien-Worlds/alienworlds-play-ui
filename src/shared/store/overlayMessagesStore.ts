import { create } from 'zustand'

// The full-screen messages the layouts show over the page: a loading message (a missions claim,
// or the onboarding flow's progress), and an info or error message to dismiss. Formerly
// Overmind's missions.loadingMessage / infoMessage / errorMessage, which onboarding also wrote.

export interface OverlayMessagesState {
  loadingMessage: string | null
  infoMessage: string | null
  errorMessage: string | null
}

export interface OverlayMessagesStore extends OverlayMessagesState {
  setLoadingMessage: (loadingMessage: string | null) => void
  setInfoMessage: (infoMessage: string | null) => void
  setErrorMessage: (errorMessage: string | null) => void
  clearInfoMessage: () => void
  clearErrorMessage: () => void
}

export const getInitialOverlayMessagesState = (): OverlayMessagesState => ({
  loadingMessage: null,
  infoMessage: null,
  errorMessage: null,
})

export const useOverlayMessagesStore = create<OverlayMessagesStore>((set) => ({
  ...getInitialOverlayMessagesState(),

  setLoadingMessage: (loadingMessage) => set({ loadingMessage }),
  setInfoMessage: (infoMessage) => set({ infoMessage }),
  setErrorMessage: (errorMessage) => set({ errorMessage }),
  clearInfoMessage: () => set({ infoMessage: null }),
  clearErrorMessage: () => set({ errorMessage: null }),
}))
