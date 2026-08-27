import { VFC } from 'react'

import { PlanetaryClaims } from 'features/profile/components/PlanetaryClaims/PlanetaryClaims'
import { PlanetaryTokens } from 'features/profile/components/PlanetaryTokens/PlanetaryTokens'
// import { useWalletDaoDetails } from 'graphql/hooks/useWalletDaoDetails'
// import { DaoWalletDetailsResponse } from 'graphql/types'
// import { get, replace, toNumber } from 'lodash'

// import { PlanetBalanceType } from 'store/wax/types'

export const TokensBalances: VFC = () => {
  // const {
  //   walletDaoDetails,
  //   loading: walletDaoDetailsLoading,
  // }: { walletDaoDetails: DaoWalletDetailsResponse; loading: boolean } = useWalletDaoDetails({
  //   dacId: selectedDacId,
  //   walletId,
  // })
  // const planetStakes = toNumber(
  //   replace(get(walletDaoDetails, 'stake_details.available_tlm_in_dao', '0'), /[^0-9.-]/g, '')
  // )
  // const [planetaryTokens, setPlanetaryTokens] = useState<PlanetBalanceType[]>([])

  // async function getUserBalances() {
  //   const planetBalances: PlanetBalanceType[] = []

  //   forEach(Object.keys(planetStakes), async (dacId: string) => {
  //     const daoStake: string = await getUserDAOStakes(dacId)
  //     const daoUnstakes: PlanetBalanceUnstakes = await getDAOUnstakes(dacId)

  //     const planetBalance: PlanetBalanceType = {
  //       planet: dacId,
  //       tokens: planetStakes[dacId],
  //       staked: daoStake?.length > 0 ? daoStake : null,
  //       unstakes: daoUnstakes
  //         ? {
  //             stake: daoUnstakes?.stake,
  //             releaseTime: daoUnstakes?.releaseTime,
  //           }
  //         : null,
  //     }

  //     planetBalances.push(planetBalance)
  //     if (planetBalances?.length === config.ActiveDacIds.split(',').length) {
  //       const sortedPlanetaryBalances: PlanetBalanceType[] = planetBalances.sort(
  //         (a: PlanetBalanceType, b: PlanetBalanceType) => {
  //           return a.planet.localeCompare(b.planet)
  //         }
  //       )
  //       setPlanetaryTokens(sortedPlanetaryBalances)
  //     }
  //   })
  // }

  // useEffect(() => {
  //   if (planetStakes) {
  //     getUserBalances()
  //   }
  // }, [planetStakes])

  return (
    <div className="flex h-full min-w-[200px] flex-col flex-wrap gap-[25px] pt-0 w-full 2xl:w-1/2 pl-0 2xl:pl-[30px] md:pt-[25px]">
      <PlanetaryClaims />
      <PlanetaryTokens />
    </div>
  )
}
