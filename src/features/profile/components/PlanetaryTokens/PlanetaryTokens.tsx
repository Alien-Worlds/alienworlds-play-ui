import { GovernanceIcon3 } from '@alien-worlds/icons'
import { GlossaryInfoIcon } from 'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon'
import { TooltipLocations } from 'features/glossary/utils/glossaryConst'
import { getPlanetGradient } from 'features/mining/utils/planet'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { useUserDaoBalances } from 'graphql/hooks/useUserDaoBalances'
import { useWalletDaoDetails } from 'graphql/hooks/useWalletDaoDetails'
import { DaoWalletDetailsResponse, UserBalancesResponse } from 'graphql/types'
import { capitalize, filter, get, map, replace, toNumber } from 'lodash'
import { Colors } from 'shared/util/colors'
import { convertPlanetIdToName } from 'shared/util/helpers'
import { PlanetIcon, PlanetIconRGB } from 'shared/util/icons'
import { formatNumber } from 'shared/util/numbers'
import { useAppState } from 'store'
import { PlanetBalanceType } from 'store/wax/types'
import { v4 } from 'uuid'

export const PlanetaryTokens = () => {
  const {
    wax: { selectedDacId, walletId },
  } = useAppState()
  const {
    walletDaoDetails,
    loading: walletDaoDetailsLoading,
  }: { walletDaoDetails: DaoWalletDetailsResponse; loading: boolean } = useWalletDaoDetails({
    dacId: selectedDacId,
    walletId,
  })
  const planetStakes = toNumber(
    replace(get(walletDaoDetails, 'stake_details.available_tlm_in_dao', '0'), /[^0-9.-]/g, '')
  )
  const {
    userDaoBalances,
    loading: userDaoBalancesLoading,
  }: { userDaoBalances: UserBalancesResponse; loading: boolean } = useUserDaoBalances({
    walletId: walletId,
  })
  const balances = []
  if (walletDaoDetailsLoading || userDaoBalancesLoading) return <LoadingSpinner />
  return (
    <div className="flex w-full flex-col items-start self-center px-[5%] 2xl:px-0">
      <div className="mb-4 self-start">
        <div className="flex items-center gap-2">
          <GovernanceIcon3 color={Colors.GRAY} boxSize="20px" />
          <p
            className="ml-2 text-sm font-normal"
            style={{ color: Colors.GRAY, fontFamily: 'Orbitron, sans-serif' }}
          >
            Planetary Staked TLM
          </p>
        </div>
      </div>

      <div className="flex h-full w-full flex-wrap justify-center">
        <div className="flex w-full flex-col items-start" style={{ rowGap: '15px' }}>
          {balances && (
            <>
              {map(
                balances.filter((p) => p.planet !== 'testa'),
                (p: PlanetBalanceType) => (
                  <div
                    key={v4()}
                    className="flex w-full flex-wrap justify-between"
                    style={{ rowGap: '15px' }}
                  >
                    {/* PLANETS TOKENS */}
                    <div className="flex w-[250px] min-w-[250px]">
                      <div className="flex w-full items-center justify-start gap-2">
                        <div className="relative flex content-center justify-center">
                          <PlanetIcon
                            planetName={capitalize(convertPlanetIdToName(p.planet))}
                            style={{
                              top: 42,
                              bottom: 0,
                              zIndex: 3,
                              right: 10,
                              width: 48,
                              height: 48,
                            }}
                          />
                        </div>
                        <div className="flex flex-col gap-1 pb-[10px] pt-[2px]">
                          <div className="mb-[-5px] flex h-[35px] flex-row items-baseline justify-start">
                            <p
                              className="inline-block text-[14px] font-normal md:text-[20px]"
                              style={{
                                color: Colors.SNOW_WHITE,
                                fontFamily: 'Orbitron, sans-serif',
                              }}
                            >
                              {formatNumber(planetStakes[p.planet], 4, 4)}
                            </p>
                            <p
                              className="ml-2 text-[14px] font-semibold md:text-[20px]"
                              style={{
                                background: getPlanetGradient(convertPlanetIdToName(p.planet)),
                                backgroundClip: 'text',
                                fontFamily: 'Orbitron, sans-serif',
                              }}
                            >
                              TLM
                            </p>
                          </div>
                          <p
                            className="text-[12px] font-semibold leading-[0.1]"
                            style={{
                              color: Colors.JUMBO,
                              fontFamily: "'Titillium Web', sans-serif",
                            }}
                          >
                            TLM in {capitalize(convertPlanetIdToName(p.planet))}
                          </p>
                        </div>
                      </div>
                    </div>
                    {/* PLANETS STAKES */}
                    <div className="flex w-[250px] min-w-[250px] justify-end gap-[10px]">
                      <div
                        className="relative flex size-[50px] items-center justify-center rounded-full"
                        style={{ backgroundColor: Colors.RADICAL_RED }}
                      >
                        <PlanetIconRGB
                          planetName={capitalize(convertPlanetIdToName(p.planet))}
                          style={{
                            top: 42,
                            bottom: 0,
                            zIndex: 3,
                            right: 2,
                            width: 48,
                            height: 48,
                            paddingRight: '2px',
                            paddingBottom: '2px',
                          }}
                        />
                      </div>
                      <div className="flex w-[160px] flex-col pt-[2px]">
                        <div className="flex">
                          <p
                            className="text-[14px] md:text-[20px]"
                            style={{ fontFamily: 'Orbitron, sans-serif' }}
                          >
                            {formatNumber(p.staked, 4, 4)}
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
                          </p>
                        </div>
                        <div className="mt-[-5px] flex items-center gap-1">
                          <p
                            className="pt-[2px] text-[12px] font-semibold leading-[0.1]"
                            style={{
                              color: Colors.JUMBO,
                              fontFamily: "'Titillium Web', sans-serif",
                            }}
                          >
                            Staked TLM in {capitalize(convertPlanetIdToName(p.planet))}
                          </p>
                          <GlossaryInfoIcon
                            width={15}
                            glossaryId={TooltipLocations.GOVERNANCE_SIDEBAR_STAKED_TOKENS}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
      <div className="flex h-full w-full flex-wrap justify-center">
        <div className="flex w-full flex-col items-start" style={{ rowGap: '15px' }}>
          {userDaoBalances && (
            <>
              {map(
                filter(Object.entries(userDaoBalances), ([planet]) => planet !== 'testa'),
                ([planet, data]) => (
                  <div
                    key={v4()}
                    className="flex w-full flex-wrap items-center justify-between"
                    style={{ rowGap: '15px' }}
                  >
                    {/* PLANETS TOKENS */}
                    <div className="flex w-[250px] min-w-[250px]">
                      <div className="flex w-full items-center justify-start gap-2">
                        <div className="relative flex content-center justify-center">
                          <PlanetIcon
                            planetName={capitalize(convertPlanetIdToName(planet))}
                            style={{
                              top: 42,
                              bottom: 0,
                              zIndex: 3,
                              right: 10,
                              width: 48,
                              height: 48,
                            }}
                          />
                        </div>
                        <div className="flex flex-col gap-1 pb-[10px] pt-[2px]">
                          <div className="mb-[-5px] flex h-[35px] items-baseline">
                            <p
                              className="text-[14px] font-normal md:text-[20px]"
                              style={{
                                color: Colors.SNOW_WHITE,
                                fontFamily: 'Orbitron, sans-serif',
                              }}
                            >
                              {data.stake_details.available_tlm_in_dao
                                ? formatNumber(
                                    get(
                                      data,
                                      'stake_details.available_tlm_in_dao',
                                      '0.0000 TLM'
                                    ).split(' ')[0],
                                    4,
                                    4
                                  )
                                : '0.0000'}
                            </p>
                            <p
                              className="ml-2 text-[14px] font-semibold md:text-[20px]"
                              style={{
                                background: getPlanetGradient(convertPlanetIdToName(planet)),
                                backgroundClip: 'text',
                                fontFamily: 'Orbitron, sans-serif',
                              }}
                            >
                              TLM
                            </p>
                          </div>
                          <p
                            className="text-[12px] font-semibold leading-[0.1]"
                            style={{
                              color: Colors.JUMBO,
                              fontFamily: "'Titillium Web', sans-serif",
                            }}
                          >
                            TLM in {capitalize(convertPlanetIdToName(planet))}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* PLANETS STAKES */}
                    <div className="flex w-[250px] min-w-[250px] justify-start gap-[10px] md:justify-end">
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
                            right: 2,
                            width: 48,
                            height: 48,
                            paddingRight: '2px',
                            paddingBottom: '2px',
                          }}
                        />
                      </div>
                      <div className="flex w-[160px] flex-col pt-[2px]">
                        <div className="flex">
                          <p
                            className="text-[14px] md:text-[20px]"
                            style={{ fontFamily: 'Orbitron, sans-serif' }}
                          >
                            {formatNumber(
                              get(data, 'stake_details.staked_amount', '0.0000 TLM'),
                              4,
                              4
                            )}
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
                          </p>
                        </div>
                        <div className="mt-[-5px] flex items-center gap-1">
                          <p
                            className="pt-[2px] text-[12px] font-semibold leading-[0.1]"
                            style={{
                              color: Colors.JUMBO,
                              fontFamily: "'Titillium Web', sans-serif",
                            }}
                          >
                            Staked TLM in {capitalize(convertPlanetIdToName(planet))}
                          </p>
                          <GlossaryInfoIcon
                            width={15}
                            glossaryId={TooltipLocations.GOVERNANCE_SIDEBAR_STAKED_TOKENS}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
