import { useEffect } from 'react'

import { useMissionsStore } from 'features/missions/store/missionsStore'
import { useLocation } from 'react-router-dom'
import { useModalStore } from 'shared/store/modalStore'

/**
 * Keeps the missions data loaded and its timers current: syncs every second, and straight away
 * when the page changes or the main drawer opens or closes. Rendered once, by MainLayout.
 * Replaces the missions part of Overmind's main.updateWorld tick.
 */
export const MissionsSync = () => {
  const { pathname } = useLocation()
  const isMainDrawerOpen = useModalStore((state) => state.isMainDrawerOpen)

  useEffect(() => {
    const sync = () => useMissionsStore.getState().sync(pathname)
    sync()
    const timer = setInterval(sync, 1000)
    return () => clearInterval(timer)
  }, [pathname, isMainDrawerOpen])

  return null
}
