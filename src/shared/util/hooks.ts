import { useBreakpointValue } from '@chakra-ui/react'
import { isChrome, isEdge, isFirefox, isOpera } from 'react-device-detect'
import { useAppState } from 'store'

export const useScreenSize = () => {
  // >=1536px
  const isLargeScreen = useBreakpointValue({ base: false, '2xl': true })
  // >=1280px
  const isMediumScreen = useBreakpointValue({ base: false, xl: true })
  // >=992px
  const isDesktop = useBreakpointValue({ base: false, lg: true })
  // <992px
  const isNotDesktop = useBreakpointValue({ base: true, lg: false })
  // >=768px && <992px
  const isTablet = useBreakpointValue({ base: false, md: true, lg: false })
  // <768px
  const isMobile = useBreakpointValue({ base: true, md: false })

  return { isLargeScreen, isMediumScreen, isDesktop, isNotDesktop, isTablet, isMobile }
}

export const useSupportedBrowser = () => {
  return isChrome || isFirefox || isEdge || isOpera
}

// TODO: move to a separate hook file and create hooks directory
/**
 * Represents the state of the expanded sidebar on mobile.
 * When the mobile sidebar is expanded, a drawer overlay is displayed over the main layout.
 */
export const useMainSidebar = () => {
  const { isMobile } = useScreenSize()
  const {
    main: { isCompactSidebar },
  } = useAppState()

  const isExpandedMobileSidebar = isMobile && !isCompactSidebar

  return { isExpandedMobileSidebar }
}
