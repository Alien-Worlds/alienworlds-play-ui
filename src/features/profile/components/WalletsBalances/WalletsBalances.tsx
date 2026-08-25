import { VFC } from 'react'

import { LockIcon, MiningIcon, MissionsIcon, ShardsIcon, WaxIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { GlossaryInfoIcon } from 'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon'
import { TooltipLocations } from 'features/glossary/utils/glossaryConst'
import {
  ConnectWalletBtn,
  useWalletConnect,
} from 'features/missions/components/MissionsActions/MissionsActions'
import { StakedTriliumBalance } from 'features/missions/components/StakedTriliumBalance/StakedTriliumBalance'
import { TriliumBSCBalance } from 'features/missions/components/TriliumBSCBalance/TriliumBSCBalance'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { useUserDaoBalances } from 'graphql/hooks/useUserDaoBalances'
import { useWalletDetails } from 'graphql/hooks/useWalletDetails'
import { UserBalancesResponse, WalletDetailsResponse } from 'graphql/types'
import { get, sumBy } from 'lodash'
import { useNavigate } from 'react-router-dom'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'
import { formatUserPointsWithDecimal } from 'shared/util/helpers'
import { formatNumber } from 'shared/util/numbers'
import { useAppState } from 'store'
import { PagePath } from 'store/main/types'
export function sumStakedAmount(userBalances: UserBalancesResponse): number {
  return sumBy(Object.values(userBalances), (planet) =>
    parseFloat(planet?.stake_details?.staked_amount?.split(' ')[0] || '0')
  )
}

export const WalletsBalances: VFC = () => {
  const {
    wax: { walletId },
  } = useAppState()
  const { walletDetails, loading }: { walletDetails: WalletDetailsResponse; loading: boolean } =
    useWalletDetails(walletId)
  const wallet = useWalletConnect()

  const navigate = useNavigate()
  const {
    userDaoBalances,
    loading: loadingUserDaoBalances,
  }: { userDaoBalances: UserBalancesResponse; loading: boolean } = useUserDaoBalances({ walletId })

  if (loading || loadingUserDaoBalances) return <LoadingSpinner />
  const totalDAOsStakes = sumStakedAmount(userDaoBalances)

  return (
    <div className="flex h-full w-full min-w-[200px] flex-col flex-wrap gap-[35px] py-[25px] 2xl:w-[45%] 2xl:pr-[30px]">
      {/* MINING WALLET */}
      <div className="flex w-full flex-col items-start px-[5%] 2xl:px-0">
        <div className="mb-4 self-start">
          <div className="flex">
            <MiningIcon color={Colors.GRAY} boxSize="20px" />

            <p
              className="mx-2 text-sm font-normal"
              style={{ color: Colors.GRAY, fontFamily: 'Orbitron, sans-serif' }}
            >
              Mining Wallet
            </p>
            <GlossaryInfoIcon
              width={16}
              height={16}
              glossaryId={TooltipLocations.PROFILE_MINING_WALLET}
            />
          </div>
        </div>
        <div className="flex w-full flex-wrap items-start justify-start gap-[20px] sm:justify-between">
          {/* Wax Trilium */}
          <div className="flex justify-start gap-3">
            <WaxIcon color={Colors.DI_SERRIA} boxSize={40} style={{ position: 'relative' }} />
            <div className="flex flex-col justify-end">
              <p
                className="text-[16px] leading-[0.8] md:text-[20px]"
                style={{ fontFamily: 'Orbitron, sans-serif' }}
              >
                {formatNumber(walletDetails.tlm_balance, 4, 4)}
              </p>
              <p
                className="text-[12px] font-bold tracking-[0.1em]"
                style={{ fontFamily: "'Titillium Web', sans-serif", color: Colors.DI_SERRIA }}
              >
                WAX Trillium
              </p>
            </div>
          </div>
          {/* Staked Wax Trilium */}
          {totalDAOsStakes > 0 && (
            <div
              className="flex min-w-[200px] justify-start gap-3 2xl:min-w-[235px]"
              style={{ color: Colors.RADICAL_RED }}
            >
              <div className="relative w-[40px]" style={{ fill: Colors.RADICAL_RED }}>
                <LockIcon
                  className="absolute z-[2] h-auto w-[30px]"
                  style={{ bottom: '16px', left: '20px' }}
                />
                <WaxIcon boxSize={40} color={Colors.RADICAL_RED} />
              </div>
              <div className="flex flex-col justify-end">
                <p
                  className="text-[16px] leading-[0.8] md:text-[20px]"
                  style={{ fontFamily: 'Orbitron, sans-serif', color: Colors.SNOW_WHITE }}
                >
                  {formatNumber(totalDAOsStakes, 4, 4)}
                </p>
                <p
                  className="text-[12px] font-bold tracking-[0.1em]"
                  style={{ color: Colors.RADICAL_RED, fontFamily: "'Titillium Web', sans-serif" }}
                >
                  Staked WAX Trillium
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* SHARDS */}
      <div className="flex w-full flex-col items-start px-[5%] 2xl:px-0">
        <div className="mb-4 self-start">
          <div className="flex">
            <ShardsIcon color={Colors.GRAY} boxSize="20px" />
            <p
              className="mb-1 ml-2 text-sm font-normal"
              style={{ color: Colors.GRAY, fontFamily: 'Orbitron, sans-serif' }}
            >
              Shards
            </p>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-start justify-start gap-[20px] sm:justify-between">
          {/* Current Shards */}
          <div className="flex justify-start">
            <div className="mr-[10px] flex h-[30px] items-center justify-center">
              <ShardsIcon boxSize="40px" color={Colors.SNOW_WHITE} />
            </div>

            <div className="flex flex-col items-start">
              <p
                className="ml-[5px] text-center text-[16px] font-normal tracking-[0.1em] md:text-[20px]"
                style={{ fontFamily: 'Orbitron, sans-serif', color: Colors.SNOW_WHITE }}
              >
                {formatUserPointsWithDecimal(
                  get(walletDetails, 'userpoints_details.redeemable_points', 0)
                )}
              </p>
            </div>
          </div>
          {/* Use Shards */}
          <div className="flex w-full max-w-full justify-center sm:w-auto sm:max-w-none md:max-w-max md:min-w-max 2xl:min-w-[235px] 2xl:max-w-[235px] 2xl:justify-start">
            <Button
              size="md"
              fontSize={16}
              isFullWidth
              variant="primary"
              leftIcon={<ShardsIcon boxSize="25px" color={Colors.SNOW_WHITE} />}
              onClick={() => {
                navigate(PagePath.Outpost)
              }}
            >
              Use Shards
            </Button>
          </div>
        </div>
      </div>
      {/* MISSIONS */}
      <div className="flex w-full flex-col items-start px-[5%] 2xl:px-0">
        <div className="mb-4 self-start">
          <div className="flex">
            <MissionsIcon color={Colors.GRAY} boxSize="20px" />
            <div className="flex gap-[7px]">
              <p
                className="ml-2 text-sm font-normal"
                style={{ color: Colors.GRAY, fontFamily: 'Orbitron, sans-serif' }}
              >
                Missions BSC Wallets
              </p>
              <GlossaryInfoIcon
                width={16}
                height={16}
                glossaryId={TooltipLocations.PROFILE_MISSIONS_WALLET}
              />
            </div>
          </div>
        </div>
        <div className="flex w-full flex-wrap items-start justify-center gap-[20px] 2xl:justify-start">
          {(wallet.connectedWallets.length === 0 || wallet.connecting) && (
            <div className="flex w-full items-start justify-center sm:justify-between">
              <ConnectWalletBtn onClick={() => wallet.connect()} />
            </div>
          )}
          {wallet.connectedChain &&
            parseInt(wallet.connectedChain.id, 16) === config.BscChainId && (
              <div className="flex w-full flex-wrap items-start justify-start gap-[20px] sm:justify-between">
                <div className="ml-[-10px] flex min-w-[200px] justify-start">
                  <TriliumBSCBalance />
                </div>
                <div className="flex min-w-[200px] justify-start gap-3 md:min-w-[235px]">
                  <StakedTriliumBalance />
                </div>
              </div>
            )}
        </div>
      </div>
    </div>
  )
}
