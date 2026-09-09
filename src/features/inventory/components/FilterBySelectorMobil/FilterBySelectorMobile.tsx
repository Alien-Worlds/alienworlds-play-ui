import { useState, VFC, useEffect } from 'react'

import { Dropdown, Option } from '@alien-worlds/uikit'
import { map, filter } from 'lodash'
import { useNavigate } from 'react-router-dom'
import { useAppState, useActions } from 'store'
import { mapToSelectedSortByOption } from 'store/atomic/helpers'
import { AssetSchema, AssetType, SortBy } from 'store/atomic/types'
import { PagePath } from 'store/main/types'

const FilterBySelectorMobile: VFC = () => {
  const {
    atomic: { assetsFilter, filteredAndSortedAssets },
  } = useAppState()

  const {
    atomic: { setAssetsFilter },
  } = useActions()

  const navigate = useNavigate()

  const [, setSelectedItem] = useState<string | null>(null)
  const onSelectAssetSchema = (index: number) => {
    const newAssetSchema = assetsFilter.view.tabOptions[index].assetSchema
    setSelectedItem(newAssetSchema)

    if (newAssetSchema === AssetSchema.LAND && filteredAndSortedAssets) {
      const landNFTs = filter(
        filteredAndSortedAssets,
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

  const [items, setItems] = useState<Option[]>([])

  useEffect(() => {
    if (assetsFilter?.view?.tabOptions.length > 0) {
      const filters = map(assetsFilter.view.tabOptions, (tab, index) => {
        return { value: index.toString(), label: tab.name }
      })
      setItems(filters)
    }
  }, [assetsFilter.view.tabOptions])

  if (!assetsFilter?.view || items.length === 0) return <></>

  return (
    <div className="relative flex min-w-[130px] flex-col">
      <Dropdown
        defaultValue={[items[0]]}
        options={items}
        onChange={(item: Option) => {
          onSelectAssetSchema(Number(item.value))
        }}
        variant="simple"
        size="md"
      />
    </div>
  )
}

export { FilterBySelectorMobile }
