import { useEffect } from 'react'

import {
  Flex,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  useBreakpointValue,
} from '@chakra-ui/react'
import { LogoutOrWallets } from 'shared/components/main-sidebar/LogoutOrWallets'
import { SupportButton } from 'shared/components/main-sidebar/SupportButton'
import { WalletsManager } from 'shared/components/main-sidebar/WalletsManager'
import { Colors } from 'shared/util/colors'
import { useScreenSize, useMainSidebar } from 'shared/util/hooks'
import { useActions, useAppState } from 'store'

import { Footer } from './Footer'
import { PageList } from './PageList'
import { WaxResources } from './WaxResources'
import { Constants } from '../../util/constants'

const MainSidebar = () => {
  const {
    wax: { isDemoUser },
    main: { isCompactSidebar },
  } = useAppState()

  const {
    main: { toggleCompactSidebar },
  } = useActions()

  const { isDesktop } = useScreenSize()
  const { isExpandedMobileSidebar } = useMainSidebar()

  useEffect(() => {
    toggleCompactSidebar(!isDesktop)
  }, [isDesktop])

  const sidebarTopMargin = useBreakpointValue({
    base: isDemoUser ? Constants.MAIN_TOPBAR_HEIGHT + Constants.DEMO_TOPBAR_HEIGHT_MOBILE + 10 : 93,
    sm: isDemoUser ? Constants.MAIN_TOPBAR_HEIGHT + 75 : 93,
    md: isDemoUser ? Constants.MAIN_TOPBAR_HEIGHT + 75 : 93,
    lg: isDemoUser ? Constants.MAIN_TOPBAR_HEIGHT + 75 : 93,
    xl: isDemoUser ? Constants.MAIN_TOPBAR_HEIGHT + 75 : 93,
    '2xl': isDemoUser ? Constants.MAIN_TOPBAR_HEIGHT + 75 : 93,
  })

  const sidebarHeight = useBreakpointValue({
    base: isDemoUser ? 'calc(100vh - 300px)' : 'calc(100vh - 100px)',
    sm: isDemoUser ? 'calc(100vh - 150px)' : 'calc(100vh - 100px)',
    md: isDemoUser ? 'calc(100vh - 150px)' : 'calc(100vh - 100px)',
    lg: isDemoUser ? 'calc(100vh - 150px)' : 'calc(100vh - 100px)',
    xl: isDemoUser ? 'calc(100vh - 150px)' : 'calc(100vh - 100px)',
    '2xl': isDemoUser ? 'calc(100vh - 150px)' : 'calc(100vh - 100px)',
  })

  return (
    <Drawer
      placement="left"
      trapFocus={false}
      variant={isExpandedMobileSidebar ? null : 'persistent'}
      blockScrollOnMount={false}
      onClose={() => toggleCompactSidebar(true)}
      isOpen
      size={isCompactSidebar ? 'xs' : 'md'}
    >
      <DrawerOverlay display={isExpandedMobileSidebar ? 'block' : 'none'} />
      <DrawerContent
        style={{
          paddingTop: 5,
          paddingBottom: 20,
          top: sidebarTopMargin,
          height: sidebarHeight,
          background: Colors.COD_GRAY,
          borderRadius: isCompactSidebar ? 0 : '0px 35px 35px 0px',
        }}
      >
        <DrawerBody
          sx={{
            scrollbarWidth: 'none',
            overflowY: 'scroll',
            '::-webkit-scrollbar': { display: 'none' },
            overflowScrolling: 'touch',
            padding: isCompactSidebar ? 0 : 10,
            paddingTop: isCompactSidebar ? 2 : 0,
          }}
        >
          <Flex flexDirection="column" gap={8}>
            <PageList />
            <WaxResources />
            <SupportButton />
            {isDemoUser ? <WalletsManager /> : <LogoutOrWallets />}
            <Footer />
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export { MainSidebar }
