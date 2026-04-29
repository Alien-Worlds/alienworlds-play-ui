import { useEffect, useState } from 'react'

import {
  Button,
  NFTCard,
  NFTCardBottomPanel,
  NFTCardDetailsPanel,
  NFTCardMaxedIndicator,
  NFTCardTopRightPanel,
  NFTImage,
  NFTOverlayPanel,
} from '@alien-worlds/uikit'
import { Box, Flex, Text } from '@chakra-ui/react'
import { NFTCardSingleCardPrep, NFTCardTypes } from 'features/inventory/utils/NFTCardHelper'
import {
  NFTCardBottomPanelRender,
  NFTCardDetailPanelRender,
  NFTCardOverlayRender,
  NFTCardTopRightPanelRender,
} from 'features/inventory/utils/NFTCardOverlayRender'
import {
  getColorsBySupply,
  getSupplyLeft,
  NftOfferSupplyBadge,
} from 'features/outpost/components/NftOfferSupplyBadge/NftOfferSupplyBadge'
import { NftZoomModal } from 'features/outpost/modals/NftZoomModal/NftZoomModal'
import { ShowRedeemModal } from 'features/outpost/types/nftOutpostTypes'
import { motion } from 'framer-motion'
import { Colors } from 'shared/util/colors'
import {
  formatUserPointsWithDecimal,
  getCurrentOfferColor,
  getUpcomingOfferColor,
  showExpireTimeLeft,
  showUpcomingTimeLeft,
} from 'shared/util/helpers'
import { useActions, useAppState } from 'store'
import { WaxPointsOfferWithTemplate } from 'store/wax/types'
import { v4 as uuidv4 } from 'uuid'

export interface UserPointsOfferProps {
  pointsOffer: WaxPointsOfferWithTemplate
  redeem: ShowRedeemModal
  type: UserPointsOfferType
  hideIndicator?: boolean
}

export enum UserPointsOfferType {
  CURRENT,
  UPCOMING,
}

const AnimatedBox = motion(Box)

const UserPointsOffer = ({
  pointsOffer,
  redeem,
  type,
  hideIndicator,
}: UserPointsOfferProps): JSX.Element => {
  let timerContent = null
  const [asset, setAsset] = useState<NFTCardTypes>(null)
  const [supplyLeft, setSupplyLeft] = useState<number>(null)

  const {
    wax: { walletId },
  } = useAppState()

  useEffect(() => {
    setAsset(NFTCardSingleCardPrep(pointsOffer.asset, walletId))
  }, [pointsOffer.asset])

  useEffect(() => {
    if (asset) {
      setSupplyLeft(getSupplyLeft(asset.issuedSupply.name, asset.maxSupply.name))
    }
  }, [asset])

  const AWNftCard = ({ zoom }: { zoom?: () => void }) => {
    return (
      <Box borderRadius={20} cursor="pointer">
        <AnimatedBox
          key={uuidv4()}
          initial={{ y: -50, opacity: 0 }}
          animate={{
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              delay: 0.1,
            },
          }}
          exit={{ y: 50, opacity: 0, transition: { duration: 0.15 } }}
          transform="scale(0.5)"
          transformOrigin="left top"
        >
          <NFTCard
            title={asset.type.name}
            rarity={asset.rarity.name}
            shine={asset.shine.name}
            animate
          >
            <NFTCardMaxedIndicator
              variant="zinc"
              disable={hideIndicator}
              solidColor={getColorsBySupply(supplyLeft, asset.maxSupply.name).borderColor}
              bgColor={supplyLeft === 0 ? Colors.RADICAL_RED : Colors.MINE_SHAFT}
            >
              <NftOfferSupplyBadge
                issuedSupply={asset.issuedSupply.name}
                maxSupply={asset.maxSupply.name}
              />
            </NFTCardMaxedIndicator>
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
            <NFTOverlayPanel>
              <NFTCardOverlayRender asset={asset} zoom={zoom} />
            </NFTOverlayPanel>
          </NFTCard>
        </AnimatedBox>
      </Box>
    )
  }

  switch (type) {
    case UserPointsOfferType.CURRENT:
    default:
      timerContent = (
        <Text
          fontSize="small"
          color={getCurrentOfferColor(pointsOffer)}
          textAlign="center"
          fontFamily="orb"
        >
          Expires: {showExpireTimeLeft(pointsOffer.end)}
        </Text>
      )
      break

    case UserPointsOfferType.UPCOMING:
      timerContent = (
        <Text
          fontSize="small"
          color={getUpcomingOfferColor(pointsOffer)}
          textAlign="center"
          fontFamily="orb"
        >
          Launch: {showUpcomingTimeLeft(pointsOffer.start)}
        </Text>
      )
      break
  }

  const {
    main: { setOutPostModalsActive },
  } = useActions()
  const {
    modal: { setPrimaryModalActive },
  } = useActions()
  const {
    wax: { isDemoUser },
  } = useAppState()
  const [showZoomModal, setShowZoomModal] = useState(false)

  return (
    asset && (
      <Flex key={pointsOffer.id} direction="column" justifyContent="center">
        <AWNftCard
          zoom={() => {
            setOutPostModalsActive(true)
            setShowZoomModal(true)
          }}
        />
        {showZoomModal && (
          <NftZoomModal
            src={pointsOffer?.asset?.data?.img}
            isOpen={showZoomModal}
            pointsRequired={pointsOffer.required}
            redeemAction={() => {
              setOutPostModalsActive(true)
              setShowZoomModal(false)
              redeem(<AWNftCard />, pointsOffer.id, pointsOffer.required)
            }}
            onClose={() => {
              setOutPostModalsActive(false)
              setShowZoomModal(false)
            }}
          />
        )}
        <AnimatedBox
          key={uuidv4()}
          initial={{ y: -50, opacity: 0 }}
          animate={{
            y: 0,
            opacity: 1,
            transition: {
              duration: 0.3,
              delay: 0.1,
            },
          }}
          exit={{ y: 50, opacity: 0, transition: { duration: 0.15 } }}
          transform="scale(0.5)"
          transformOrigin="left top"
        >
          <Flex flexDirection="column">
            <Text
              fontSize={14}
              fontWeight="semibold"
              color={Colors.DARK_YELLOW}
              textAlign="center"
              fontFamily="tlm"
              mt={1}
              mb={-2}
            >
              Shards
            </Text>
            <Text fontSize="3xl" textAlign="center" fontFamily="orb">
              {formatUserPointsWithDecimal(pointsOffer.required)}
            </Text>
            {timerContent}
            <Flex justifyContent="center" my="10px">
              <Button
                size="sm"
                variant={type === UserPointsOfferType.UPCOMING ? 'tertiary' : 'negative'}
                disabled={type === UserPointsOfferType.UPCOMING || supplyLeft === 0}
                onClick={() => {
                  if (isDemoUser) {
                    setPrimaryModalActive({ modalName: 'LoginModal', value: true })
                  } else {
                    redeem(<AWNftCard />, pointsOffer.id, pointsOffer.required)
                  }
                }}
              >
                Fuse Shards
              </Button>
            </Flex>
          </Flex>
        </AnimatedBox>
      </Flex>
    )
  )
}

export { UserPointsOffer }
