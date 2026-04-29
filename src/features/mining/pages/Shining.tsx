// import { pageTransition } from 'util/animations'

import { useEffect, useState } from 'react'

import { RightArrowIcon, ShiningIcon, ShiningIcon3 } from '@alien-worlds/icons'
import {
  NFTCard,
  NFTCardBottomPanel,
  NFTCardDetailsPanel,
  NFTCardTopRightPanel,
  NFTImage,
  NFTPlanetComission,
  Button,
  NFTOverlayPanel,
} from '@alien-worlds/uikit'
import {
  Box,
  Container,
  Flex,
  Hide,
  Icon,
  IconButton,
  Link,
  Spinner,
  Tabs,
  Text,
  VStack,
} from '@chakra-ui/react'
import { IAsset, ITemplate } from 'atomicassets/build/API/Explorer/Objects'
//import { AssetsFilterPanel } from 'components/assets-filter/AssetsFilterPanel'
import { AssetsFilterPanel } from 'features/inventory/components/AssetsFilterPanel/AssetsFilterPanel'
import { InventoryFiltersDrawer } from 'features/inventory/components/InventoryFiltersDrawer/InventoryFiltersDrawer'
import {
  NFTCardDataPreparation,
  NFTCardTypes,
  setCardPowers,
} from 'features/inventory/utils/NFTCardHelper'
import {
  NFTCardBottomPanelRender,
  NFTCardDetailPanelRender,
  NFTCardOverlayRender,
  NFTCardTopRightPanelRender,
} from 'features/inventory/utils/NFTCardOverlayRender'
import { ASSET_TYPE_LAND } from 'features/mining/utils/constants'
import { NftZoomModal } from 'features/outpost/modals/NftZoomModal/NftZoomModal'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { motion } from 'framer-motion'
import { useWalletDetails } from 'graphql/hooks/useWalletDetails'
import { WalletDetailsResponse } from 'graphql/types'
import {
  cloneDeep,
  filter,
  find,
  get,
  map,
  set,
  slice,
  split,
  startCase,
  toLower,
  toNumber,
} from 'lodash'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useNavigate } from 'react-router-dom'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'
import { isShinableNFT } from 'shared/util/helpers'
import { formatNumber } from 'shared/util/numbers'
import { useActions, useAppState, useEffects } from 'store'
import { AssetShine } from 'store/atomic/types'
import { PagePath } from 'store/main/types'
import { ShineData } from 'store/wax/types'

