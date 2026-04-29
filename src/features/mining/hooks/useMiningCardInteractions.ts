import { useCallback } from 'react'

import { map } from 'lodash'
import { useActions, useAppState } from 'store'

export const useMiningCardInteractions = () => {
  const {
    wax: { setBag },
  } = useActions()

  const {
    atomic: { bagAssets },
  } = useAppState()

  const addToolToBag = useCallback(
    (assetId: string, currentSlotAsset?: any) => {
      const newBag = map(bagAssets, (tool) => tool.asset_id) ?? []

      if (currentSlotAsset) {
        const currentIndex = newBag.indexOf(currentSlotAsset.assetId.name)
        if (currentIndex !== -1) {
          newBag[currentIndex] = assetId
        } else {
          newBag.push(assetId)
        }
      } else {
        newBag.push(assetId)
      }

      setBag(newBag)
    },
    [bagAssets, setBag]
  )

  const removeToolFromBag = useCallback(
    (assetId: string) => {
      const newBag = (bagAssets ?? [])
        .filter((tool) => tool.asset_id !== assetId)
        .map((tool) => tool.asset_id)

      setBag(newBag)
    },
    [bagAssets, setBag]
  )

  const clearBag = useCallback(() => {
    setBag([])
  }, [setBag])

  return {
    addToolToBag,
    removeToolFromBag,
    clearBag,
  }
}
