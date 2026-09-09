import { useEffect, useMemo, useState } from 'react'

import { InventoryIcon, ShiningIcon3 } from '@alien-worlds/icons'
import {
  Button,
  NFTCard,
  NFTCardBottomPanel,
  NFTCardDetailsPanel,
  NFTCardTopRightPanel,
  NFTImage,
  NFTInUseButton,
  NFTOverlayPanel,
  NFTPlanetComission,
  NFTPlanetIndicator,
  NFTShowAllButton,
} from '@alien-worlds/uikit'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { AssetsFilterPanel } from 'features/inventory/components/AssetsFilterPanel/AssetsFilterPanel'
import { InventoryErrorBoundary } from 'features/inventory/components/ErrorBoundary'
import { InventoryFiltersDrawer } from 'features/inventory/components/InventoryFiltersDrawer/InventoryFiltersDrawer'
import { useAssetProcessing } from 'features/inventory/hooks/useAssetProcessing'
import { useInventoryStore } from 'features/inventory/store/inventoryStore'
import {
  NFTCardBottomPanelRender,
  NFTCardDetailPanelRender,
  NFTCardOverlayRender,
  NFTCardSetAvatar,
  NFTCardTopRightPanelRender,
  NFTShowAllRender,
} from 'features/inventory/utils/NFTCardOverlayRender'
import { getPlanetImage, PlanetImageSizes } from 'features/mining/utils/planet'
import { NftZoomModal } from 'features/outpost/modals/NftZoomModal/NftZoomModal'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { motion } from 'framer-motion'
import { usePlanetDetail } from 'graphql/hooks/usePlanetDetail'
import { get, toLower } from 'lodash'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useNavigate } from 'react-router-dom'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState, useEffects } from 'store'
import { PagePath } from 'store/main/types'

