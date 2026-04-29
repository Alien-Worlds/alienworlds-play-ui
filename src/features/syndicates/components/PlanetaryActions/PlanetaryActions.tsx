import { useState } from 'react'

import {
  DTALIcon,
  TriliumIcon,
  ProfitsIcon,
  CustodianIcon,
  ProposalsIcon,
  ConvertTKNIcon,
  GovernanceIcon,
  ViewCandidateIcon,
  LockIcon2,
} from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { VStack, Box, Text, Flex } from '@chakra-ui/react'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { useWalletDetails } from 'graphql/hooks/useWalletDetails'
import { DaoDetailsResponse, WalletDetailsResponse } from 'graphql/types'
import { capitalize, get, lowerCase } from 'lodash'
import { useNavigate } from 'react-router-dom'
import { Colors } from 'shared/util/colors'
import { convertPlanetIdToName, getMiningRewardsTimeInHours } from 'shared/util/helpers'
import { useScreenSize } from 'shared/util/hooks'
import { formatNumber } from 'shared/util/numbers'
import { useActions, useAppState } from 'store'
import { PagePath } from 'store/main/types'

export const VisitPlanetBtn = ({ selectedDac }: { selectedDac: DaoDetailsResponse }) => {
  const {
    main: { toggleMainDrawer },
  } = useActions()
  const navigate = useNavigate()
  const { isNotDesktop } = useScreenSize()

  return (
    <Button
      height="56px"
      size="lg"
      minWidth="240px"
      maxWidth="240px"
      fontSize={16}
      variant="argon"
      isFullWidth={!isNotDesktop}
      style={{ borderRadius: '14px' }}
      width={isNotDesktop ? 'full' : '240px'}
      leftIcon={<GovernanceIcon boxSize="20px" />}
      onClick={() => {
        toggleMainDrawer()
        navigate(`${PagePath.GovernanceSelect}/${lowerCase(selectedDac?.title)}`)
      }}
    >
      Visit Planet
    </Button>
  )
}

export const AddVotePowerBtn = () => {
  const {
    modal: { setPrimaryModalActive },
  } = useActions()
  const {
    wax: { isDemoUser },
  } = useAppState()

  const { isNotDesktop } = useScreenSize()
  return (
    <Button
      isActive
      height="56px"
      size="lg"
      minWidth="240px"
      maxWidth="240px"
      variant="info"
      fontSize={16}
      justifyContent="center"
      isFullWidth={!isNotDesktop}
      style={{ borderRadius: '14px' }}
      width={isNotDesktop ? 'full' : '240px'}
      leftIcon={<ConvertTKNIcon boxSize="20px" />}
      onClick={() => {
        if (isDemoUser) {
          setPrimaryModalActive({ modalName: 'LoginModal', value: true })
        } else {
          setPrimaryModalActive({ modalName: 'StakingVotePower', value: true })
        }
      }}
    >
      Add Vote Power
    </Button>
  )
}

export const ConvertTokenBtn = ({ selectedDac }: { selectedDac: DaoDetailsResponse }) => {
  const {
    modal: { setPrimaryModalActive },
  } = useActions()
  const {
    wax: { isDemoUser },
  } = useAppState()

  const { isNotDesktop } = useScreenSize()
  return (
    <Button
      isActive
      height="56px"
      size="lg"
      minWidth="240px"
      maxWidth="240px"
      variant="info"
      fontSize={16}
      isFullWidth={!isNotDesktop}
      style={{ borderRadius: '14px' }}
      width={isNotDesktop ? 'full' : '240px'}
      leftIcon={<ConvertTKNIcon boxSize="20px" />}
      onClick={() => {
        if (isDemoUser) {
          setPrimaryModalActive({ modalName: 'LoginModal', value: true })
        } else {
          setPrimaryModalActive({ modalName: 'ConvertPlanataryTokenModal', value: true })
        }
      }}
    >
      Stake TLM in {capitalize(convertPlanetIdToName(selectedDac.dac_id))}
    </Button>
  )
}

