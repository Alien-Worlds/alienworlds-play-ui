import { useEffect } from 'react'

import { useAssetsStore } from 'shared/store/assetsStore'
import { useModalStore } from 'shared/store/modalStore'
import { collectEvent } from 'shared/util/analytics'
import { Constants } from 'shared/util/constants'
import { PagePath } from 'store/main/types'

/**
 * On mount: closes the main drawer, optionally resets the asset filter to the page's default,
 * and records the page visit. Replaces Overmind's main.show*Page actions.
 */
export const usePageVisit = (location: PagePath, { presetAssetsFilter = false } = {}) => {
  useEffect(() => {
    useModalStore.getState().toggleMainDrawer(false)
    if (presetAssetsFilter) useAssetsStore.getState().presetAssetsFilter()
    collectEvent({ name: Constants.GA_PAGE_VISIT, fields: { location } })
  }, [])
}
