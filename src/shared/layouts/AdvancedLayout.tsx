import { Box, Flex } from '@chakra-ui/react'
import { GlossaryDrawer } from 'features/glossary/components/GlossaryDrawer/GlossaryDrawer'
import { MissionToClaimSound } from 'features/missions/components/MissionToClaimSound'
import { Outlet } from 'react-router-dom'
import { MainDrawer } from 'shared/components/main-drawer/MainDrawer'
import { MainSidebar } from 'shared/components/main-sidebar/MainSidebar'
import { MiningReadySound } from 'shared/components/topbar/MiningReadySound'
import { TopBar } from 'shared/components/topbar/TopBar'
import { UserDemoBanner } from 'shared/components/topbar/UserDemoBanner'
import { useActivePath } from 'shared/hooks/useRouter'
import DrawersLayout from 'shared/layouts/DrawersLayout'
import MainContainer from 'shared/layouts/MainContainer'
import ModalLayout from 'shared/layouts/ModalLayout'
import { useMainSidebar, useScreenSize } from 'shared/util/hooks'
import { useAppState } from 'store'
import { PagePath } from 'store/main/types'

import { Constants } from '../util/constants'

export const MainSidebarWidth = {
  expanded: '320px',
  compact: '80px',
  compactMobile: '0px',
}

/**
 * Protected layout for authenticated users
 */
const AdvancedLayout = () => {
  const {
    wax: { isLoggedIn },
    main: { glossaryDrawer, isCompactSidebar },
  } = useAppState()
  const { isMobile, isNotDesktop } = useScreenSize()
  const { isExpandedMobileSidebar } = useMainSidebar()
  const isLandRelatedPage = useActivePath([
    PagePath.Land,
    PagePath.LandSubpage,
    PagePath.Inventory,
    PagePath.LandMgtSubpage,
  ])

  return (
    <Box w="full" position="relative" paddingInline={0}>
      <MissionToClaimSound />
      <ModalLayout />
      <MiningReadySound />
      <UserDemoBanner />
      <TopBar />

      <Flex position="relative" w="full" pt={Constants.MAIN_TOPBAR_HEIGHT}>
        {isLoggedIn && (
          <>
            <MainDrawer />
            {!isMobile && (
              <Box
                as="aside"
                flexBasis={
                  isExpandedMobileSidebar || isCompactSidebar
                    ? MainSidebarWidth.compact
                    : MainSidebarWidth.expanded
                }
                flexGrow={0}
                flexShrink={0}
                transition="flex-basis 0.3s ease"
              >
                <MainSidebar />
              </Box>
            )}
          </>
        )}
        <Box
          as="main"
          minH={800}
          position="relative"
          flexGrow="1"
          maxWidth={
            isLoggedIn &&
            `calc(100% - ${
              isExpandedMobileSidebar || isCompactSidebar
                ? isNotDesktop
                  ? MainSidebarWidth.compactMobile
                  : MainSidebarWidth.compact
                : MainSidebarWidth.expanded
            })`
          }
        >
          <MainContainer>
            {isLandRelatedPage && <DrawersLayout />}
            <Outlet />
          </MainContainer>
        </Box>
      </Flex>

      {glossaryDrawer.isOpen && <GlossaryDrawer />}
    </Box>
  )
}

export default AdvancedLayout