export const SignMemberTermsBtn = ({ selectedDacId }: { selectedDacId: string }) => {
  const {
    wax: { signPlanetMemberTerms },
    modal: { setPrimaryModalActive },
  } = useActions()
  const {
    wax: { isDemoUser },
  } = useAppState()
  const { isNotDesktop } = useScreenSize()

  return (
    <Button
      isActive
      height="56px"
      size="lg"
      minWidth="240px"
      maxWidth="240px"
      variant="info"
      fontSize={16}
      isFullWidth={!isNotDesktop}
      style={{ borderRadius: '14px' }}
      width={isNotDesktop ? 'full' : '240px'}
      leftIcon={<ProposalsIcon boxSize="20px" />}
      onClick={() => {
        if (isDemoUser) {
          setPrimaryModalActive({ modalName: 'LoginModal', value: true })
        } else {
          signPlanetMemberTerms(selectedDacId)
        }
      }}
    >
      Sign Member Terms
    </Button>
  )
}

export const CustodianCentreBtn = ({
  isActive,
  selectedDacId,
}: {
  isActive?: boolean
  selectedDacId: string
}) => {
  const {
    main: { toggleMainDrawer },
  } = useActions()
  const navigate = useNavigate()
  const { isNotDesktop } = useScreenSize()
  return (
    <Button
      height="56px"
      size="lg"
      minWidth="240px"
      maxWidth="240px"
      variant="info"
      fontSize={16}
      isActive={isActive}
      isFullWidth={!isNotDesktop}
      style={{ borderRadius: '14px' }}
      width={isNotDesktop ? 'full' : '240px'}
      leftIcon={<CustodianIcon boxSize="20px" />}
      onClick={() => {
        toggleMainDrawer()
        navigate(`${PagePath.GovernanceSelect}/${selectedDacId}/dashboard`)
      }}
    >
      Custodian Centre
    </Button>
  )
}

export const ManageCandidacyBtn = ({
  isActive,
  selectedDacId,
}: {
  isActive?: boolean
  selectedDacId: string
}) => {
  const {
    main: { toggleMainDrawer },
  } = useActions()
  const navigate = useNavigate()
  const { isNotDesktop } = useScreenSize()
  return (
    <Button
      height="56px"
      size="lg"
      minWidth="240px"
      maxWidth="240px"
      variant="argon"
      fontSize={16}
      isActive={isActive}
      isFullWidth={!isNotDesktop}
      style={{ borderRadius: '14px' }}
      width={isNotDesktop ? 'full' : '240px'}
      leftIcon={<ViewCandidateIcon boxSize="20px" />}
      onClick={() => {
        toggleMainDrawer()
        navigate(`${PagePath.GovernanceSelect}/${selectedDacId}/manage`)
      }}
    >
      Manage Candidacy
    </Button>
  )
}

export const ManageLandBtn = ({ land, isActive }: { land: IAsset; isActive?: boolean }) => {
  const {
    main: { toggleMainDrawer },
  } = useActions()
  const navigate = useNavigate()
  const { isNotDesktop } = useScreenSize()
  return (
    <Button
      height="56px"
      size="lg"
      minWidth="240px"
      maxWidth="240px"
      fontSize={16}
      variant="lithium"
      isActive={isActive}
      isFullWidth={!isNotDesktop}
      color={Colors.CARIBBEAN_GREEN}
      style={{ borderRadius: '14px' }}
      width={isNotDesktop ? 'full' : '240px'}
      borderColor={Colors.CARIBBEAN_GREEN}
      background={Colors.CARIBBEAN_GREEN_ALPHA_30}
      onClick={() => {
        if (land) {
          toggleMainDrawer()
          navigate(`${PagePath.LandMgt}/${land.asset_id}`)
        }
      }}
    >
      Manage Land
    </Button>
  )
}

export const SetLandBtn = ({
  land,
  isActive,
  currentLand,
}: {
  land: IAsset
  isActive?: boolean
  currentLand: IAsset
}) => {
  const {
    wax: { setLand },
  } = useActions()

  const { isNotDesktop } = useScreenSize()
  return (
    <Button
      size="lg"
      height="56px"
      fontSize={16}
      minWidth="240px"
      maxWidth="240px"
      variant="negative"
      isActive={isActive}
      isFullWidth={!isNotDesktop}
      style={{ borderRadius: '14px' }}
      width={isNotDesktop ? 'full' : '240px'}
      onClick={() => {
        if (land?.asset_id !== currentLand?.asset_id) {
          setLand(land?.asset_id)
        }
      }}
    >
      Set Land
    </Button>
  )
}

