import { useEffect, useMemo, useState } from 'react'

import { NFTCardDataPreparation, NFTCardTypes } from 'features/inventory/utils/NFTCardHelper'
import { filter, isNull } from 'lodash'
import { useAppState } from 'store'
import { ToolType } from 'store/atomic/types'

import { useMiningUtils } from './useMiningUtils'

interface UseFilteredMiningAssetsArgs {
  currentBagAsset?: NFTCardTypes
}

export function useFilteredMiningAssets({ currentBagAsset }: UseFilteredMiningAssetsArgs) {
  const {
    atomic: { filteredAndSortedAssets, filterByToolType },
  } = useAppState()

  const { canEquipAsset } = useMiningUtils()
  const [assets, setAssets] = useState<NFTCardTypes[]>([])

  useEffect(() => {
    let list = filteredAndSortedAssets
    if (list && list.length) {
      // Remove already equipped assets in other slots
      list = filter(list, (a: any) => canEquipAsset(a, currentBagAsset))

      if (!isNull(filterByToolType?.selectedFilterByOption?.filterBy)) {
        if (filterByToolType?.selectedFilterByOption?.filterBy !== ToolType.ALL) {
          list = filter(
            list,
            (x: any) =>
              x?.template?.immutable_data?.type === filterByToolType?.selectedFilterByOption?.name
          )
        }
      }
    }
    setAssets(NFTCardDataPreparation(list))
  }, [filteredAndSortedAssets, filterByToolType, currentBagAsset, canEquipAsset])

  return useMemo(() => ({ assets }), [assets])
}
