import { VFC } from 'react'

import { ReverseSortingIcon, SortingIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { css, Checkbox, Flex, Tab, TabList, Text, Container, Tabs, Box } from '@chakra-ui/react'
import { GlossaryInfoIcon } from 'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon'
import { TooltipLocations } from 'features/glossary/utils/glossaryConst'
import { matchPath } from 'react-router'
import { useMatch, useNavigate } from 'react-router-dom'
import { router } from 'routes'
import { SortBySelector } from 'shared/components/SortBySelector/SortBySelector'
import { Colors } from 'shared/util/colors'
import { useAppState, useActions } from 'store'
import {
  defaultSortByNameOption,
  defaultSortByRarityOption,
  mapToSelectedSortByOption,
} from 'store/atomic/helpers'
import { AssetSchema, AssetType, SortBy } from 'store/atomic/types'
import { PagePath } from 'store/main/types'

const TabItemStyle = {
  fontFamily: 'Titillium Web',
  color: '#afafaf',
  fontWeight: 'bold',
  letterSpacing: '0.1em',
  borderRadius: 17.5,
  _selected: {
    backgroundColor: 'whiteAlpha.500',
    color: 'white',
  },
  _focus: {
    outline: 0,
  },
}

const TabListStyle = {
  borderWidth: '2px',
  borderColor: 'whiteAlpha.500',
  borderRadius: 20,
}

const AssetsFilterPanel: VFC = () => {
  const isToolsPage = matchPath(PagePath.Tools, router.state.location.pathname)
  const {
    atomic: { assetsFilter, filteredAndSortedAssets },
    wax: { nftsToClaim },
  } = useAppState()

  const {
    atomic: { setAssetsFilter },
    wax: { claimNfts },
  } = useActions()

  const isInventoryPage = useMatch(PagePath.Inventory)

  const navigate = useNavigate()

  const onSelectAssetSchema = (index: number) => {
    const newAssetSchema = assetsFilter.view.tabOptions[index].assetSchema

    if (newAssetSchema === AssetSchema.LAND && filteredAndSortedAssets) {
      const landNFTs = filteredAndSortedAssets.filter(
        (asset) => asset.schema.schema_name === AssetType.LAND
      )

      if (landNFTs.length === 1) {
        navigate(`${PagePath.LandMgt}/${landNFTs[0].asset_id}`)
        return
      }
    }

    // Determine if selected sort by option is still valid -> if not set default
    const newSortBy =
      mapToSelectedSortByOption(newAssetSchema, assetsFilter.sortBy)?.sortBy ?? SortBy.NAME

    setAssetsFilter({
      ...assetsFilter,
      assetSchema: assetsFilter.view.tabOptions[index].assetSchema,
      sortBy: newSortBy,
    })
  }

  const changeGroupByTemplate = (value: boolean) => {
    setAssetsFilter({
      ...assetsFilter,
      groupByTemplate: value,
    })
  }

  const changeReversed = (value: boolean) => {
    setAssetsFilter({
      ...assetsFilter,
      reversed: value,
    })
  }

  if (!assetsFilter?.view) return <></>

  return (
    <Container maxW="container.xl">
      <Flex align="center" justify="center" overflow="visible" gap={2} wrap="wrap">
        <Flex
          justifyContent="center"
          alignItems="center"
          gap={2}
          width={{ base: '100%', md: '60%' }}
          flex="1 1 auto"
        >
          <Tabs
            overflowX="hidden"
            index={assetsFilter.view.selectedTabIndex}
            onChange={onSelectAssetSchema}
          >
            <TabList
              {...TabListStyle}
              css={css({
                scrollbarWidth: 'none',
                '::-webkit-scrollbar': { display: 'none' },
                overflowScrolling: 'touch',
                boxShadow: 'inset 0 -2px 0 rgba(0, 0, 0, 0.1)',
                overflowX: 'scroll',
              })}
            >
              {assetsFilter.view.tabOptions.map((tab, index) => (
                <Tab
                  {...TabItemStyle}
                  onClick={() => {
                    onSelectAssetSchema(index)
                  }}
                  key={index}
                >
                  {tab.name}
                </Tab>
              ))}
            </TabList>
          </Tabs>

          <GlossaryInfoIcon
            width={23}
            height={23}
            glossaryId={TooltipLocations.INVENTORY_TABS}
            mr={3}
          />
        </Flex>

        {isInventoryPage &&
          assetsFilter?.view?.tabOptions[assetsFilter?.view?.selectedTabIndex]?.name !== 'Land' && (
            <Checkbox
              isChecked={assetsFilter.groupByTemplate}
              onChange={() => changeGroupByTemplate(!assetsFilter.groupByTemplate)}
              fontFamily="Titillium Web"
              letterSpacing="0.1em"
              flex={0}
            >
              Group
            </Checkbox>
          )}

        <Flex align="center" justifyContent="center" gap={5} wrap="wrap">
          {nftsToClaim > 0 && (
            <Box>
              <Button
                variant="success"
                size="sm"
                onClick={() => {
                  claimNfts()
                }}
              >
                Claim NFTs
              </Button>
            </Box>
          )}

          <Flex
            alignItems="center"
            position="relative"
            zIndex={1000}
            overflowY="visible"
            flexWrap="wrap"
            justifyContent="space-around"
            rowGap={4}
            ml="10px"
          >
            <Text
              mr={2}
              fontFamily="tlm"
              letterSpacing="0.1em"
              color={Colors.SNOW_WHITE}
              whiteSpace="nowrap"
            >
              Sort by
            </Text>

            <SortBySelector
              defaultValue={isToolsPage ? defaultSortByRarityOption : defaultSortByNameOption}
            />
            <Button
              variant="dark"
              size="sm"
              color="white"
              onClick={() => changeReversed(!assetsFilter.reversed)}
              rightIcon={
                assetsFilter.reversed ? (
                  <ReverseSortingIcon boxSize={24} />
                ) : (
                  <SortingIcon boxSize={24} />
                )
              }
              fontFamily="Titillium Web"
            >
              {assetsFilter.reversed ? 'Z-A' : 'A-Z'}
            </Button>
          </Flex>
        </Flex>
      </Flex>
    </Container>
  )
}

export { AssetsFilterPanel }
