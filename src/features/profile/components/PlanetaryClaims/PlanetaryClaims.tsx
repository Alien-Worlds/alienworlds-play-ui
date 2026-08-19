import { useState } from 'react'

import { DTALIcon, LockIcon2, ProfitsIcon, TriliumIcon } from '@alien-worlds/icons'
import { Button, useBreakpointValue } from '@alien-worlds/uikit'
import { useApolloClient } from '@apollo/client'
import { GlossaryInfoIcon } from 'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon'
import { TooltipLocations } from 'features/glossary/utils/glossaryConst'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { useUserDaoBalances } from 'graphql/hooks/useUserDaoBalances'
import { useWalletDetails } from 'graphql/hooks/useWalletDetails'
import { DAO_WALLET_DETAILS_QUERY } from 'graphql/queries/daoWalletDetails'
import { USER_DAO_BALANCES } from 'graphql/queries/userDaoBalances'
import { UserBalancesResponse, WalletDetailsResponse } from 'graphql/types'
import { capitalize, filter, get, map, split } from 'lodash'
import { Colors } from 'shared/util/colors'
import { convertPlanetIdToName, getMiningRewardsTimeInHours } from 'shared/util/helpers'
import { PlanetIconRGB } from 'shared/util/icons'
import { formatNumber } from 'shared/util/numbers'
import { useActions, useAppState } from 'store'
import { v4 } from 'uuid'

