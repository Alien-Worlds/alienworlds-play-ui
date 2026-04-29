import { useEffect, useState, VFC } from 'react'

import { Flex, Text } from '@chakra-ui/react'
import { GlossaryInfoIcon } from 'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon'
import { TooltipLocations } from 'features/glossary/utils/glossaryConst'
import { calculatePow } from 'store/main/helpers'

import { useAppState } from '../../../../../../store'

const PowReduction: VFC = () => {
  const {
    atomic: { bagAssets, landAsset },
  } = useAppState()

  const [difficulty, setDifficulty] = useState('')

  useEffect(() => {
    setDifficulty(calculatePow(bagAssets, landAsset))
  }, [bagAssets, landAsset])

  return (
    <Flex alignItems="center" color="#0ed4a8" mt="-10px">
      <Text
        fontFamily="Orbitron"
        fontSize="4xl"
        letterSpacing="0.1em"
        textAlign="right"
        minW="31px"
      >
        {difficulty}
      </Text>
      <Flex direction="column" ml={4} alignItems="flex-start">
        <Text fontFamily="tlm" fontWeight="bold" fontSize="16px" color="white">
          POW Reduction
        </Text>

        <Flex justifyContent="center" alignItems="center" gap={1}>
          <Text fontFamily="tlm" fontWeight="bold" fontSize="12px">
            (Proof of Work)
          </Text>
          <GlossaryInfoIcon width={16} glossaryId={TooltipLocations.MINING_LAND_STATS_POW} />
        </Flex>
      </Flex>
    </Flex>
  )
}

export { PowReduction }