const Shining = () => {
  const {
    wax: {
      api: { getShineInfo },
    },
    atomic: {
      api: { getAssetById, getTemplateById },
    },
  } = useEffects()
  const {
    wax: { tryShine },
    modal: { setPrimaryModalActive },
    main: { showShiningPage, setShiningUrl, setOutPostModalsActive },
  } = useActions()
  const {
    wax: { isDemoUser, walletId },
  } = useAppState()
  const {
    wax: { isShining },
    atomic: { filteredAndSortedAssets, assets, triggerFilterAndSortAssets },
  } = useAppState()
  const { walletDetails, loading }: { walletDetails: WalletDetailsResponse; loading: boolean } =
    useWalletDetails(walletId)
  const navigate = useNavigate()
  const [zoomImg, setZoomImg] = useState<string>(null)
  const [hasMore, setHasMore] = useState<boolean>(true)
  const [shinedImg, setShinedImg] = useState<string>(null)
  const [shineMsg, showShineMsg] = useState<boolean>(false)
  const [shineData, setShineData] = useState<ShineData>(null)
  const [visibleAssets, setVisibleAssets] = useState<IAsset[]>([])
  const [showZoomModal, setShowZoomModal] = useState<boolean>(false)
  const [hasEnoughMoney, setHasEnoughMoney] = useState<boolean>(false)
  const [sortedAssets, setSortedAssets] = useState<NFTCardTypes[]>([])
  const [selectedForShine, setSelectedForShine] = useState<NFTCardTypes[]>([])
  const [openInventoryFilterDrawer, setOpenInventoryFilterDrawer] = useState(false)

  const getAssetsForShineTemplate = (): IAsset[] => {
    if (filteredAndSortedAssets === null) return []
    const shineAssets = filter(filteredAndSortedAssets, (x) => isShinableNFT(x))

    return shineAssets
  }

  const getAssetsForShine = (): IAsset[] => {
    if (assets === null || shineData === null) return []

    const selectedKey = `${startCase(shineData.inputData.shine.name)}_${
      shineData.inputData.templateId
    }`
    return assets.filter((x) => {
      return `${x.data.shine}_${x.template.template_id}` === selectedKey
    })
  }

  const showAssets = (currentAssets: IAsset[], reset: boolean) => {
    let newVisibleCount = reset ? 30 : visibleAssets.length + 30
    let newHasMore = true

    if (newVisibleCount >= currentAssets.length) {
      newVisibleCount = currentAssets.length
      newHasMore = false
    }
    setSortedAssets(NFTCardDataPreparation(slice(currentAssets, 0, newVisibleCount)))
    setVisibleAssets(slice(currentAssets, 0, newVisibleCount))
    setHasMore(newHasMore)
  }

  const getAssetsToShow = (reset: boolean) => {
    if (shineData === null) {
      showAssets(getAssetsForShineTemplate(), reset)
      return
    }

    showAssets(getAssetsForShine(), reset)
  }

  const renderMore = () => {
    getAssetsToShow(false)
  }

  const renderShinedNftPreview = async (asset: NFTCardTypes) => {
    // Fetch shined NFT template from selected NFT asset
    const shineInfo = await getShineInfo(asset.templateId)
    const shinedNftTemplate: ITemplate = await getTemplateById(shineInfo?.to?.toString())

    if (!shineInfo || !shinedNftTemplate) {
      return
    }

    // Check if sufficients funds are available for shining
    const enoughMoney = Number(shineInfo.cost.split(' ')[0]) <= triliumBalance
    setHasEnoughMoney(enoughMoney)

    if (shinedNftTemplate) {
      // Find next shine level from selected NFT asset
      const shineInput = cloneDeep(asset)
      shineInput.multipleMintTypes = null
      shineInput.mints = null
      const currentShine: number = AssetShine[startCase(get(shineInput, 'shine.name')) as string]
      const nextShine = AssetShine[currentShine + 1]

      // Generate NFT asset at next shine level from selected NFT
      const shineOutput = cloneDeep(asset)
      shineOutput.multipleMintTypes = null
      shineOutput.mints = null
      shineOutput.shine.name = toLower(nextShine)

      // Check if copies of the shined NFT are already owned by the user
      const ownedNextShineNFT = find(
        filteredAndSortedAssets,
        (x) =>
          get(x, 'data.name') === get(shineInput, 'title.name') &&
          get(x, 'data.shine') === nextShine
      )

      // Map shined NFT attributes to shineOutput object in order to display the shined preview NFT asset
      set(shineOutput, 'title.name', shinedNftTemplate?.immutable_data?.name)
      set(shineOutput, 'rarity.name', toLower(shinedNftTemplate?.immutable_data?.rarity))
      set(shineOutput, 'ease.name', shinedNftTemplate?.immutable_data?.ease / 10)
      set(shineOutput, 'luck.name', shinedNftTemplate?.immutable_data?.luck / 10)
      set(shineOutput, 'description.name', shinedNftTemplate?.immutable_data?.type)
      set(shineOutput, 'chargeValue.name', shinedNftTemplate?.immutable_data?.delay)
      set(shineOutput, 'difficulty.name', shinedNftTemplate?.immutable_data?.difficulty)
      set(shineOutput, 'attack.name', shinedNftTemplate?.immutable_data?.attack)
      set(shineOutput, 'moveCost.name', shinedNftTemplate?.immutable_data?.movecost)
      set(shineOutput, 'key.name', shinedNftTemplate?.immutable_data?.key)
      set(shineOutput, 'affinity.name', shinedNftTemplate?.immutable_data?.affinity)
      set(shineOutput, 'defense.name', shinedNftTemplate?.immutable_data?.defense)
      set(shineOutput, 'cardcopies.name', ownedNextShineNFT ? ownedNextShineNFT.total_of_type : 0)

      if (shineInput.type.name !== 'Tool') {
        set(shineOutput, 'description.name', shinedNftTemplate?.immutable_data?.description)
      }

      const cardPowers = setCardPowers(shineOutput, {})
      set(shineOutput, 'cardPowers', cardPowers)

      // set shined image for preview NFT
      setShinedImg(shinedNftTemplate.immutable_data.img)

      setShineData({
        inputData: shineInput,
        outputData: shineOutput,
        info: shineInfo,
      })
    }
  }

  const isSelectedForShine = (asset: NFTCardTypes) =>
    selectedForShine.some((x) => x.assetId.name === asset.assetId.name)

  const selectAssetToShine = async (asset: NFTCardTypes) => {
    if (isShining) return

    // Render shined preview of selected NFT card
    if (shineData === null) {
      renderShinedNftPreview(asset)
      return
    }

    // If asset is selected, deselect it
    if (isSelectedForShine(asset)) {
      setSelectedForShine(selectedForShine.filter((x) => x.assetId.name !== asset.assetId.name))
      return
    }

    // Asset is not selected, so select it
    setSelectedForShine([...selectedForShine, asset])
  }

  const clearSelected = () => {
    setShineData(null)
    setSelectedForShine([])
  }

  const shine = async () => {
    setShiningUrl(`/shining/${shineData.outputData.shine.name}_shine.mp4`)

    const ids = selectedForShine.map((x) => x.assetId.name)

    const isSuccess = await tryShine({ itemIds: ids, shineData })
    if (isSuccess) {
      setPrimaryModalActive({ modalName: 'ShiningModal', value: true })
      clearSelected()
    }
  }

  const getShiningHint = () => {
    if (shineData === null) return ''

    if (selectedForShine.length === 0) {
      return `Select ${shineData.info.qty - selectedForShine.length} cards`
    }

    if (shineData.info.qty - selectedForShine.length > 1) {
      return `Select ${shineData.info.qty - selectedForShine.length} more cards`
    }

    if (shineData.info.qty - selectedForShine.length === 1) {
      return `Select ${shineData.info.qty - selectedForShine.length} more card`
    }

    if (!hasEnoughMoney) {
      return `You need ${
        Number(shineData.info.cost.split(' ')[0]) - triliumBalance
      } more Trilium to shine.`
    }

    return `You can shine now!`
  }

  useEffect(() => {
    getAssetsToShow(true)
  }, [filteredAndSortedAssets, shineData])

  useEffect(() => {
    if (visibleAssets && visibleAssets?.length === 0 && !triggerFilterAndSortAssets) {
      showShineMsg(true)
    } else {
      showShineMsg(false)
    }
  }, [filteredAndSortedAssets, visibleAssets])

  useEffect(() => {
    showShiningPage()
    return () => {
      setVisibleAssets([])
    }
  }, [])
  if (loading) return <LoadingSpinner />
  const triliumBalance = toNumber(split(walletDetails.tlm_balance, ' ')[0])
  return (
    <>
      <motion.div>
        <Container
          maxW="100%"
          minH="100vh"
          p={0}
          px={{
            base: '',
            md: '25px',
          }}
        >
          <Flex w="full" minH="100vh" direction="column">
            <Flex
              cursor="pointer"
              alignItems="center"
              gap={0}
              px="24px"
              color={Colors.DI_SERRIA}
              _hover={{ color: Colors.SILVER }}
              onClick={() => navigate(PagePath.Inventory)}
              mb="16px"
            >
              <RightArrowIcon style={{ transform: 'rotate(180deg)' }} boxSize="16px" />
              <Text fontFamily="tlm" fontSize="16px" fontWeight={400}>
                {' '}
                Back to Inventory
              </Text>
            </Flex>
            <Flex px="18px" mb={{ base: 8, sm: 12 }} w="full" maxW="900px">
              <Box w="full" textAlign="start">
                <Flex alignItems="center" gap={2} justifyContent="space-between">
                  <Flex alignItems="center" gap="12px" pb="15px">
                    <Flex
                      bg={Colors.SNOW_WHITE}
                      color={Colors.COD_GRAY}
                      width={{ base: 8, md: 10 }}
                      height={{ base: 8, md: 10 }}
                      borderRadius="full"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <ShiningIcon3 boxSize={24} />
                    </Flex>
                    <Text fontFamily="orb" fontSize="3xl">
                      Shining
                    </Text>
                  </Flex>
                  <Hide above="md">
                    <IconButton
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
                  </Hide>
                  <InventoryFiltersDrawer
                    isOpen={openInventoryFilterDrawer}
                    onClose={() => setOpenInventoryFilterDrawer(false)}
                  />
                </Flex>
                <Text fontFamily="Titillium Web" fontWeight="thin" color={Colors.MID_ALTO}>
                  There are 5 different shine levels: Stone, Gold, Stardust, Antimatter and
                  XDimension. The first 4 are available through shining of NFTs. The last one,
                  XDimension, was only available from special packs.{' '}
                  <Link
                    href={`${config.SupportAlienUrl}/help-center/articles/game/guides/how-shining-works-in-alien-worlds`}
                    target="_blank"
                    color={Colors.WEB_ORANGE}
                  >
                    Read more.
                  </Link>
                </Text>
              </Box>
            </Flex>

            {shineData && (
              <Flex
                direction={{ base: 'column', xl: 'row' }}
                align="center"
                justify="center"
                mx="auto"
                mb={12}
                bg="whiteAlpha.100"
                p={{ base: 6, xl: 8 }}
                borderRadius={16}
                w="full"
                maxW="900px"
              >
                {/* NFT card to shine */}
                <NFTCard
                  title={shineData.inputData.type.name}
                  rarity={shineData.inputData.rarity.name}
                  shine={shineData.inputData.shine.name}
                  animate
                >
                  <NFTCardTopRightPanel>
                    <NFTCardTopRightPanelRender asset={shineData.inputData} />
                  </NFTCardTopRightPanel>
                  <NFTImage
                    hideInnerRing={shineData.inputData.disableInnerRing}
                    src={shineData.inputData.nftImage.name}
                  />
                  <NFTCardDetailsPanel>
                    <NFTCardDetailPanelRender asset={shineData.inputData} />
                  </NFTCardDetailsPanel>
                  <NFTCardBottomPanel>
                    <NFTCardBottomPanelRender asset={shineData.inputData} />
                  </NFTCardBottomPanel>
                  <NFTOverlayPanel>
                    <NFTCardOverlayRender
                      asset={shineData.inputData}
                      zoom={async () => {
                        const assetZoom: IAsset = await getAssetById(
                          shineData.inputData.assetId.name
                        )
                        const image: string = assetZoom?.data?.img
                        if (image) {
                          setZoomImg(image)
                          setShowZoomModal(true)
                          setOutPostModalsActive(true)
                        }
                      }}
                    />
                  </NFTOverlayPanel>
                </NFTCard>

                {/* shining text */}
                <VStack spacing={4} mx={8} minW="200px" my={8}>
                  <Text fontSize="xl" fontFamily="orb">
                    {formatNumber(shineData.info.cost, 4, 4)} TLM
                  </Text>
                  <Text
                    fontSize="xl"
                    textAlign="center"
                    color={
                      selectedForShine.length < 4
                        ? Colors.SNOW_WHITE
                        : hasEnoughMoney
                        ? Colors.SECONDARY_GREEN
                        : Colors.RADICAL_RED
                    }
                  >
                    {getShiningHint()}
                  </Text>
                </VStack>
                {/* shined preview NFT card */}
                <NFTCard
                  title={shineData.outputData.type.name}
                  rarity={shineData.outputData.rarity.name}
                  shine={shineData.outputData.shine.name}
                  animate
                >
                  <NFTCardTopRightPanel>
                    <NFTCardTopRightPanelRender asset={shineData.outputData} />
                  </NFTCardTopRightPanel>
                  <NFTImage
                    hideInnerRing={shineData.outputData.disableInnerRing}
                    src={shineData.outputData.nftImage.name}
                  />
                  <NFTCardDetailsPanel>
                    <NFTCardDetailPanelRender asset={shineData.outputData} />
                  </NFTCardDetailsPanel>
                  <NFTCardBottomPanel>
                    <NFTCardBottomPanelRender asset={shineData.outputData} />
                  </NFTCardBottomPanel>
                  <NFTOverlayPanel>
                    <NFTCardOverlayRender
                      asset={shineData.outputData}
                      zoom={async () => {
                        setZoomImg(shinedImg)
                        setShowZoomModal(true)
                        setOutPostModalsActive(true)
                      }}
                    />
                  </NFTOverlayPanel>
                </NFTCard>
              </Flex>
            )}

            {shineData && selectedForShine && (
              <Flex
                w="100%"
                alignItems="center"
                justifyContent="center"
                mb={{ base: 2, md: 12 }}
                gap={{ base: 8, md: 20 }}
                direction={{ base: 'column', md: 'row' }}
              >
                <Box width={{ base: '100%', sm: '250px' }}>
                  <Button
                    size="lg"
                    fontSize={18}
                    isFullWidth
                    variant="info"
                    fontWeight={500}
                    onClick={clearSelected}
                  >
                    Clear Selected
                  </Button>
                </Box>
                <Box width={{ base: '100%', sm: '250px' }}>
                  <Button
                    variant={
                      (shineData && shineData.info.qty > selectedForShine.length) ||
                      isShining ||
                      !hasEnoughMoney
                        ? 'tertiary'
                        : 'primary'
                    }
                    disabled={
                      (shineData && shineData.info.qty > selectedForShine.length) ||
                      isShining ||
                      !hasEnoughMoney
                    }
                    cursor={
                      (shineData && shineData.info.qty > selectedForShine.length) ||
                      isShining ||
                      !hasEnoughMoney
                        ? 'not-allowed'
                        : 'pointer'
                    }
                    isFullWidth
                    onClick={() => {
                      if (isDemoUser) {
                        setPrimaryModalActive({ modalName: 'LoginModal', value: true })
                      } else {
                        shine()
                      }
                    }}
                    fontSize={18}
                    size="lg"
                  >
                    Shine
                  </Button>
                </Box>
              </Flex>
            )}

            <Tabs
              variant="soft-rounded"
              colorScheme="gray"
              alignSelf="center"
              justifyContent="center"
              w="full"
            >
              <Hide below="md"> {shineData === null && <AssetsFilterPanel />}</Hide>

              {shineMsg && (
                <Flex flexDirection="column" w="100%" alignItems="center" mt="50px">
                  <ShiningIcon boxSize={40} color={Colors.DARK_YELLOW} />
                  <Text
                    mt="15px"
                    fontSize={16}
                    fontWeight="thin"
                    textAlign="center"
                    color={Colors.MID_ALTO}
                  >
                    To shine NFTs, you need at least 4 duplicates.
                  </Text>
                </Flex>
              )}
              {sortedAssets && (
                <InfiniteScroll
                  next={renderMore}
                  hasMore={hasMore}
                  dataLength={sortedAssets?.length}
                  loader={
                    <Flex w="100%" alignItems="center" justifyContent="center">
                      <Spinner />
                    </Flex>
                  }
                >
                  <Box mt={10}>
                    <Flex flexWrap="wrap" justify="center" sx={{ gap: 25 }}>
                      {map(sortedAssets, (asset, index) => (
                        <Flex key={index} justifyContent="center" direction="column">
                          <Box
                            onClick={() => {
                              if (isSelectedForShine(asset) || selectedForShine.length < 4) {
                                selectAssetToShine(asset)
                              }
                            }}
                            borderRadius={20}
                            borderWidth={isSelectedForShine(asset) ? 4 : 0}
                            borderColor="rgb(14 212 168)"
                            cursor={
                              isSelectedForShine(asset) || selectedForShine.length < 4
                                ? 'pointer'
                                : 'not-allowed'
                            }
                            shadow={
                              isSelectedForShine(asset)
                                ? '-7px 5px 25px -7px rgba(255,255,255,0.75)'
                                : 'none'
                            }
                          >
                            <NFTCard
                              title={asset.type.name}
                              rarity={asset.rarity.name}
                              shine={asset.shine.name}
                              animate
                            >
                              <NFTCardTopRightPanel>
                                <NFTCardTopRightPanelRender asset={asset} />
                              </NFTCardTopRightPanel>
                              <NFTImage
                                hideInnerRing={asset.disableInnerRing}
                                src={asset.nftImage.name}
                              />
                              <NFTCardDetailsPanel>
                                <NFTCardDetailPanelRender asset={asset} />
                              </NFTCardDetailsPanel>
                              <NFTCardBottomPanel>
                                <NFTCardBottomPanelRender asset={asset} />
                              </NFTCardBottomPanel>
                              <NFTPlanetComission
                                disable={asset.type.name !== ASSET_TYPE_LAND}
                                label={get(asset, 'commission.name', '')}
                              />
                            </NFTCard>
                          </Box>

                          {asset.mints && (
                            <Text textAlign="center">
                              {shineData && `Mint #: ${asset.mints.name}`}
                            </Text>
                          )}
                        </Flex>
                      ))}
                    </Flex>
                  </Box>
                </InfiniteScroll>
              )}
            </Tabs>
          </Flex>
        </Container>
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
    </>
  )
}

export { Shining }