export const ClaimCommissionRewardsBtn = () => {
  const {
    wax: { tryClaimLandownerCommissions },
  } = useActions()
  const {
    wax: { walletId },
  } = useAppState()

  const { isNotDesktop } = useScreenSize()
  const [isClaimingCommissionRewards, setIsClaimingCommissionRewards] = useState(false)
  const { walletDetails, loading }: { walletDetails: WalletDetailsResponse; loading: boolean } =
    useWalletDetails(walletId)
  const claimableLandownerCommissions = get(walletDetails, 'land_comms.amount', '0.0000 TLM')
  const getButtonDisabled = () => {
    if (
      !claimableLandownerCommissions ||
      claimableLandownerCommissions === '0.0000 TLM' ||
      isClaimingCommissionRewards
    )
      return true

    return false
  }
  if (loading) return <LoadingSpinner />
  return (
    <Button
      size="lg"
      height="56px"
      fontSize={16}
      minWidth="240px"
      maxWidth="240px"
      fontWeight={400}
      variant="lithium"
      justifyContent="center"
      isFullWidth={!isNotDesktop}
      disabled={getButtonDisabled()}
      style={{ borderRadius: '14px' }}
      width={isNotDesktop ? 'full' : '240px'}
      cursor={getButtonDisabled() ? 'not-allowed' : 'pointer'}
      onClick={async () => {
        setIsClaimingCommissionRewards(true)
        await tryClaimLandownerCommissions()
        setIsClaimingCommissionRewards(false)
      }}
      leftIcon={
        <Box ml="-30px">
          <ProfitsIcon
            boxSize="25px"
            color={!claimableLandownerCommissions ? Colors.DARK_GRAY : Colors.SNOW_WHITE}
          />
        </Box>
      }
    >
      <VStack flexDirection="column" alignItems="start" w="150px">
        <Box textAlign="center" fontSize={14} mb="-5px">
          {formatNumber(claimableLandownerCommissions, 4, 4)} TLM
        </Box>
        <Box textAlign="center" fontSize={11}>
          Commission Reward
        </Box>
      </VStack>
    </Button>
  )
}

export const ClaimDTALRewardsBtn = () => {
  const {
    wax: { tryClaimLandownerAllowance },
  } = useActions()
  const {
    wax: { walletId },
  } = useAppState()
  const { walletDetails, loading }: { walletDetails: WalletDetailsResponse; loading: boolean } =
    useWalletDetails(walletId)
  const claimableLandownerAllowance = get(walletDetails, 'land_ratings_payout', '0.0000 TLM')
  const { isNotDesktop } = useScreenSize()
  const [isClaimingDTALRewards, setIsClaimingDTALRewards] = useState(false)

  const getButtonDisabled = () => {
    if (
      !claimableLandownerAllowance ||
      claimableLandownerAllowance === '0.0000 TLM' ||
      isClaimingDTALRewards
    )
      return true

    return false
  }
  if (loading) return <LoadingSpinner inline />
  return (
    <Button
      size="lg"
      height="56px"
      fontSize={16}
      minWidth="240px"
      maxWidth="240px"
      fontWeight={400}
      variant="lithium"
      justifyContent="center"
      isFullWidth={!isNotDesktop}
      disabled={getButtonDisabled()}
      style={{ borderRadius: '14px' }}
      width={isNotDesktop ? 'full' : '240px'}
      cursor={getButtonDisabled() ? 'not-allowed' : 'pointer'}
      onClick={async () => {
        setIsClaimingDTALRewards(true)
        await tryClaimLandownerAllowance()
        setIsClaimingDTALRewards(false)
      }}
      leftIcon={
        <Box ml="-30px">
          <DTALIcon
            boxSize="30px"
            color={!claimableLandownerAllowance ? Colors.DARK_GRAY : Colors.SNOW_WHITE}
          />
        </Box>
      }
    >
      <VStack flexDirection="column" alignItems="start" w="150px">
        <Box textAlign="center" fontSize={14} mb="-5px">
          {formatNumber(claimableLandownerAllowance, 4, 4)} TLM
        </Box>
        <Box textAlign="center" fontSize={11}>
          DTAL Reward
        </Box>
      </VStack>
    </Button>
  )
}

