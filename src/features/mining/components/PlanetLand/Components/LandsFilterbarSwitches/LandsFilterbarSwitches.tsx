import { useEffect, useState, VFC } from 'react'

import { LandIcon2, LightIcon2, MiningIcon, NFTOldIcon, ProfitsIcon } from '@alien-worlds/icons'
import { SimpleGrid } from '@chakra-ui/react'
import { PlanetFilterSlider } from 'features/mining/components/PlanetLand/Components/PlanetFilterSlider'
import { isNil } from 'lodash'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'

const LandsFilterbarSwitches: VFC = () => {
  const {
    atomic: { landAssetsFilter },
  } = useAppState()

  const {
    atomic: { setLandAssetsFilter },
  } = useActions()

  const [recharge, setRecharge] = useState<number | number[]>(null)
  const [miningPower, setMiningPower] = useState<number | number[]>(null)
  const [pow, setPow] = useState<number | number[]>(null)
  const [luck, setLuck] = useState<number | number[]>(null)
  const [commission, setCommission] = useState<number | number[]>(null)

  useEffect(() => {
    setRecharge(landAssetsFilter.recharge)
    setMiningPower(landAssetsFilter.miningPower)
    setPow(landAssetsFilter.pow)
    setLuck(landAssetsFilter.luck)
    setCommission(landAssetsFilter.commission)
  }, [landAssetsFilter])

  return (
    <SimpleGrid
      columns={{ base: 1, md: 2 }}
      width="full"
      marginTop={{
        base: '30px',
        '2xl': 0,
      }}
      gap={4}
      marginBottom="20px"
      alignItems={{ base: 'flex-start', xl: 'flex-end' }}
      justifyContent="space-between"
      columnGap={{ lg: '50px' }}
      flexDirection={{
        base: 'column',
        '2xl': 'row',
      }}
    >
      {!isNil(recharge) && (
        <PlanetFilterSlider
          max={5}
          min={0.7}
          step={0.1}
          initialValue={recharge}
          color={Colors.NAVY_BLUE}
          title="Recharge multiplier"
          icon={<LightIcon2 boxSize={25} />}
          onChange={(val) =>
            setLandAssetsFilter({
              ...landAssetsFilter,
              recharge: val,
            })
          }
        />
      )}

      {!isNil(miningPower) && (
        <PlanetFilterSlider
          min={0.6}
          max={2.5}
          step={0.1}
          title="Mining Power"
          color={Colors.DI_SERRIA}
          initialValue={miningPower}
          icon={<MiningIcon boxSize={25} color={Colors.DI_SERRIA} cursor="pointer" />}
          onChange={(val) =>
            setLandAssetsFilter({
              ...landAssetsFilter,
              miningPower: val,
            })
          }
        />
      )}

      {!isNil(pow) && (
        <PlanetFilterSlider
          min={0}
          max={2}
          step={1}
          title="PoW"
          initialValue={pow}
          color={Colors.DI_SERRIA}
          icon={<LandIcon2 boxSize={25} cursor="pointer" />}
          onChange={(val) =>
            setLandAssetsFilter({
              ...landAssetsFilter,
              pow: val,
            })
          }
        />
      )}

      {!isNil(luck) && (
        <PlanetFilterSlider
          min={0.5}
          max={2.5}
          step={0.1}
          title="NFT Power"
          initialValue={luck}
          color={Colors.DI_SERRIA}
          icon={<NFTOldIcon boxSize={25} cursor="pointer" />}
          onChange={(val) =>
            setLandAssetsFilter({
              ...landAssetsFilter,
              luck: val,
            })
          }
        />
      )}

      {!isNil(commission) && (
        <PlanetFilterSlider
          min={0}
          max={25}
          step={1}
          title="Commission"
          color={Colors.DI_SERRIA}
          initialValue={commission}
          icon={<ProfitsIcon cursor="pointer" boxSize={25} />}
          onChange={(val) =>
            setLandAssetsFilter({
              ...landAssetsFilter,
              commission: val,
            })
          }
        />
      )}
    </SimpleGrid>
  )
}

export { LandsFilterbarSwitches }
