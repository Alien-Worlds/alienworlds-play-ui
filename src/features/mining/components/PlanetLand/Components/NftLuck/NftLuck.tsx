import { useEffect, useState, VFC } from 'react'

import { NFTOldIcon } from '@alien-worlds/icons'
import { Flex, Text } from '@chakra-ui/react'
import { GlossaryInfoIcon } from 'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon'
import { TooltipLocations } from 'features/glossary/utils/glossaryConst'
import { Colors } from 'shared/util/colors'
import { useAppState } from 'store'
import { calculateNftLuck } from 'store/main/helpers'

const NftLuck: VFC = () => {
  const {
    atomic: { bagAssets, landAsset },
  } = useAppState()

  const [luck, setLuck] = useState('')

  useEffect(() => {
    setLuck(calculateNftLuck(bagAssets, landAsset))
  }, [bagAssets, landAsset])

  return (
    <Flex alignItems="flex-start" color={Colors.DARK_YELLOW}>
      <NFTOldIcon boxSize={31} style={{ position: 'relative' }} color={Colors.DARK_YELLOW} />

      <Flex direction="column" ml={4} alignItems="flex-start">
        <Text fontSize="lg" lineHeight={1} fontFamily="Orbitron" color="white">
          {luck}
        </Text>

        <Flex justifyContent="center" alignItems="center" gap={1}>
          <Text fontFamily="Titillium Web" fontWeight="bold" fontSize="sm" letterSpacing="0.1em">
            NFT Power
          </Text>

          <GlossaryInfoIcon width={16} glossaryId={TooltipLocations.MINING_LAND_STATS_NFT_POWER} />
        </Flex>
      </Flex>
    </Flex>
  )
}

export { NftLuck }