const Inventory = () => {
  const {
    atomic: {
      api: { getAssetById },
    },
  } = useEffects()
  const {
    main: { showInventoryPage, setOutPostModalsActive },
  } = useActions()

  const {
    wax: { planetSelectedForMining, walletId, isDemoUser },
    atomic: { filteredAndSortedAssets, bagAssets, landAsset },
  } = useAppState()
  const { planetDetails, loading } = usePlanetDetail(planetSelectedForMining)
  const navigate = useNavigate()
  const [zoomImg, setZoomImg] = useState<string>(null)
  const [showZoomModal, setShowZoomModal] = useState(false)
  const [openInventoryFilterDrawer, setOpenInventoryFilterDrawer] = useState(false)

  const { processAssets } = useAssetProcessing()
  const { visibleCount, reset, loadMore } = useInventoryStore()

  const totalCount = filteredAndSortedAssets?.length || 0
  const paginationHasMore = visibleCount < totalCount

  const sortedAssets = useMemo(() => {
    if (!filteredAndSortedAssets) return []

    return processAssets(filteredAndSortedAssets.slice(0, visibleCount), {
      walletId,
      bagAssets,
      includeImages: true,
      includePowers: true,
      includeMetadata: true,
    })
  }, [filteredAndSortedAssets, visibleCount, walletId, bagAssets, processAssets])

  useEffect(() => {
    reset()
  }, [filteredAndSortedAssets, reset])

  useEffect(() => {
    showInventoryPage()
  }, [])

  // Show loading spinner for both planet details and inventory loading
  if (loading) return <LoadingSpinner />

  return (
    <InventoryErrorBoundary>
      <motion.div>
        <div className="flex items-center justify-between">
          <div className="w-full px-4">
            <div className="flex w-full justify-between">
              <div className="flex items-center gap-4">
                <div
                  className="flex size-9 items-center justify-center rounded-full lg:size-12"
                  style={{ background: Colors.SNOW_WHITE }}
                >
                  <InventoryIcon boxSize={24} color={Colors.BLACK_SOLID_100} />
                </div>
                <div className="flex items-center">
                  <p className="font-orb text-[30px] font-normal lg:text-[40px]">Inventory</p>
                </div>
              </div>

              <button
                type="button"
                aria-label="filter"
                className="block bg-transparent md:hidden"
                onClick={() => setOpenInventoryFilterDrawer(true)}
              >
                <svg
                  viewBox="0 0 30 30"
                  className="size-7"
                  style={{ color: Colors.SNOW_WHITE }}
                  fill="none"
                >
                  <path
                    d="M28.3334 4.33351C28.3334 3.40009 28.3327 2.93302 28.151 2.5765C27.9914 2.2629 27.7372 2.00812 27.4237 1.84832C27.0672 1.66667 26.5995 1.66667 25.666 1.66667H4.3327C3.39929 1.66667 2.93304 1.66667 2.57652 1.84832C2.26292 2.00812 2.00814 2.2629 1.84834 2.5765C1.66669 2.93302 1.66669 3.40009 1.66669 4.33351V5.56227C1.66669 5.96992 1.66669 6.17389 1.71274 6.3657C1.75357 6.53577 1.82107 6.69822 1.91245 6.84734C2.01549 7.01547 2.15987 7.15985 2.44794 7.44792L10.8858 15.8858C11.1741 16.174 11.3174 16.3173 11.4205 16.4857C11.5119 16.6347 11.5803 16.7977 11.6211 16.9678C11.6667 17.1577 11.6667 17.3592 11.6667 17.7587V25.685C11.6667 27.1137 11.6667 27.8285 11.9675 28.2587C12.2304 28.6343 12.6357 28.885 13.0892 28.952C13.6085 29.0287 14.2479 28.7095 15.5257 28.0707L16.859 27.404C17.3942 27.1365 17.661 27.0022 17.8565 26.8025C18.0294 26.626 18.1617 26.4142 18.2422 26.1807C18.3334 25.9165 18.3334 25.6167 18.3334 25.0183V17.771C18.3334 17.3633 18.3334 17.1597 18.3794 16.9678C18.4202 16.7977 18.4877 16.6347 18.5792 16.4857C18.6815 16.3185 18.8245 16.1755 19.1089 15.8912L19.1147 15.8858L27.5525 7.44792C27.8407 7.15967 27.984 7.01554 28.0872 6.84734C28.1785 6.69822 28.247 6.53577 28.2879 6.3657C28.3334 6.17585 28.3334 5.97407 28.3334 5.57467V4.33351Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              <InventoryFiltersDrawer
                isOpen={openInventoryFilterDrawer}
                onClose={() => setOpenInventoryFilterDrawer(false)}
              />
            </div>
            <div className="mx-2 my-1 flex lg:mx-16">
              <p className="font-tlm text-base" style={{ color: Colors.JUMBO }}>
                View your NFT inventory.
              </p>
            </div>
          </div>

          <div className="hidden md:mr-4 md:flex">
            <Button
              onClick={() => navigate(PagePath.Shining)}
              leftIcon={<ShiningIcon3 />}
              size="lg"
              variant="warning"
              maxWidth="130px"
              maxHeight="48px"
            >
              Shine
            </Button>
          </div>
          <div className="fixed bottom-5 z-[10000] flex w-full justify-center md:hidden">
            <Button
              onClick={() => navigate(PagePath.Shining)}
              leftIcon={<ShiningIcon3 />}
              size="lg"
              variant="warning"
              maxWidth="300px"
              maxHeight="40px"
              isFullWidth
            >
              Shine
            </Button>
          </div>
        </div>

        <div className={`mt-4 w-full pb-0 ${isDemoUser ? 'md:pb-[100px]' : 'md:pb-0'}`}>
          <div className="hidden md:block">
            <AssetsFilterPanel />
          </div>

          <InfiniteScroll
            dataLength={sortedAssets.length}
            next={() => loadMore(totalCount)}
            style={{ padding: 0, margin: 0, overflow: 'hidden' }}
            hasMore={paginationHasMore}
            loader={
              <div className="flex w-full items-center justify-center py-6">
                <div className="size-8 animate-spin rounded-full border-4 border-white/20 border-t-white" />
              </div>
            }
          >
            <div className="mb-[15px] mt-[25px] sm:mt-[50px]">
              <div className="flex w-full flex-wrap items-start justify-center gap-8">
                {get(planetDetails, 'planet_details', false) &&
                  sortedAssets.map((card, index) => {
                    return (
                      <motion.div
                        key={index}
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
                        style={{ transform: 'scale(0.5)', transformOrigin: 'left top' }}
                      >
                        <NFTCard
                          title={card.type?.name}
                          rarity={card.rarity.name}
                          shine={card.shine.name}
                          animate
                        >
                          <NFTInUseButton
                            disable={
                              !card.isInBag && landAsset && card.assetId.name !== landAsset.asset_id
                            }
                            altText={card.type?.name === 'Land' && 'Selected'}
                            onClick={() => {
                              if (card.type?.name === 'Land') {
                                navigate(PagePath.Land)
                              } else {
                                navigate(PagePath.Tools)
                              }
                            }}
                          />

                          <NFTCardTopRightPanel>
                            <NFTCardTopRightPanelRender asset={card} />
                          </NFTCardTopRightPanel>
                          <NFTImage
                            hideInnerRing={card.disableInnerRing}
                            src={card.nftImage.name}
                            isFocused={get(card, 'collectionName.name') === 'alienavatars'}
                          />
                          <NFTCardDetailsPanel>
                            <NFTCardDetailPanelRender asset={card} />
                          </NFTCardDetailsPanel>
                          <NFTCardBottomPanel>
                            <NFTCardBottomPanelRender asset={card} />
                          </NFTCardBottomPanel>
                          <NFTPlanetComission
                            disable={card.type?.name !== 'Land'}
                            label={get(card, 'commission.name', 0)}
                          />
                          <NFTPlanetIndicator
                            disable={
                              !card.isInBag && landAsset && card.assetId.name !== landAsset.asset_id
                            }
                            src={getPlanetImage(
                              toLower(get(planetDetails, 'planet_details.title', 'naron')),
                              PlanetImageSizes.SMALL
                            )}
                            hideInnerRing
                            innerGradientColor={
                              Colors.planetGradient[toLower(planetDetails.planet_details?.title)]
                            }
                            solidColor="#0ed4a8"
                          />
                          <NFTOverlayPanel>
                            <NFTCardOverlayRender
                              asset={card}
                              zoom={async () => {
                                const assetZoom: IAsset = await getAssetById(card.assetId.name)
                                const image: string = assetZoom?.data?.img
                                if (image) {
                                  setZoomImg(image)
                                  setShowZoomModal(true)
                                  setOutPostModalsActive(true)
                                }
                              }}
                            />

                            <NFTShowAllButton
                              disable={!card.multipleMintTypes}
                              src={card.nftImage.name}
                            >
                              <NFTShowAllRender asset={card} />
                            </NFTShowAllButton>
                            <NFTCardSetAvatar asset={card} />
                          </NFTOverlayPanel>
                        </NFTCard>
                      </motion.div>
                    )
                  })}
              </div>
            </div>
          </InfiniteScroll>
        </div>
      </motion.div>
      {showZoomModal && (
        <NftZoomModal
          isOpen={showZoomModal}
          src={zoomImg}
          hideSubtitle
          onClose={() => {
            setShowZoomModal(false)
            setOutPostModalsActive(false)
          }}
        />
      )}
    </InventoryErrorBoundary>
  )
}

export { Inventory }
