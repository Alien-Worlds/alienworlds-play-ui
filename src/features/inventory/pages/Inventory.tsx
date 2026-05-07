import { useState, useEffect } from 'react'

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
import {
  Box,
  Flex,
  Hide,
  Icon,
  IconButton,
  Spinner,
  Tabs,
  Text,
  useBreakpointValue,
} from '@chakra-ui/react'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { AssetsFilterPanel } from 'features/inventory/components/AssetsFilterPanel/AssetsFilterPanel'
import { InventoryErrorBoundary } from 'features/inventory/components/ErrorBoundary'
import { InventoryFiltersDrawer } from 'features/inventory/components/InventoryFiltersDrawer/InventoryFiltersDrawer'
import { useAssetProcessing } from 'features/inventory/hooks/useAssetProcessing'
import { NFTCardTypes } from 'features/inventory/utils/NFTCardHelper'
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
import _, { get, toLower } from 'lodash'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useNavigate } from 'react-router-dom'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState, useEffects } from 'store'
import { PagePath } from 'store/main/types'

const AnimatedBox = motion(Box)

/**
 * Inventory Page Component
 *
 * This component has been updated to integrate the new refactored inventory system
 * while maintaining backward compatibility with the existing UI components.
 *
 * Key Integration Points:
 * - Uses new useInventory hook for state management
 * - Uses new useAssetProcessing hook for data transformation
 * - Wrapped with InventoryErrorBoundary for error handling
 * - Enhanced loading states and pagination
 * - Fully migrated to new refactored architecture
 */
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
  const iconSize = useBreakpointValue({ base: '20px', lg: '24px' })
  const { planetDetails, loading } = usePlanetDetail(planetSelectedForMining)
  const navigate = useNavigate()
  const [zoomImg, setZoomImg] = useState<string>(null)
  const [showZoomModal, setShowZoomModal] = useState(false)
  const [openInventoryFilterDrawer, setOpenInventoryFilterDrawer] = useState(false)

  // Use the new asset processing hook
  const { processAssets } = useAssetProcessing()

  // Legacy state for backward compatibility
  const [sortedAssets, setSortedAssets] = useState<NFTCardTypes[]>([])
  const paginationHasMore = sortedAssets.length < (filteredAndSortedAssets?.length || 0)

  // Asset processing using new hook
  const showAssets = (reset: Boolean) => {
    if (!filteredAndSortedAssets) {
      setSortedAssets([])
      return
    }

    let newVisibleCount = reset ? 30 : sortedAssets.length + 30

    if (newVisibleCount >= filteredAndSortedAssets.length) {
      newVisibleCount = filteredAndSortedAssets.length
    }
    // #region agent log
    fetch('http://127.0.0.1:7673/ingest/ed6b6d14-c584-4d87-aec2-7892ae89ae48', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '0af25a' },
      body: JSON.stringify({
        sessionId: '0af25a',
        runId: 'initial',
        hypothesisId: 'H2',
        location: 'src/features/inventory/pages/Inventory.tsx:showAssets',
        message: 'showAssets computed visible count',
        data: {
          reset,
          previousSortedAssetsLength: sortedAssets.length,
          filteredAndSortedAssetsLength: filteredAndSortedAssets.length,
          newVisibleCount,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion

    // Use new asset processing hook instead of legacy function
    const processedAssets = processAssets(filteredAndSortedAssets.slice(0, newVisibleCount), {
      walletId,
      bagAssets,
      includeImages: true,
      includePowers: true,
      includeMetadata: true,
    })

    setSortedAssets(processedAssets as any) // Type assertion for compatibility with existing UI
  }

  // Use new hook for pagination
  const renderMore = () => {
    // #region agent log
    fetch('http://127.0.0.1:7673/ingest/ed6b6d14-c584-4d87-aec2-7892ae89ae48', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '0af25a' },
      body: JSON.stringify({
        sessionId: '0af25a',
        runId: 'initial',
        hypothesisId: 'H3',
        location: 'src/features/inventory/pages/Inventory.tsx:renderMore',
        message: 'infinite scroll requested more items',
        data: {
          sortedAssetsLength: sortedAssets.length,
          paginationHasMore,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
    showAssets(false)
  }

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7673/ingest/ed6b6d14-c584-4d87-aec2-7892ae89ae48', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '0af25a' },
      body: JSON.stringify({
        sessionId: '0af25a',
        runId: 'initial',
        hypothesisId: 'H1',
        location: 'src/features/inventory/pages/Inventory.tsx:filteredAndSortedAssets.effect',
        message: 'filteredAndSortedAssets changed',
        data: {
          filteredAndSortedAssetsLength: filteredAndSortedAssets?.length ?? 0,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
    showAssets(true)
    return () => {
      showAssets(false)
    }
  }, [filteredAndSortedAssets])

  useEffect(() => {
    // #region agent log
    fetch('http://127.0.0.1:7673/ingest/ed6b6d14-c584-4d87-aec2-7892ae89ae48', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Debug-Session-Id': '0af25a' },
      body: JSON.stringify({
        sessionId: '0af25a',
        runId: 'initial',
        hypothesisId: 'H4',
        location: 'src/features/inventory/pages/Inventory.tsx:pagination.effect',
        message: 'pagination state changed',
        data: {
          paginationHasMore,
          sortedAssetsLength: sortedAssets.length,
          totalFilteredAssetsLength: filteredAndSortedAssets?.length ?? 0,
        },
        timestamp: Date.now(),
      }),
    }).catch(() => {})
    // #endregion
  }, [paginationHasMore, sortedAssets.length, filteredAndSortedAssets?.length])

  useEffect(() => {
    showInventoryPage()
  }, [])
  // Show loading spinner for both planet details and inventory loading
  if (loading) return <LoadingSpinner />

  return (
    <InventoryErrorBoundary>
      <motion.div>
        <Flex justifyContent="space-between" alignItems="center">
          <Box width="100%" px={4}>
            <Flex justifyContent="space-between" width="100%">
              <Flex alignItems="center" gap={4}>
                <Flex
                  boxSize={{ base: '36px', lg: '48px' }}
                  borderRadius="full"
                  background={Colors.SNOW_WHITE}
                  justifyContent="center"
                  alignItems="center"
                >
                  <InventoryIcon boxSize={iconSize} color={Colors.BLACK_SOLID_100} />
                </Flex>
                <Flex alignItems="center">
                  <Text fontFamily="orb" fontWeight={400} fontSize={{ base: '30px', lg: '40px' }}>
                    Inventory
                  </Text>
                </Flex>
              </Flex>

              <IconButton
                display={{ base: 'block', md: 'none' }}
                aria-label={'filter'}
                backgroundColor="transparent"
                _hover={{ backgroundColor: 'transparent' }}
                onClick={() => setOpenInventoryFilterDrawer(true)}
                icon={
                  <Icon viewBox="0 0 30 30" color={Colors.SNOW_WHITE} boxSize="28px">
                    <path
                      d="M28.3334 4.33351C28.3334 3.40009 28.3327 2.93302 28.151 2.5765C27.9914 2.2629 27.7372 2.00812 27.4237 1.84832C27.0672 1.66667 26.5995 1.66667 25.666 1.66667H4.3327C3.39929 1.66667 2.93304 1.66667 2.57652 1.84832C2.26292 2.00812 2.00814 2.2629 1.84834 2.5765C1.66669 2.93302 1.66669 3.40009 1.66669 4.33351V5.56227C1.66669 5.96992 1.66669 6.17389 1.71274 6.3657C1.75357 6.53577 1.82107 6.69822 1.91245 6.84734C2.01549 7.01547 2.15987 7.15985 2.44794 7.44792L10.8858 15.8858C11.1741 16.174 11.3174 16.3173 11.4205 16.4857C11.5119 16.6347 11.5803 16.7977 11.6211 16.9678C11.6667 17.1577 11.6667 17.3592 11.6667 17.7587V25.685C11.6667 27.1137 11.6667 27.8285 11.9675 28.2587C12.2304 28.6343 12.6357 28.885 13.0892 28.952C13.6085 29.0287 14.2479 28.7095 15.5257 28.0707L16.859 27.404C17.3942 27.1365 17.661 27.0022 17.8565 26.8025C18.0294 26.626 18.1617 26.4142 18.2422 26.1807C18.3334 25.9165 18.3334 25.6167 18.3334 25.0183V17.771C18.3334 17.3633 18.3334 17.1597 18.3794 16.9678C18.4202 16.7977 18.4877 16.6347 18.5792 16.4857C18.6815 16.3185 18.8245 16.1755 19.1089 15.8912L19.1147 15.8858L27.5525 7.44792C27.8407 7.15967 27.984 7.01554 28.0872 6.84734C28.1785 6.69822 28.247 6.53577 28.2879 6.3657C28.3334 6.17585 28.3334 5.97407 28.3334 5.57467V4.33351Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Icon>
                }
              ></IconButton>
              <InventoryFiltersDrawer
                isOpen={openInventoryFilterDrawer}
                onClose={() => setOpenInventoryFilterDrawer(false)}
              />
            </Flex>
            <Flex marginX={{ base: 2, lg: 16 }} my="4px">
              <Text fontFamily="tlm" fontWeight={400} color={Colors.JUMBO} fontSize="16px">
                View your NFT inventory.
              </Text>
            </Flex>
          </Box>

          <Hide below="md">
            <Flex mr={4}>
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
            </Flex>
          </Hide>
          <Hide above="md">
            <Flex position="fixed" bottom={5} zIndex={10000} width="100%" justifyContent="center">
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
            </Flex>
          </Hide>
        </Flex>

        <Tabs
          variant="soft-rounded"
          colorScheme="gray"
          alignSelf="center"
          justifyContent="center"
          w="full"
          mt={4}
          pb={{ base: 0, md: isDemoUser && '100px' }}
        >
          <Flex display={{ base: 'none', md: 'initial' }}>
            <AssetsFilterPanel />
          </Flex>

          <InfiniteScroll
            dataLength={sortedAssets.length}
            next={renderMore}
            style={{ padding: 0, margin: 0, overflow: 'hidden' }}
            hasMore={paginationHasMore}
            loader={
              <Flex w="100%" alignItems="center" justifyContent="center">
                <Spinner />
              </Flex>
            }
          >
            <Box mt={{ base: '25px', sm: '50px' }} mb={15}>
              <Flex
                gridGap={8}
                flexWrap="wrap"
                justifyContent="center"
                alignItems="flex-start"
                w="full"
              >
                {get(planetDetails, 'planet_details', false) &&
                  sortedAssets.map((card, index) => {
                    return (
                      <AnimatedBox
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
                        transform="scale(0.5)"
                        transformOrigin="left top"
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
                            label={_.get(card, 'commission.name', 0)}
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
                      </AnimatedBox>
                    )
                  })}
              </Flex>
            </Box>
          </InfiniteScroll>
        </Tabs>
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
