import { ExternalLinkDisclaimerModal } from 'features/arena/modals/ExternalLinkDisclaimerModal'
import { VideoPlayerModal } from 'features/arena/modals/VideoPlayerModal'
import { SubmitLoreModal } from 'features/lore/modals/SubmitLoreModal'
import { UnstakeLoreModal } from 'features/lore/modals/UnstakeLoreModal'
import { RarityPoolsPieChartModal } from 'features/mining/modals/RarityPoolsPieChartModal'
import { ShiningModal } from 'features/mining/modals/ShiningModal'
import { JoinMissionModal } from 'features/missions/modals/JoinMissionModal'
import { LoginModal } from 'features/onboarding/modals/LoginModal'
import { SignUpModal } from 'features/onboarding/modals/SignUpModal'
import { AddStakingVotePower } from 'features/syndicates/components/AddStakingVotePower'
import { StakingVotePower } from 'features/syndicates/components/StakingVotePower'
import { BlockchainChangeDaoConfigsDisclaimerModal } from 'features/syndicates/modals/BlockchainChangeDaoConfigsDisclaimerModal'
import { BlockchainDTAPDisclaimer } from 'features/syndicates/modals/BlockchainDTAPDisclaimer/BlockchainDTAPDisclaimer'
import { BlockchainSubmitDisclaimerModal } from 'features/syndicates/modals/BlockchainSubmitDisclaimerModal'
import { CancelProposalModal } from 'features/syndicates/modals/CancelProposalModal'
import { ConvertPlanetaryTokenModal } from 'features/syndicates/modals/ConvertPlanetaryTokenModal'
import { ErrorModal } from 'features/syndicates/modals/ErrorModal'
import { LockCandidancyModal } from 'features/syndicates/modals/LockCandidancyModal'
import { NotEnoughTokensGenericModal } from 'features/syndicates/modals/NotEnoughTokensGenericModal'
import { NotEnoughTokensToBecomeCandidateModal } from 'features/syndicates/modals/NotEnoughTokensToBecomeCandidateModal'
import { NotEnoughTokensToVoteModal } from 'features/syndicates/modals/NotEnoughTokensToVoteModal/'
import { NotSignedMemberTermsModal } from 'features/syndicates/modals/NotSignedMemberTermsModal'
import { ProposalErrorModal } from 'features/syndicates/modals/ProposalErrorModal'
import { ResigningCandidancyModal } from 'features/syndicates/modals/ResigningCandidancyModal'
import { SignMemberTermsModal } from 'features/syndicates/modals/SignMemberTermsModal/SignMemberTermsModal'
import { SignVoteModal } from 'features/syndicates/modals/SignVoteModal'
import { StakingVotePowerWithReleaseTimer } from 'features/syndicates/modals/StakingVotePowerWithReleaseTimer'
import { UnstakeCandidancyModal } from 'features/syndicates/modals/UnstakeCandidancyModal'
import { UnstakingVotePower } from 'features/syndicates/modals/UnstakingVotePower'
import { UserWhiteListModal } from 'features/syndicates/modals/UserWhiteListModal'
import { WithDrawCandidancyModal } from 'features/syndicates/modals/WithDrawCandidancyModal'
import { LoadingModal } from 'shared/modals/LoadingModal'
import { NetworkResourcesModal } from 'shared/modals/NetworkResourcesModal'
import { OutpostDisclaimerModal } from 'shared/modals/OutpostDisclaimerModal'
import { useAppState } from 'store'

const ModalLayout = () => {
  const {
    modal: { primaryModals, secondaryModals },
  } = useAppState()
  return (
    <>
      {/* PRIMARY MODALS */}
      {primaryModals.LoginModal && <LoginModal />}
      {primaryModals.SignUpModal && <SignUpModal />}
      {primaryModals.LoadingModal && <LoadingModal />}
      {primaryModals.ShiningModal && <ShiningModal />}
      {primaryModals.CancelProposalModal && <CancelProposalModal />}
      {primaryModals.LockCandidancyModal && <LockCandidancyModal />}
      {primaryModals.ConvertPlanataryTokenModal && <ConvertPlanetaryTokenModal />}
      {primaryModals.ProposalErrorModal && <ProposalErrorModal />}
      {primaryModals.ResigningCustodianModal && <ResigningCandidancyModal />}
      {primaryModals.SignVoteModal && <SignVoteModal />}
      {primaryModals.StakingVotePowerWithRelease && <StakingVotePowerWithReleaseTimer />}
      {primaryModals.UnstakeCandidancyModal && <UnstakeCandidancyModal />}
      {primaryModals.UnstakingVotePower && <UnstakingVotePower />}
      {primaryModals.WithDrawCandidancyModal && <WithDrawCandidancyModal />}
      {primaryModals.OutpostDisclaimerModal && <OutpostDisclaimerModal />}
      {primaryModals.RarityPoolsPieChartModal && <RarityPoolsPieChartModal />}
      {primaryModals.StakingVotePower && <StakingVotePower />}
      {primaryModals.AddStakingVotePower && <AddStakingVotePower />}
      {primaryModals.JoinMissionModal && <JoinMissionModal />}

      {/* SECONDARY MODALS */}
      {secondaryModals.ErrorModal && <ErrorModal />}
      {secondaryModals.NetworkResourcesModal && <NetworkResourcesModal />}
      {secondaryModals.VideoPlayerModal && <VideoPlayerModal />}
      {secondaryModals.ExternalLinkDisclaimerModal && <ExternalLinkDisclaimerModal />}
      {secondaryModals.BlockchainSubmitDisclaimerModal && <BlockchainSubmitDisclaimerModal />}
      {secondaryModals.SignMemberTermsModal && <SignMemberTermsModal />}
      {secondaryModals.NotSignedMemberTermsModal && <NotSignedMemberTermsModal />}
      {secondaryModals.SubmitLoreModal && <SubmitLoreModal />}
      {secondaryModals.NotEnoughTokensToVoteModal && <NotEnoughTokensToVoteModal />}
      {secondaryModals.NotEnoughTokensGenericModal && <NotEnoughTokensGenericModal />}
      {secondaryModals.NotEnoughTokensToBecomeCandidateModal && (
        <NotEnoughTokensToBecomeCandidateModal />
      )}
      {secondaryModals.UnstakeAllLoreModal && <UnstakeLoreModal />}
      {secondaryModals.UserWhiteListModal && <UserWhiteListModal />}
      {secondaryModals.BlockchainChangeDaoConfigsDisclaimerModal && (
        <BlockchainChangeDaoConfigsDisclaimerModal />
      )}
      {secondaryModals.BlockchainDTAPDisclaimerModal && <BlockchainDTAPDisclaimer />}
    </>
  )
}

export default ModalLayout
