import { PrimaryModalWithActions, SecondaryModalWithActions } from 'store/modal/types'

export function getKeys<T>(obj: T): Array<keyof T> {
  return Object.keys(obj) as Array<keyof T>
}

export const getDefaultSecondaryModalState = () =>
  <SecondaryModalWithActions>{
    NotEnoughTokensGenericModal: false,
    NotEnoughTokensToVoteModal: false,
    NotSignedMemberTermsModal: false,
    SignMemberTermsModal: false,
    ErrorModal: false,
    NotEnoughTokensToBecomeCandidateModal: false,
    BlockchainSubmitDisclaimerModal: false,

    onConfirm: () => null,
    onCancel: () => null,
  }
export const getDefaultPrimaryModalState = () =>
  <PrimaryModalWithActions>{
    LoginModal: false,
    SignUpModal: false,
    ShiningModal: false,
    LoadingModal: false,
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
  }
