import { FC, useEffect, useState } from 'react'

import {
  Button,
  NFTCard,
  NFTCardMaxedIndicator,
  NFTFullSizeImage,
  NFTOverlayPanel,
} from '@alien-worlds/uikit'
import { Box, Flex, Text } from '@chakra-ui/react'
import {
  CommunityNftCardDataPreparation,
  NFTCardTypes,
} from 'features/inventory/utils/NFTCardHelper'
import { CommunityNFTCardOverlayRender } from 'features/inventory/utils/NFTCardOverlayRender'
import {
  getColorsBySupply,
  NftOfferSupplyBadge,
} from 'features/outpost/components/NftOfferSupplyBadge/NftOfferSupplyBadge'
import { NftZoomModal } from 'features/outpost/modals/NftZoomModal/NftZoomModal'
import { ShowRedeemModal } from 'features/outpost/types/nftOutpostTypes'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner'
import { motion } from 'framer-motion'
import { map, toNumber } from 'lodash'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useWaxPagination } from 'shared/hooks/useWaxPagination'
import { Colors } from 'shared/util/colors'
import { formatUserPointsWithDecimal } from 'shared/util/helpers'
import { useActions, useAppState } from 'store'
import { PremintOfferWithTemplate } from 'store/wax/types'
import { v4 as uuidv4 } from 'uuid'

type CommunityNftProps = {
  premintOffer: PremintOfferWithTemplate
  redeem: ShowRedeemModal
}

type CommunityNftSupply = {
  maxSupply: string
  supplyLeft: string
  issuedSupply: string
}

const AnimatedBox = motion(Box)
const CommunityNftCard: FC<{
  premintOffer: PremintOfferWithTemplate
  hideIndicator?: boolean
  onZoom?: () => void
}> = ({ premintOffer, hideIndicator, onZoom }) => {
  const [asset, setAsset] = useState<NFTCardTypes>(null)
  const [supply, setSupply] = useState<CommunityNftSupply>({
    maxSupply: null,
    supplyLeft: null,
    issuedSupply: null,
  })

  useEffect(() => {
    if (premintOffer.asset) {
      const supplyLeft = premintOffer?.available_count?.toString() ?? null
      // Special case for maxSupply in Community NFT. the maxSupply 0 in AW NFT is identified as infinity
      // while in Community NFT, the maxSupply 0 is identified as 0
      const maxSupply = premintOffer?.available_count === 0 ? null : supplyLeft

      setAsset(CommunityNftCardDataPreparation(premintOffer.asset))
      setSupply({
        maxSupply,
        supplyLeft,
        // Community NFT does not have issuedSupply, so we set it to 0
        issuedSupply: '0',
      })
    }
  }, [premintOffer.asset])

  return (
    asset && (
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
          <NFTCard title="" rarity="default" disableImageInnerRing>
            <NFTFullSizeImage src={asset.nftImage.name} />
            <NFTCardMaxedIndicator
              variant="zinc"
              disable={hideIndicator}
              solidColor={
                getColorsBySupply(toNumber(supply.supplyLeft), supply.maxSupply).borderColor
              }
              bgColor={toNumber(supply.supplyLeft) === 0 ? Colors.RADICAL_RED : Colors.MINE_SHAFT}
            >
              <NftOfferSupplyBadge
                issuedSupply={supply.issuedSupply}
                maxSupply={supply.maxSupply}
              />
            </NFTCardMaxedIndicator>

            <NFTOverlayPanel>
              <CommunityNFTCardOverlayRender asset={asset} zoom={onZoom} />
            </NFTOverlayPanel>
          </NFTCard>
        </AnimatedBox>
      </Box>
    )
  )
}

const CommunityNft: FC<CommunityNftProps> = ({ premintOffer, redeem }) => {
  const {
    modal: { setPrimaryModalActive },
    main: { setOutPostModalsActive },
  } = useActions()
  const {
    wax: { isDemoUser },
  } = useAppState()
  const [showZoomModal, setShowZoomModal] = useState(false)

  return (
    premintOffer?.asset && (
      <Flex direction="column" justifyContent="center">
        <CommunityNftCard
          premintOffer={premintOffer}
          onZoom={() => {
            setOutPostModalsActive(true)
            setShowZoomModal(true)
          }}
        />

        {showZoomModal && (
          <NftZoomModal
            src={premintOffer?.asset?.data?.img}
            isOpen={showZoomModal}
            pointsRequired={premintOffer.required}
            redeemAction={() => {
              setOutPostModalsActive(true)
              setShowZoomModal(false)
              redeem(
                <CommunityNftCard premintOffer={premintOffer} />,
                premintOffer.offer_id,
                premintOffer.required
              )
            }}
            onClose={() => {
              setOutPostModalsActive(false)
              setShowZoomModal(false)
            }}
          />
        )}
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
            {formatUserPointsWithDecimal(premintOffer.required)}
          </Text>

          <Flex justifyContent="center" my="5px">
            <Button
              size="sm"
              variant="negative"
              onClick={() => {
                if (isDemoUser) {
                  setPrimaryModalActive({ modalName: 'LoginModal', value: true })
                } else {
                  redeem(
                    <CommunityNftCard premintOffer={premintOffer} />,
                    premintOffer.offer_id,
                    premintOffer.required
                  )
                }
              }}
              disabled={premintOffer.available_count === 0}
            >
              Fuse Shards
            </Button>
          </Flex>
        </Flex>
      </Flex>
    )
  )
}

const CommunityNftOffers = ({ showRedeemModal }) => {
  const {
    wax: { loadPremintOffersAction },
  } = useActions()

  const limit = 10
  const {
    items: communityNfts,
    fetchMore,
    isLastPage,
  } = useWaxPagination<PremintOfferWithTemplate>(limit, loadPremintOffersAction)

  useEffect(() => {
    fetchMore()
  }, [])

  return (
    <Box width="full">
      <InfiniteScroll
        dataLength={communityNfts.length}
        hasMore={!isLastPage}
        next={fetchMore}
        loader={
          <Flex py={4}>
            <LoadingSpinner inline />
          </Flex>
        }
        style={{ paddingTop: 25 }}
      >
        <Flex flexWrap="wrap" justifyContent="space-evenly" rowGap="75px" columnGap="25px">
          {map(communityNfts, (premintOffer) => (
            <CommunityNft
              premintOffer={premintOffer}
              redeem={showRedeemModal}
              key={premintOffer.next_asset_id}
            />
          ))}
        </Flex>
      </InfiniteScroll>
    </Box>
  )
}

export { CommunityNftOffers, CommunityNft }
