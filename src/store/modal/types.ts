import { ErrorTypes } from 'features/syndicates/types/governanceTypes'

type ModalActions = {
  onConfirm?: () => void
  onCancel?: () => void
}

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

export type SecondaryModalWithActions = SecondaryModals & ModalActions

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

export type PrimaryModalWithActions = PrimaryModals & ModalActions

export type SecondaryModal = {
  modalName: keyof SecondaryModals
  value: boolean
  errorType?: ErrorTypes
} & ModalActions

export type PrimaryModal = {
  modalName: keyof PrimaryModals
  value: boolean
  errorType?: ErrorTypes
} & ModalActions
