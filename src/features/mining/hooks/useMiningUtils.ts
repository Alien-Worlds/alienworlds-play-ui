import { useMemo } from 'react'

import { NFTCardTypes } from 'features/inventory/utils/NFTCardHelper'
import { useAppState } from 'store'

export const useMiningUtils = () => {
  const {
    wax: { walletId },
    atomic: { bagAssets },
  } = useAppState()

  const isAssetEquipped = useMemo(() => {
    return (assetId: string) => {
      if (!bagAssets) return false
      return bagAssets.some((asset) => asset.asset_id === assetId)
    }
  }, [bagAssets])

  const getEquippedAssetCount = useMemo(() => {
    return () => bagAssets?.length || 0
  }, [bagAssets])

  const canEquipAsset = useMemo(() => {
    return (asset: NFTCardTypes, currentSlotAsset?: NFTCardTypes) => {
      const assetId = asset?.assetId?.name

      // If this asset is already equipped in the current slot, allow it
      if (currentSlotAsset?.assetId?.name === assetId) return true

      // Check if asset is equipped in other slots
      const isEquipped = isAssetEquipped(assetId)
      return !isEquipped
    }
  }, [isAssetEquipped])

  const getBagSlotAsset = useMemo(() => {
    return (slotIndex: number) => {
      return bagAssets?.[slotIndex]
    }
  }, [bagAssets])

  return {
    isAssetEquipped,
    getEquippedAssetCount,
    canEquipAsset,
    getBagSlotAsset,
    walletId,
  }
}
