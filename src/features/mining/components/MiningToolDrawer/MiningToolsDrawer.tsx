import { useEffect, useState, useMemo } from 'react'

import { CanceledIcon, ReverseSortingIcon, SortingIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import {
  Box,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Stack,
  Text,
  HStack,
  useBreakpointValue,
} from '@chakra-ui/react'
import { NFTCardSingleCardPrep, NFTCardTypes } from 'features/inventory/utils/NFTCardHelper'
import { FilterByToolTypeSelector } from 'features/mining/components/FilterByToolTypeSelector'
import { MiningNFTCard } from 'features/mining/components/MiningNFTCard/MiningNFTCard'
import { useFilteredMiningAssets } from 'features/mining/hooks/useFilteredMiningAssets'
import { useMiningUtils } from 'features/mining/hooks/useMiningUtils'
import { ASSET_TYPE_LAND } from 'features/mining/utils/constants'
import { map, filter } from 'lodash'
import ScrollContainer from 'react-indiana-drag-scroll'
import { matchPath } from 'react-router'
import { router } from 'routes'
import { SortBySelector } from 'shared/components/SortBySelector/SortBySelector'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'
import { defaultSortByNameOption, defaultSortByRarityOption } from 'store/atomic/helpers'
import { PagePath } from 'store/main/types'

export const MiningToolsDrawer = () => {
  const isToolsPage = matchPath(PagePath.Tools, router.state.location.pathname)
  const {
    wax: { setBag },
    atomic: { setAssetsFilter },
    main: {
      mining: { closeMiningToolsDrawer },
    },
  } = useActions()
  const {
    wax: { walletId },
    main: { miningToolsDrawer },
    atomic: { bagAssets, assetsFilter },
  } = useAppState()

  const [currentBagAsset, setCurrentBagAsset] = useState<NFTCardTypes>()
  const { assets: currentAssets } = useFilteredMiningAssets({ currentBagAsset })
  const { isAssetEquipped } = useMiningUtils()

  const isEquippedAsset = (assetId: string) => currentBagAsset?.assetId?.name === assetId

  // Filter out assets that are already equipped in any slot (but keep the current asset)
  const filteredAssets = useMemo(() => {
    if (!currentAssets) return []
    return filter(currentAssets, (asset) => {
      const assetId = asset.assetId.name
      const currentAssetId = currentBagAsset?.assetId?.name

      // Always show the current asset (the one in the current slot)
      if (assetId === currentAssetId) {
        return true
      }

      // Filter out assets that are equipped in any slot
      if (isAssetEquipped(assetId)) {
        return false
      }

      return true
    })
  }, [currentAssets, currentBagAsset, isAssetEquipped])

  const addToolToBag = (assetId: string) => {
    const newBag = map(bagAssets, (tool) => tool.asset_id) ?? []

    if (currentBagAsset) {
      newBag[newBag.indexOf(currentBagAsset.assetId.name)] = assetId
    } else {
      newBag.push(assetId)
    }

    setBag(newBag)
  }

  const removeToolFromBag = () => {
    const newBag = (bagAssets ?? [])
      .filter((tool) => tool.asset_id !== currentBagAsset.assetId.name)
      .map((tool) => tool.asset_id)

    setBag(newBag)
  }

  const changeReversed = (value: boolean) => {
    setAssetsFilter({
      ...assetsFilter,
      reversed: value,
    })
  }

  useEffect(() => {
    const currentAsset = bagAssets ? bagAssets[miningToolsDrawer.activeSlotIndex] : undefined

    if (currentAsset) {
      setCurrentBagAsset(NFTCardSingleCardPrep(currentAsset, walletId))
    } else {
      setCurrentBagAsset(undefined)
    }
  }, [bagAssets, miningToolsDrawer])
  const responsiveButtonWidth = useBreakpointValue({ base: '100%', sm: 'fit-content' })
  const marginLeftButton = useBreakpointValue({ base: 'auto', sm: '10px' })
  return (
    <Drawer
      size="lg"
      placement="right"
      variant="miningTools"
      preserveScrollBarGap
      onClose={closeMiningToolsDrawer}
      isOpen={miningToolsDrawer.isOpen}
    >
      <DrawerOverlay />
      <DrawerContent
        sx={{
          borderRadius: 3.5,
          background: Colors.BLACK_SOLID_100,
        }}
      >
        <DrawerBody
          sx={{
            overflowY: 'scroll',
            scrollbarWidth: 'none',
            overflowScrolling: 'touch',
            '::-webkit-scrollbar': { display: 'none' },
          }}
          px={{ base: 2, sm: 7 }}
          pt={{ base: 0, sm: '50px' }}
        >
          <Flex justifyContent="end">
            <DrawerCloseButton fontSize="lg" right="20px" top="20px" position="absolute" />
          </Flex>
          <Stack
            justifyContent="space-between"
            px={{ base: '20px', sm: '0px' }}
            mt={{ base: '10px', sm: '0px' }}
            gap={{ base: '0px', sm: '0px' }}
            h={{ base: currentBagAsset && '120px', sm: '60px' }}
            alignItems={{ base: 'start', sm: 'center' }}
            flexDirection={{ base: 'column', sm: 'row' }}
          >
            <Text fontFamily="orb" fontWeight={400} fontSize={30} pt={{ base: '20px', sm: '0' }}>
              Tool Slot #{miningToolsDrawer.activeSlotIndex + 1}
            </Text>
            {currentBagAsset && (
              <Button
                size="sm"
                fontSize={14}
                variant="alert"
                alignItems="center"
                onClick={removeToolFromBag}
                leftIcon={<CanceledIcon boxSize={24} />}
                display="flex"
                width={responsiveButtonWidth}
              >
                Remove Tool
              </Button>
            )}
          </Stack>

          <Flex
            alignItems="start"
            mt={{ base: 3, sm: 5 }}
            gap={{ base: 1, sm: 0 }}
            px={{ base: '20px', sm: '0' }}
            justifyContent="space-between"
            h={{ base: '120px', sm: '60px' }}
            flexDirection={{ base: 'column', sm: 'row' }}
          >
            <HStack
              w="100%"
              zIndex={1001}
              position="relative"
              py={{ base: '15px', sm: '0' }}
              alignItems={{ base: 'center', sm: 'center' }}
              justifyContent={{ base: 'start', sm: 'start' }}
            >
              <Text
                pr="10px"
                fontFamily="tlm"
                whiteSpace="nowrap"
                letterSpacing="0.1em"
                color={Colors.SNOW_WHITE}
              >
                Sort by
              </Text>

              <Flex w="50%">
                <SortBySelector
                  defaultValue={isToolsPage ? defaultSortByRarityOption : defaultSortByNameOption}
                  width="100%"
                />
              </Flex>
              <Button
                padding={0}
                size="sm"
                variant="dark"
                fontFamily="Titillium Web"
                maxWidth="107px!important"
                minWidth="107px!important"
                marginLeft={marginLeftButton}
                color={assetsFilter.reversed ? Colors.DI_SERRIA : Colors.SNOW_WHITE}
                rightIcon={
                  assetsFilter.reversed ? (
                    <ReverseSortingIcon boxSize={24} color={Colors.DI_SERRIA} />
                  ) : (
                    <SortingIcon boxSize={24} />
                  )
                }
                onClick={() => changeReversed(!assetsFilter.reversed)}
              >
                {assetsFilter.reversed ? 'Z-A' : 'A-Z'}
              </Button>
            </HStack>

            <Flex
              rowGap={2}
              zIndex={1000}
              flexWrap="wrap"
              position="relative"
              overflowY="visible"
              alignItems="center"
              w={{ base: '100%', sm: '75%' }}
              justifyContent={{ base: 'start', sm: 'space-around' }}
            >
              <FilterByToolTypeSelector />
            </Flex>
          </Flex>

          <Flex
            overflowY="auto"
            direction="column"
            textAlign="center"
            pb={{ base: '0px', sm: '20px' }}
            pt={{ base: '20px', sm: '20px' }}
            h={{
              base: currentBagAsset ? 'calc(100vh - 280px)' : 'calc(100vh - 230px)',
              sm: 'calc(100vh - 200px)',
            }}
          >
            <ScrollContainer hideScrollbars={false} className="scroll-container">
              <Flex flexWrap="wrap" gridGap={6} justifyContent="center">
                {map(filteredAssets, (asset, index) => (
                  <Flex
                    key={asset.assetId.name + index}
                    justifyContent="center"
                    direction="column"
                    cursor="pointer"
                  >
                    <Box
                      borderRadius={20}
                      cursor={isEquippedAsset(asset.assetId.name) ? 'not-allowed' : 'pointer'}
                      borderWidth={isEquippedAsset(asset.assetId.name) ? 4 : 0}
                      borderColor={
                        isEquippedAsset(asset.assetId.name) ? Colors.CARIBBEAN_GREEN : 'none'
                      }
                      shadow={
                        isEquippedAsset(asset.assetId.name)
                          ? `-7px 5px 25px -7px ${Colors.CARIBBEAN_GREEN}`
                          : 'none'
                      }
                      onClick={() => {
                        if (!isEquippedAsset(asset.assetId.name)) addToolToBag(asset.assetId.name)
                      }}
                    >
                      <MiningNFTCard
                        asset={asset}
                        showInUseButton
                        inUseDisabled={!isEquippedAsset(asset.assetId.name)}
                        showOverlay
                        commissionDisabled={asset.type.name !== ASSET_TYPE_LAND}
                      />
                    </Box>
                  </Flex>
                ))}
              </Flex>
            </ScrollContainer>
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
