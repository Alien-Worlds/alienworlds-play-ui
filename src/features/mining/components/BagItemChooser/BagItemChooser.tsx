import { useEffect, useMemo, useState } from 'react'

import { ChangeIcon } from '@alien-worlds/icons'
import {
  NFTCard,
  NFTCardBottomPanel,
  NFTCardDetailsPanel,
  NFTCardTopRightPanel,
  NFTImage,
  NFTPlanetComission,
} from '@alien-worlds/uikit'
import { Box, Flex, Text } from '@chakra-ui/react'
import { NFTCardSingleCardPrep, NFTCardTypes } from 'features/inventory/utils/NFTCardHelper'
import {
  NFTCardBottomPanelRender,
  NFTCardDetailPanelRender,
  NFTCardTopRightPanelRender,
} from 'features/inventory/utils/NFTCardOverlayRender'
import { AddCardToBagPlaceholder } from 'features/mining/components/AddToBagPlaceholder'
import { MiningToolsActiveSlotNumber } from 'features/mining/types/MiningTypes'
import {
  MINING_CARD_HEIGHT_PX,
  MINING_CARD_WIDTH_PX,
  ASSET_TYPE_LAND,
} from 'features/mining/utils/constants'
import { motion } from 'framer-motion'
import { get } from 'lodash'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'

const AnimatedFlex = motion(Flex)

const BagItemChooserComponent = ({ index }: { index: MiningToolsActiveSlotNumber }) => {
  const {
    wax: { walletId },
    atomic: { bagAssets },
  } = useAppState()

  const {
    main: {
      mining: { openMiningToolsDrawer },
    },
  } = useActions()

  const [asset, setAsset] = useState<NFTCardTypes>()

  useEffect(() => {
    const currentAsset = bagAssets ? bagAssets[index] : undefined

    if (currentAsset) {
      const preparedAsset = NFTCardSingleCardPrep(currentAsset, walletId)
      setAsset(preparedAsset)
    } else {
      setAsset(undefined)
    }
  }, [bagAssets])

  const isLand = useMemo(() => get(asset, 'type.name', '') === ASSET_TYPE_LAND, [asset])

  return (
    <Box w={`${MINING_CARD_WIDTH_PX}px`} position="relative" userSelect="none" mt={0}>
      <AnimatedFlex
        left={0}
        top={0}
        w={`${MINING_CARD_WIDTH_PX}px`}
        h={`${MINING_CARD_HEIGHT_PX}px`}
        minH={`${MINING_CARD_HEIGHT_PX}px`}
        cursor="pointer"
        position="relative"
        role="group"
        onClick={() => {
          openMiningToolsDrawer(index)
        }}
        zIndex={0}
        initial="visible"
        animate="visible"
        variants={{
          visible: {
            opacity: 1,
          },
          hidden: { opacity: 0.2 },
        }}
      >
        {asset ? (
          <NFTCard
            title={asset.type.name}
            rarity={asset.rarity.name}
            shine={asset.shine.name}
            animate
          >
            <NFTCardTopRightPanel>
              <NFTCardTopRightPanelRender asset={asset} />
            </NFTCardTopRightPanel>
            <NFTImage hideInnerRing={asset.disableInnerRing} src={asset.nftImage.name} />
            <NFTCardDetailsPanel>
              <NFTCardDetailPanelRender asset={asset} />
            </NFTCardDetailsPanel>
            <NFTCardBottomPanel>
              <NFTCardBottomPanelRender asset={asset} />
            </NFTCardBottomPanel>
            <NFTPlanetComission disable={!isLand} label={get(asset, 'commission.name', 0)} />
          </NFTCard>
        ) : (
          <AddCardToBagPlaceholder />
        )}
        <Box
          zIndex={16}
          position="absolute"
          display="none"
          top={0}
          left={0}
          width="100%"
          h="100%"
          opacity={0.92}
          bg="rgb(33, 33, 33)"
          borderRadius={16}
          _groupHover={{
            display: 'block',
          }}
        />

        <Flex
          zIndex={17}
          w="full"
          h="full"
          direction="column"
          justifyContent="center"
          alignItems="center"
          position="absolute"
          display="none"
          right={0}
          left={0}
          _groupHover={{
            display: 'flex',
          }}
        >
          <Text
            fontFamily="Orbitron"
            fontSize="2xl"
            color={Colors.SELECTIVE_YELLOW}
            textAlign="center"
            letterSpacing="0.1em"
          >
            {asset ? 'Change' : 'Set'}
          </Text>
          <Box mt={4} mx="auto">
            <ChangeIcon boxSize={60} color={Colors.SELECTIVE_YELLOW} />
          </Box>
        </Flex>
      </AnimatedFlex>
    </Box>
  )
}

const BagItemChooser = BagItemChooserComponent

export { BagItemChooser }
