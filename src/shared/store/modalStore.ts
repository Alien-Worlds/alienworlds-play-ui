import { ErrorTypes } from 'features/syndicates/types/governanceTypes'
import { create } from 'zustand'

export type SecondaryModals = {
  NotEnoughTokensGenericModal: boolean
  NotEnoughTokensToVoteModal: boolean
  NotSignedMemberTermsModal: boolean
  SignMemberTermsModal: boolean
  ErrorModal: boolean
  NotEnoughTokensToBecomeCandidateModal: boolean
  BlockchainSubmitDisclaimerModal: boolean
  ExternalLinkDisclaimerModal: boolean
  VideoPlayerModal: boolean
  NetworkResourcesModal: boolean
  SubmitLoreModal: boolean
  UnstakeAllLoreModal: boolean
  UserWhiteListModal: boolean
  BlockchainChangeDaoConfigsDisclaimerModal: boolean
  BlockchainDTAPDisclaimerModal: boolean
}

export type PrimaryModals = {
  LoginModal: boolean
  SignUpModal: boolean
  LoadingModal: boolean
  ShiningModal: boolean
  LockCandidancyModal: boolean
  UnstakeCandidancyModal: boolean
  ProposalErrorModal: boolean
  ResigningCustodianModal: boolean
  WithDrawCandidancyModal: boolean
  SignVoteModal: boolean
  CancelProposalModal: boolean
  ConvertPlanataryTokenModal: boolean
  StakingVotePowerWithRelease: boolean
  UnstakingVotePower: boolean
  StakingVotePower: boolean
  AddStakingVotePower: boolean
  OutpostDisclaimerModal: boolean
  RarityPoolsPieChartModal: boolean
  JoinMissionModal: boolean
}

type ModalActionCallbacks = {
  onConfirm: (() => void) | null
  onCancel: (() => void) | null
}

export type SecondaryModalState = SecondaryModals & ModalActionCallbacks
export type PrimaryModalState = PrimaryModals & ModalActionCallbacks

export type SetSecondaryModalActiveInput = {
  modalName: keyof SecondaryModals
  value: boolean
  onConfirm?: (() => void) | null
  onCancel?: (() => void) | null
  errorType?: ErrorTypes
}

export type SetPrimaryModalActiveInput = {
  modalName: keyof PrimaryModals
  value: boolean
  onConfirm?: (() => void) | null
  onCancel?: (() => void) | null
  errorType?: ErrorTypes
}

const getDefaultSecondaryModalState = (): SecondaryModalState => ({
  NotEnoughTokensGenericModal: false,
  NotEnoughTokensToVoteModal: false,
  NotSignedMemberTermsModal: false,
  SignMemberTermsModal: false,
  ErrorModal: false,
  NotEnoughTokensToBecomeCandidateModal: false,
  BlockchainSubmitDisclaimerModal: false,
  ExternalLinkDisclaimerModal: false,
  VideoPlayerModal: false,
  NetworkResourcesModal: false,
  SubmitLoreModal: false,
  UnstakeAllLoreModal: false,
  UserWhiteListModal: false,
  BlockchainChangeDaoConfigsDisclaimerModal: false,
  BlockchainDTAPDisclaimerModal: false,
  onConfirm: () => null,
  onCancel: () => null,
})

const getDefaultPrimaryModalState = (): PrimaryModalState => ({
  LoginModal: false,
  SignUpModal: false,
  LoadingModal: false,
  ShiningModal: false,
  LockCandidancyModal: false,
  UnstakeCandidancyModal: false,
  ProposalErrorModal: false,
  ResigningCustodianModal: false,
  WithDrawCandidancyModal: false,
  SignVoteModal: false,
  CancelProposalModal: false,
  ConvertPlanataryTokenModal: false,
  StakingVotePowerWithRelease: false,
  UnstakingVotePower: false,
  StakingVotePower: false,
  AddStakingVotePower: false,
  OutpostDisclaimerModal: false,
  RarityPoolsPieChartModal: false,
  JoinMissionModal: false,
  onConfirm: () => null,
  onCancel: () => null,
})

const computeIsModalActive = (
  primaryModals: PrimaryModalState,
  secondaryModals: SecondaryModalState
): boolean =>
  Object.values(primaryModals).some((value) => value === true) ||
  Object.values(secondaryModals).some((value) => value === true)

export interface ModalStore {
  secondaryModals: SecondaryModalState
  primaryModals: PrimaryModalState
  errorType: ErrorTypes | null
  isModalActive: boolean
  setSecondaryModalActive: (input: SetSecondaryModalActiveInput) => void
  resetAllSecondaryModals: () => void
  setPrimaryModalActive: (input: SetPrimaryModalActiveInput) => void
  resetAllPrimaryModals: () => void
}

export const useModalStore = create<ModalStore>((set, get) => ({
  secondaryModals: getDefaultSecondaryModalState(),
  primaryModals: getDefaultPrimaryModalState(),
  errorType: null,
  isModalActive: false,

  resetAllSecondaryModals: () => {
    const secondaryModals: SecondaryModalState = {
      ...getDefaultSecondaryModalState(),
      onConfirm: null,
      onCancel: null,
    }
    set({
      secondaryModals,
      errorType: null,
      isModalActive: computeIsModalActive(get().primaryModals, secondaryModals),
    })
  },

  setSecondaryModalActive: ({ modalName, value, onConfirm, onCancel, errorType }) => {
    get().resetAllSecondaryModals()
    const secondaryModals: SecondaryModalState = {
      ...get().secondaryModals,
      [modalName]: value,
      onConfirm: onConfirm ?? null,
      onCancel: onCancel ?? null,
    }
    set({
      secondaryModals,
      errorType: errorType ?? null,
      isModalActive: computeIsModalActive(get().primaryModals, secondaryModals),
    })
  },

  // Fixed during the Zustand port: the Overmind version iterated `secondaryModals`
  // keys here (copy-paste from resetAllSecondaryModals), so it never actually
  // cleared any primary modal flag. See migration plan Phase 1.
  resetAllPrimaryModals: () => {
    const primaryModals: PrimaryModalState = {
      ...getDefaultPrimaryModalState(),
      onConfirm: null,
      onCancel: null,
    }
    set({
      primaryModals,
      errorType: null,
      isModalActive: computeIsModalActive(primaryModals, get().secondaryModals),
    })
  },

  setPrimaryModalActive: ({ modalName, value, onConfirm, onCancel, errorType }) => {
    get().resetAllPrimaryModals()
    const primaryModals: PrimaryModalState = {
      ...get().primaryModals,
      [modalName]: value,
      onConfirm: onConfirm ?? null,
      onCancel: onCancel ?? null,
    }
    set({
      primaryModals,
      errorType: errorType ?? null,
      isModalActive: computeIsModalActive(primaryModals, get().secondaryModals),
    })
  },
}))
