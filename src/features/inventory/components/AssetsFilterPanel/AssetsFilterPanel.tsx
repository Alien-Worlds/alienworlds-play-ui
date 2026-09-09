import { VFC } from 'react'

import { ReverseSortingIcon, SortingIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Checkbox, Tab, TabGroup, TabList } from '@headlessui/react'
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

const AssetsFilterPanel: VFC = () => {
  const isToolsPage = matchPath(PagePath.Tools, router.state.location.pathname)
  const {
    atomic: { assetsFilter, filteredAndSortedAssets },
  } = useAppState()

  const {
    atomic: { setAssetsFilter },
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
    <div className="mx-auto max-w-screen-xl">
      <div className="flex flex-wrap items-center justify-center gap-2 overflow-visible">
        <div className="flex w-full flex-[1_1_auto] items-center justify-center gap-2 md:w-3/5">
          <TabGroup
            selectedIndex={assetsFilter.view.selectedTabIndex}
            onChange={onSelectAssetSchema}
          >
            <TabList
              className="flex items-center overflow-x-scroll rounded-[20px] border-2 border-white/50 shadow-[inset_0_-2px_0_rgba(0,0,0,0.1)] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              style={{ overscrollBehavior: 'contain' }}
            >
              {assetsFilter.view.tabOptions.map((tab, index) => (
                <Tab
                  key={index}
                  onClick={() => onSelectAssetSchema(index)}
                  className={({ selected }) =>
                    `whitespace-nowrap rounded-[17.5px] px-4 py-2 font-tlm text-sm font-bold tracking-[0.1em] outline-none ${
                      selected ? 'bg-white/50 text-white' : 'text-[#afafaf]'
                    }`
                  }
                >
                  {tab.name}
                </Tab>
              ))}
            </TabList>
          </TabGroup>

          <GlossaryInfoIcon
            width={23}
            height={23}
            glossaryId={TooltipLocations.INVENTORY_TABS}
            mr={3}
          />
        </div>

        {isInventoryPage &&
          assetsFilter?.view?.tabOptions[assetsFilter?.view?.selectedTabIndex]?.name !== 'Land' && (
            <label className="flex shrink-0 cursor-pointer items-center gap-2 font-tlm tracking-[0.1em]">
              <Checkbox
                checked={assetsFilter.groupByTemplate}
                onChange={changeGroupByTemplate}
                className="flex size-5 items-center justify-center rounded border-2 border-white/50 text-white data-[checked]:bg-white/50"
              >
                {assetsFilter.groupByTemplate && '✓'}
              </Checkbox>
              Group
            </label>
          )}

        <div className="flex flex-wrap items-center justify-center gap-5">
          <div className="relative z-[1000] ml-[10px] flex flex-wrap items-center justify-around gap-y-4 overflow-y-visible">
            <p
              className="mr-2 whitespace-nowrap font-tlm tracking-[0.1em]"
              style={{ color: Colors.SNOW_WHITE }}
            >
              Sort by
            </p>

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
          </div>
        </div>
      </div>
    </div>
  )
}

export { AssetsFilterPanel }