export const PlanetaryClaims = () => {
  const {
    wax: {
      tryClaimUnstake,
      tryClaimMiningRewards,
      tryClaimLandownerAllowance,
      tryClaimLandownerCommissions,
    },
  } = useActions()
  const {
    wax: { walletId },
  } = useAppState()
  const client = useApolloClient()
  const [isClaimingTokens, setIsClaimingTokens] = useState(false)
  const [isClaimingMiningRewards, setIsClaimingMiningRewards] = useState(false)
  const [isClaimingLandownerAllowance, setIsClaimingLandownerAllowance] = useState(false)
  const [isClaimingLandownerCommissions, setIsClaimingLandownerCommissions] = useState(false)
  const {
    walletDetails,
    loading: wallletDetailsLoading,
  }: { walletDetails: WalletDetailsResponse; loading: boolean } = useWalletDetails(walletId)

  const claimMiningRewardsTimeInHours = getMiningRewardsTimeInHours(
    get(walletDetails, 'mining_claim.last_claim_time', null)
  )
  const claimableMiningRewards = get(walletDetails, 'mining_claim.amount', '0.0000 TLM')
  const claimableLandownerCommissions = get(walletDetails, 'land_comms.amount', '0.0000 TLM')
  const claimableLandownerAllowance = get(walletDetails, 'land_ratings_payout', '0.0000 TLM')
  const {
    userDaoBalances,
    loading: userDaoBalancesLoading,
  }: { userDaoBalances: UserBalancesResponse; loading: boolean } = useUserDaoBalances({
    walletId: walletId,
  })

  const getButtonVariant = () => {
    let variant

    if (claimMiningRewardsTimeInHours > 0) variant = 'beryllium'
    else variant = 'lithium'

    return variant
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

  const getButtonColor = () => {
    let color: string
    if (
      !claimableMiningRewards ||
      claimableMiningRewards === '0.0000 TLM' ||
      claimMiningRewardsTimeInHours > 0
    )
      color = Colors.MID_GRAY
    else color = Colors.SNOW_WHITE

    return color
  }

  const getButtonText = () => {
    let text: string
    if (claimMiningRewardsTimeInHours > 0) text = '0 TLM'
    else text = 'Claim TLM'

    return text
  }

  const getClaimIconColor = () => {
    let color: string
    if (claimMiningRewardsTimeInHours > 0) color = Colors.DARK_GRAY
    else color = Colors.SNOW_WHITE

    return color
  }
  const currentButtonMinWidth = useBreakpointValue({ base: '200px', sm: '235px' })

  if (wallletDetailsLoading || userDaoBalancesLoading) return <LoadingSpinner />
  return (
    <div className="flex w-full flex-col items-start self-center px-[5%] 2xl:px-0">
      <div className="mb-4 self-start">
        <div className="flex items-center gap-2">
          <TriliumIcon color={Colors.GRAY} boxSize="20px" />
          <p
            className="ml-2 text-sm font-normal"
            style={{ color: Colors.GRAY, fontFamily: 'Orbitron, sans-serif' }}
          >
            Claims
          </p>
        </div>
      </div>
      <div className="flex w-full flex-col gap-[15px]">
        {/* Mining Reward */}
        <div className="flex w-full flex-wrap items-start justify-start gap-[15px] pb-[10px] sm:justify-between">
          <div className="flex min-w-[200px] sm:min-w-[235px]">
            <div className="flex pr-[20px] pt-[8px]">
              <TriliumIcon boxSize={40} color={getClaimIconColor()} />
              {claimMiningRewardsTimeInHours > 0 && (
                <p
                  className="absolute w-[60px] font-orb text-[16px] font-semibold tracking-[1px] pt-[10px] md:pt-[5px] md:text-[20px]"
                  style={{
                    color: Colors.RADICAL_RED,
                    marginLeft: claimMiningRewardsTimeInHours > 9 ? '-3px' : '8px',
                  }}
                >
                  {claimMiningRewardsTimeInHours}h
                </p>
              )}
            </div>
            <div className="flex flex-col justify-center gap-1 pt-[2px]">
              <div className="mb-[-5px] flex h-[35px] flex-row items-baseline justify-start">
                <p
                  className="inline-block text-[16px] font-normal md:text-[20px]"
                  style={{ color: Colors.SNOW_WHITE, fontFamily: 'Orbitron, sans-serif' }}
                >
                  {formatNumber(claimableMiningRewards, 4, 4)}
                </p>
                <p
                  className="ml-2 text-[16px] font-semibold md:text-[20px]"
                  style={{ color: Colors.PERSIAN_GREEN, fontFamily: 'Orbitron, sans-serif' }}
                >
                  TLM
                </p>
              </div>
              <p
                className="mt-[-1px] text-[12px] font-semibold leading-[0.1]"
                style={{ color: Colors.JUMBO, fontFamily: "'Titillium Web', sans-serif" }}
              >
                Mining Reward
              </p>
            </div>
          </div>
          <div className="ml-0 flex w-full justify-center md:ml-auto md:w-max">
            {claimMiningRewardsTimeInHours > 0 && (
              <p
                className={`absolute font-orb text-[16px] font-semibold tracking-[1px] pt-[7px] md:pt-[5px] md:text-[20px] sm:pr-[170px] ${
                  claimMiningRewardsTimeInHours > 9
                    ? 'ml-[-20px] sm:ml-[25px]'
                    : 'ml-[-15px] sm:ml-[13px]'
                }`}
                style={{ color: Colors.RADICAL_RED }}
              >
                {claimMiningRewardsTimeInHours}h
              </p>
            )}
            {claimMiningRewardsTimeInHours > 0 && (
              <div className="mr-[-10px] mt-[-5px] flex">
                <LockIcon2 boxSize="20px" color={Colors.RADICAL_RED} />
              </div>
            )}
            <Button
              size="md"
              fontSize={16}
              fontWeight={400}
              isFullWidth
              justifyContent="center"
              color={getButtonColor()}
              variant={getButtonVariant()}
              loadingText="Claiming TLM..."
              disabled={getButtonDisabled()}
              isLoading={isClaimingMiningRewards}
              cursor={getButtonDisabled() ? 'not-allowed' : 'pointer'}
              onClick={async () => {
                setIsClaimingMiningRewards(true)
                await tryClaimMiningRewards()
                setTimeout(() => setIsClaimingMiningRewards(false), 3000)
              }}
              minWidth={currentButtonMinWidth}
            >
              {getButtonText()}
            </Button>
          </div>
        </div>
        {/* Commision Reward */}
        <div className="flex w-full flex-wrap items-start justify-start gap-[15px] sm:justify-between">
          <div className="flex min-w-[200px] sm:min-w-[235px]">
            <div className="pr-[12px] pt-[8px]">
              <ProfitsIcon boxSize={48} color={Colors.SNOW_WHITE} />
            </div>
            <div className="flex flex-col justify-center gap-1 pt-[2px]">
              <div className="mb-[-5px] flex h-[35px] flex-row items-baseline justify-start">
                <p
                  className="inline-block text-[16px] font-normal md:text-[20px]"
                  style={{ color: Colors.SNOW_WHITE, fontFamily: 'Orbitron, sans-serif' }}
                >
                  {formatNumber(claimableLandownerCommissions, 4, 4)}
                </p>
                <p
                  className="ml-2 text-[16px] font-semibold md:text-[20px]"
                  style={{ color: Colors.PERSIAN_GREEN, fontFamily: 'Orbitron, sans-serif' }}
                >
                  TLM
                </p>
              </div>
              <p
                className="mt-[-1px] text-[12px] font-semibold leading-[0.1]"
                style={{ color: Colors.JUMBO, fontFamily: "'Titillium Web', sans-serif" }}
              >
                Commission Reward
              </p>
            </div>
          </div>
          <div className="ml-0 flex w-full justify-center md:ml-auto md:w-max">
            <Button
              size="md"
              fontSize={16}
              fontWeight={400}
              isFullWidth
              variant="lithium"
              cursor={
                !claimableLandownerCommissions ||
                claimableLandownerCommissions === '0.0000 TLM' ||
                isClaimingLandownerCommissions
                  ? 'not-allowed'
                  : 'pointer'
              }
              justifyContent="center"
              loadingText="Claiming TLM..."
              minWidth={currentButtonMinWidth}
              isLoading={isClaimingLandownerCommissions}
              onClick={async () => {
                setIsClaimingLandownerCommissions(true)
                await tryClaimLandownerCommissions()
                setTimeout(() => setIsClaimingLandownerCommissions(false), 3000)
              }}
              disabled={
                !claimableLandownerCommissions ||
                claimableLandownerCommissions === '0.0000 TLM' ||
                isClaimingLandownerCommissions
              }
            >
              Claim TLM
            </Button>
          </div>
        </div>
        {/* DTAL reward */}
        <div className="flex w-full flex-wrap items-start justify-start gap-[15px] sm:justify-between">
          <div className="flex min-w-[200px] sm:min-w-[235px]">
            <div className="pr-[12px] pt-[8px]">
              <DTALIcon boxSize={48} color={Colors.SNOW_WHITE} />
            </div>
            <div className="flex flex-col justify-center gap-1">
              <div className="mb-[-5px] flex h-[35px] flex-row items-baseline justify-start">
                <p
                  className="inline-block text-[16px] font-normal md:text-[20px]"
                  style={{ color: Colors.SNOW_WHITE, fontFamily: 'Orbitron, sans-serif' }}
                >
                  {formatNumber(claimableLandownerAllowance, 4, 4)}
                </p>
                <p
                  className="ml-2 text-[16px] font-semibold md:text-[20px]"
                  style={{ color: Colors.PERSIAN_GREEN, fontFamily: 'Orbitron, sans-serif' }}
                >
                  TLM
                </p>
              </div>
              <p
                className="text-[12px] font-semibold leading-[0.1]"
                style={{ color: Colors.JUMBO, fontFamily: "'Titillium Web', sans-serif" }}
              >
                DTAL Reward
              </p>
            </div>
          </div>
          <div className="ml-0 flex w-full justify-center md:ml-auto md:w-max">
            <Button
              size="md"
              fontSize={16}
              isFullWidth
              fontWeight={400}
              variant="lithium"
              justifyContent="center"
              loadingText="Claiming TLM..."
              minWidth={currentButtonMinWidth}
              isLoading={isClaimingLandownerAllowance}
              onClick={async () => {
                setIsClaimingLandownerAllowance(true)
                await tryClaimLandownerAllowance()
                setTimeout(() => setIsClaimingLandownerAllowance(false), 3000)
              }}
              disabled={
                !claimableLandownerAllowance ||
                claimableLandownerAllowance === '0.0000 TLM' ||
                isClaimingLandownerAllowance
              }
            >
              Claim TLM
            </Button>
          </div>
        </div>
        {/* STAKES WITH TIME RELEASE */}

        {map(
          filter(
            Object.entries(userDaoBalances),
            ([, data]) => data.stake_details.unstakes.length > 0
          ),
          ([planet, data]) => (
            <div
              key={v4()}
              className="flex w-full flex-wrap items-center justify-center gap-x-[22%] py-[20px] sm:justify-between sm:gap-x-0 sm:py-0"
            >
              <div className="flex flex-1 flex-col gap-0 sm:flex-row sm:gap-[15px]">
                {/* PLANETS STAKES */}
                <div className="flex min-w-[220px] items-center gap-[15px] pb-[10px] md:min-w-[300px]">
                  <div
                    className="relative flex size-[50px] items-center justify-center rounded-full"
                    style={{ backgroundColor: Colors.RADICAL_RED }}
                  >
                    <PlanetIconRGB
                      planetName={capitalize(convertPlanetIdToName(planet))}
                      style={{
                        top: 42,
                        bottom: 0,
                        zIndex: 3,
                        right: 10,
                        width: 48,
                        height: 48,
                        paddingRight: '2px',
                        paddingBottom: '2px',
                      }}
                    />
                  </div>
                  {/* STAKE AMOUNT */}
                  <div className="flex w-[190px] flex-col gap-1 pt-[2px]">
                    <div className="flex">
                      <p
                        className="text-[14px] md:text-[20px]"
                        style={{ fontFamily: 'Orbitron, sans-serif' }}
                      >
                        {formatNumber(data.stake_details.unstakes[0].stake, 4, 4)}
                      </p>
                      <p
                        className="ml-2 text-[14px] font-semibold md:text-[20px]"
                        style={{
                          background: Colors.RADICAL_RED,
                          backgroundClip: 'text',
                          fontFamily: 'Orbitron, sans-serif',
                        }}
                      >
                        TLM
                        {/* Extracting token symbol */}
                      </p>
                    </div>
                    <div className="mt-[-7px] flex items-center gap-1">
                      <p
                        className="text-[12px] font-semibold"
                        style={{ color: Colors.JUMBO, fontFamily: "'Titillium Web', sans-serif" }}
                      >
                        Tokens in {capitalize(planet)} Release Date
                      </p>
                      <GlossaryInfoIcon
                        width={15}
                        glossaryId={TooltipLocations.GOVERNANCE_SIDEBAR_STAKED_TOKENS}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* STAKE RELEASE TIME (Centered) */}
              <div className="flex flex-1 flex-col items-start text-center md:items-center">
                <p
                  className="text-[14px]"
                  style={{ color: Colors.SNOW_WHITE, fontFamily: "'Titillium Web', sans-serif" }}
                >
                  {split(data.stake_details.unstakes[0].release_time, 'T')?.[0]?.replaceAll(
                    '-',
                    '/'
                  )}
                </p>
                <p
                  className="text-[14px]"
                  style={{ color: Colors.GRAY, fontFamily: "'Titillium Web', sans-serif" }}
                >
                  {split(data.stake_details.unstakes[0].release_time, 'T')?.[1]} (UTC)
                </p>
              </div>

              {/* CLAIM TOKENS BUTTON */}
              <div className="ml-0 mr-[-4px] flex w-full justify-center p-3 md:ml-auto md:mr-0 md:w-max md:p-0">
                <Button
                  isFullWidth
                  size="md"
                  fontSize={16}
                  fontWeight={400}
                  variant="lithium"
                  justifyContent="center"
                  disabled={isClaimingTokens}
                  isLoading={isClaimingTokens}
                  loadingText="Claiming..."
                  onClick={async () => {
                    setIsClaimingTokens(true)
                    await tryClaimUnstake('4,' + data.stake_details.dao_token_balance.split(' ')[1])
                    await client.refetchQueries({
                      include: [DAO_WALLET_DETAILS_QUERY, USER_DAO_BALANCES],
                    })
                    setTimeout(() => setIsClaimingTokens(false), 3000)
                  }}
                  minWidth={currentButtonMinWidth}
                >
                  Claim TLM
                </Button>
              </div>
            </div>
          )
        )}
      </div>
    </div>
  )
}
