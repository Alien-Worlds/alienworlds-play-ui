import { useEffect } from 'react'

import { useAssetsStore } from 'shared/store/assetsStore'
import { useModalStore } from 'shared/store/modalStore'
import { Constants } from 'shared/util/constants'
import { useActions } from 'store'
import { PagePath } from 'store/main/types'

/**
 * On mount: closes the main drawer, optionally resets the asset filter to the page's default,
 * and records the page visit. Replaces Overmind's main.show*Page actions. The analytics event
 * still goes through Overmind's wax.collectEvent, which is shared app-wide.
 */
export const usePageVisit = (location: PagePath, { presetAssetsFilter = false } = {}) => {
  const {
    wax: { collectEvent },
  } = useActions()

  useEffect(() => {
    useModalStore.getState().toggleMainDrawer(false)
    if (presetAssetsFilter) useAssetsStore.getState().presetAssetsFilter()
    collectEvent({ name: Constants.GA_PAGE_VISIT, fields: { location } })
  }, [])
}
