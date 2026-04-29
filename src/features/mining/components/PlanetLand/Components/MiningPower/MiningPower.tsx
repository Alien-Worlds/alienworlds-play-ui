import { useEffect, useState, VFC } from 'react'

import { MiningIcon } from '@alien-worlds/icons'
import { Flex, Text } from '@chakra-ui/react'
import { GlossaryInfoIcon } from 'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon'
import { TooltipLocations } from 'features/glossary/utils/glossaryConst'
import { Colors } from 'shared/util/colors'
import { useAppState } from 'store'
import { calculateMiningPower } from 'store/main/helpers'

const MiningPower: VFC = () => {
  const {
    atomic: { bagAssets, landAsset },
  } = useAppState()

  const [power, setPower] = useState('')

  useEffect(() => {
    setPower(calculateMiningPower(bagAssets, landAsset))
  }, [bagAssets, landAsset])

  return (
    <Flex alignItems="flex-start" color={Colors.WEB_ORANGE}>
      <MiningIcon boxSize={31} style={{ position: 'relative' }} />

      <Flex direction="column" ml={4} alignItems="flex-start">
        <Text fontSize="lg" lineHeight={1} fontFamily="Orbitron" color="white">
          {power}%
        </Text>
        <Flex justifyContent="center" alignItems="center" gap={1}>
          <Text fontFamily="Titillium Web" fontWeight="bold" fontSize="sm" letterSpacing="0.1em">
            Mining Power
          </Text>
          <GlossaryInfoIcon
            width={16}
            glossaryId={TooltipLocations.MINING_LAND_STATS_MINING_POWER}
          />
        </Flex>
      </Flex>
    </Flex>
  )
}

export { MiningPower }