type ClaimMiningRewardsBtnProps = {
  minWidth?: string
  showIcon?: boolean
}

export const ClaimMineRewardsBtn = ({
  minWidth = '240px',
  showIcon = true,
}: ClaimMiningRewardsBtnProps) => {
  const {
    wax: { tryClaimMiningRewards },
  } = useActions()
  const {
    wax: { walletId },
  } = useAppState()

  const { isNotDesktop } = useScreenSize()
  const [isClaimingMiningRewards, setIsClaimingMiningRewards] = useState(false)
  const {
    walletDetails,
    loading: wallletDetailsLoading,
  }: { walletDetails: WalletDetailsResponse; loading: boolean } = useWalletDetails(walletId)

  const claimMiningRewardsTimeInHours = getMiningRewardsTimeInHours(
    get(walletDetails, 'mining_claim.last_claim_time', null)
  )
  const claimableMiningRewards = get(walletDetails, 'mining_claim.amount', '0.0000 TLM')
  const getButtonBorder = () => {
    let border: string

    if (claimMiningRewardsTimeInHours > 0) {
      border = `2px solid ${Colors.RADICAL_RED} !important`
    } else if (!claimableMiningRewards || claimableMiningRewards === '0.0000 TLM') {
      border = `2px solid ${Colors.SNOW_WHITE} !important`
    } else border = `2px solid ${Colors.SECONDARY_GREEN} !important`

    return border
  }

  const getButtonDisabled = () => {
    if (
      !claimableMiningRewards ||
      claimMiningRewardsTimeInHours > 0 ||
      claimableMiningRewards === '0.0000 TLM' ||
      isClaimingMiningRewards
    )
      return true

    return false
  }
  if (wallletDetailsLoading) return <LoadingSpinner inline />
  return (
    <Flex ml={{ base: 0, lg: 'auto' }} justifyContent="center">
      {claimMiningRewardsTimeInHours > 0 && (
        <Text
          fontFamily="orb"
          fontWeight={600}
          position="absolute"
          letterSpacing="1px"
          color={Colors.RADICAL_RED}
          pt={{ base: '10px', md: '10px' }}
          fontSize={{ base: 16, md: 20 }}
          pr={{ base: '170', sm: '170px' }}
          ml={claimMiningRewardsTimeInHours > 9 ? '15px' : '3px'}
        >
          {claimMiningRewardsTimeInHours}h
        </Text>
      )}

      {claimMiningRewardsTimeInHours > 0 && (
        <Flex mr="-10px" mt="-5px">
          <LockIcon2 boxSize="20px" color={Colors.RADICAL_RED} />
        </Flex>
      )}

      <Button
        height="56px"
        size="lg"
        minWidth={minWidth}
        maxWidth={minWidth}
        fontSize={16}
        fontWeight={400}
        variant="lithium"
        opacity="1 !important"
        justifyContent="center"
        border={getButtonBorder()}
        isFullWidth={!isNotDesktop}
        loadingText="Claiming TLM..."
        disabled={getButtonDisabled()}
        style={{ borderRadius: '14px' }}
        isLoading={isClaimingMiningRewards}
        width={isNotDesktop ? 'full' : '240px'}
        cursor={getButtonDisabled() ? 'not-allowed' : 'pointer'}
        onClick={async () => {
          setIsClaimingMiningRewards(true)
          await tryClaimMiningRewards()
          setTimeout(() => setIsClaimingMiningRewards(false), 3000)
        }}
        leftIcon={
          showIcon && (
            <TriliumIcon
              height="30px"
              width="30px"
              opacity={claimMiningRewardsTimeInHours > 0 ? 0.3 : 1}
              color={claimMiningRewardsTimeInHours > 0 ? Colors.DARK_GRAY : Colors.SNOW_WHITE}
            />
          )
        }
      >
        <VStack flexDirection="column" alignItems="start" ml="15px" w="150px">
          <Box textAlign="center" fontSize={14} mb="-5px">
            {formatNumber(claimableMiningRewards, 4, 4)} TLM
          </Box>
          <Box textAlign="center" fontSize={11}>
            Mining Reward
          </Box>
        </VStack>
      </Button>
    </Flex>
  )
}
