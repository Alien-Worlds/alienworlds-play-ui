import { VFC } from 'react'

import {
  Box,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerOverlay,
  Flex,
  useBreakpointValue,
  Text,
} from '@chakra-ui/react'
import { MiningDesktopView } from 'features/mining/components/MiningDesktopView'
import { MissionsView } from 'features/missions/components/MissionsView'
import { ProfileProvider } from 'features/profile'
import { SyndicateView } from 'features/syndicates/components/SyndicateView/SyndicateView'
import { motion } from 'framer-motion'
import { Header } from 'shared/components/main-drawer/Header'
import { LandownerView } from 'shared/components/main-drawer/LandownerView'
import { LogoutButton } from 'shared/components/main-drawer/LogoutButton'
import { Menu } from 'shared/components/main-drawer/Menu'
import { SocialCards } from 'shared/components/main-drawer/SocialCards'
import { pageTransition } from 'shared/util/animations'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'
import { useScreenSize } from 'shared/util/hooks'
import { useActions, useAppState } from 'store'

import { Constants } from '../../util/constants'

export const MainDrawer: VFC = () => {
  const {
    main: { toggleMainDrawer },
  } = useActions()
  const {
    main: { isMainDrawerOpen },
    wax: { isDemoUser, selectedDrawerView },
  } = useAppState()

  const { isMobile } = useScreenSize()
  const currentYear = new Date().getFullYear()
  const drawerTopMargin = useBreakpointValue({
    base: isDemoUser
      ? Constants.MAIN_TOPBAR_HEIGHT + Constants.DEMO_TOPBAR_HEIGHT_MOBILE
      : Constants.MAIN_TOPBAR_HEIGHT,
    sm: isDemoUser
      ? Constants.MAIN_TOPBAR_HEIGHT + Constants.DEMO_TOPBAR_HEIGHT
      : Constants.MAIN_TOPBAR_HEIGHT,
    md: isDemoUser
      ? Constants.MAIN_TOPBAR_HEIGHT + Constants.DEMO_TOPBAR_HEIGHT
      : Constants.MAIN_TOPBAR_HEIGHT,
    lg: isDemoUser
      ? Constants.MAIN_TOPBAR_HEIGHT + Constants.DEMO_TOPBAR_HEIGHT
      : Constants.MAIN_TOPBAR_HEIGHT,
    xl: isDemoUser
      ? Constants.MAIN_TOPBAR_HEIGHT + Constants.DEMO_TOPBAR_HEIGHT
      : Constants.MAIN_TOPBAR_HEIGHT,
    '2xl': isDemoUser
      ? Constants.MAIN_TOPBAR_HEIGHT + Constants.DEMO_TOPBAR_HEIGHT
      : Constants.MAIN_TOPBAR_HEIGHT,
  })

  return (
    <Drawer
      placement="top"
      trapFocus={false}
      variant="persistent"
      isOpen={isMainDrawerOpen}
      blockScrollOnMount={isMobile}
      onClose={() => toggleMainDrawer()}
    >
      {/* DRAWER OVERLAY */}
      <DrawerOverlay
        onClick={() => toggleMainDrawer()}
        sx={{ backgroundColor: Colors.TRANSPARENT }}
      >
        <motion.div
          {...pageTransition}
          style={{ height: Constants.MAIN_DRAWER_HEIGHT, width: '100%' }}
        >
          <Box
            w="100%"
            top="150px"
            opacity={0.7}
            position="absolute"
            bg={Colors.MAIN_DRAWER_BG_SHADOW}
            height={Constants.MAIN_DRAWER_HEIGHT}
          />
        </motion.div>
      </DrawerOverlay>
      <DrawerContent
        style={{
          top: drawerTopMargin,
          background: isMobile ? Colors.COD_GRAY : Colors.TRANSPARENT,
          height: !isMobile ? Constants.MAIN_DRAWER_HEIGHT : isDemoUser ? '950px' : '100%',
        }}
      >
        <DrawerBody
          sx={{
            padding: 0,
            height: isDemoUser ? '950px' : '100%',
            scrollbarWidth: 'none',
            overflowScrolling: 'touch',
            '::-webkit-scrollbar': { display: 'none' },
            overflowY: 'auto',
            borderRadius: isMobile ? '0px' : '0px 0px 35px 35px',
            border: isMobile ? 'none' : `1px solid ${Colors.SCORPION}`,
          }}
        >
          <ProfileProvider>
            <motion.div
              {...pageTransition}
              style={{ width: '100%', height: isDemoUser ? '100%' : '100%' }}
            >
              {isMobile && (
                <Box w="100%" overflowY="auto" height={`calc(100% - ${drawerTopMargin}px)`}>
                  <Header />
                  <Menu />
                  <SocialCards />
                  <LogoutButton />
                  <Flex justifyContent="space-between" px="18px" py="18px">
                    <Text color={Colors.SILVER} fontSize="12px" fontFamily="tlm">
                      © Dacoco GmbH {currentYear}
                    </Text>
                    <Text
                      color={Colors.DI_SERRIA}
                      fontFamily="orb"
                      fontSize="12px"
                      fontWeight={700}
                    >
                      v {config.AppVersion}
                    </Text>
                  </Flex>
                </Box>
              )}
              {selectedDrawerView === 0 && <MiningDesktopView />}
              {selectedDrawerView === 1 && <SyndicateView />}
              {selectedDrawerView === 3 && <MissionsView />}
              {selectedDrawerView === 2 && <LandownerView />}
            </motion.div>
          </ProfileProvider>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
