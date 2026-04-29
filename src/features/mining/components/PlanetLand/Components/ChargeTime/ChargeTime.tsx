import { useEffect, useState, VFC } from 'react'

import { LightIcon } from '@alien-worlds/icons'
import { Box, Flex, Text } from '@chakra-ui/react'
import { GlossaryInfoIcon } from 'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon'
import { TooltipLocations } from 'features/glossary/utils/glossaryConst'
import { Colors } from 'shared/util/colors'
import { useAppState } from 'store'
import { calculateChargeTime } from 'store/main/helpers'

const ChargeTime: VFC = () => {
  const {
    atomic: { bagAssets, landAsset },
  } = useAppState()

  const [chargeTime, setChargeTime] = useState(-1)
  useEffect(() => {
    setChargeTime(calculateChargeTime(bagAssets, landAsset))
  }, [bagAssets, landAsset])

  if (chargeTime === -1) return <></>

  return (
    <Flex alignItems="center" color={Colors.DODGE_BLUE}>
      <Box w="31px">
        <LightIcon boxSize={42} style={{ position: 'relative' }} color={Colors.DODGE_BLUE} />
      </Box>
      <Flex direction="column" ml={4} alignItems="flex-start">
        <Text fontSize="lg" lineHeight={1} fontFamily="Orbitron" color="white">
          {chargeTime}s
        </Text>

        <Flex justifyContent="center" alignItems="center" gap={1}>
          <Text
            fontFamily="tlm"
            fontWeight="bold"
            fontSize="sm"
            letterSpacing="0.1em"
            color={Colors.DODGE_BLUE}
          >
            Charge Time
          </Text>
          <GlossaryInfoIcon
            width={16}
            glossaryId={TooltipLocations.MINING_LAND_STATS_CHARGE_TIME}
          />
        </Flex>
      </Flex>
    </Flex>
  )
}

export { ChargeTime }
