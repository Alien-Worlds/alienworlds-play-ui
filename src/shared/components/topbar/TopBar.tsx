import { useEffect, useState } from 'react'

import { AlienWorldsIcon, CrossIcon, MainMenuIcon2 } from '@alien-worlds/icons'
import { Box, Flex, IconButton, HStack, Spacer, Text, VStack, Image } from '@chakra-ui/react'
import { map } from 'lodash'
import { useLocation } from 'react-router-dom'
import { BalanceTlmTop } from 'shared/components/topbar/BalanceTlmTop'
import { BalanceUserPointsTop } from 'shared/components/topbar/BalanceUserPointsTop'
import { MiningCounter } from 'shared/components/topbar/MiningCounter'
import { PlayerAvatar } from 'shared/components/topbar/PlayerAvatar'
import { Tag } from 'shared/components/topbar/Tag'
import { theme } from 'shared/styles/theme'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'
import { getDrawerTabs, getTopbarLogo } from 'shared/util/helpers'
import { useScreenSize } from 'shared/util/hooks'
import { MainDrawerTabIcon } from 'shared/util/icons'
import { isSyndicatesRelatedPage } from 'shared/util/router'
import { useActions, useAppState } from 'store'

import { Constants } from '../../util/constants'

const MenuToggler = ({ controls, tabs }) => {
  const {
    wax: { selectedDrawerView },
  } = useAppState()
  const {
    wax: { setSelectedDrawerView },
  } = useActions()

  return (
    <IconButton
      mr={2}
      bg="transparent"
      aria-label="Menu"
      fill={Colors.SNOW_WHITE}
      icon={
        <Box boxSize="40px">
          <MainMenuIcon2 boxSize="40px" color={Colors.SNOW_WHITE} />
        </Box>
      }
      onClick={() => {
        if (!selectedDrawerView) {
          setSelectedDrawerView(tabs[0]?.index)
        }
        controls()
      }}
      _focus={{
        border: 0,
      }}
      _hover={{
        bg: Colors.TRANSPARENT,
        fill: Colors.SNOW_WHITE,
      }}
      _active={{
        bg: Colors.TRANSPARENT,
      }}
      css={{
        WebkitTapHighlightColor: Colors.TRANSPARENT,
      }}
    >
      Menu
    </IconButton>
  )
}

const TopBar = () => {
  const {
    main: { toggleMainDrawer, toggleCompactSidebar },
    wax: { setIsSyndicatesSidebarOpen, setSelectedDrawerView },
  } = useActions()
  const {
    wax: {
      walletId,
      isLoggedIn,
      isDemoUser,

      isAuthenticating,
      selectedDrawerView,
      isSyndicatesSidebarOpen,
    },
    main: {
      currentWallet,
      glossaryDrawer,
      isMainDrawerOpen,
      miningToolsDrawer,
      planetDetailsDrawer,
      isOutPostModalsActive,
      syndicatesProposalDrawer,
      isLandOwnerAddSlotDrawerOpen,
    },
    modal: { isModalActive },
    atomic: { ownedLandsAssets },
  } = useAppState()
  const [walletLogo, setWalletLogo] = useState(null)
  const { pathname } = useLocation()
  const [drawerTabs, setDrawerTabs] = useState([])
  const [isSyndicatesPage, setIsSyndicatesPage] = useState(false)
  const { isNotDesktop, isMobile, isLargeScreen } = useScreenSize()

  useEffect(() => {
    const visibleDrawerTabs = getDrawerTabs(ownedLandsAssets)

    setDrawerTabs(visibleDrawerTabs)
  }, [ownedLandsAssets])

  useEffect(() => {
    const logo = getTopbarLogo(currentWallet)

    setWalletLogo(logo)
  }, [currentWallet])

  useEffect(() => {
    setIsSyndicatesPage(isSyndicatesRelatedPage(pathname))
  }, [pathname])

  const demoTopbarHeight = `${Constants.DEMO_TOPBAR_HEIGHT.toString()}px`
  const demoTopbarHeightMobile = `${Constants.DEMO_TOPBAR_HEIGHT_MOBILE.toString()}px`

  return (
    <Flex
      top={{ base: isDemoUser ? demoTopbarHeightMobile : 0, lg: isDemoUser ? demoTopbarHeight : 0 }}
      w="full"
      position="fixed"
      bg={Colors.COD_GRAY}
      h={Constants.MAIN_TOPBAR_HEIGHT}
      borderRadius={!isMainDrawerOpen ? '0px 0px 24px 24px' : 0}
      zIndex={
        isModalActive ||
        isOutPostModalsActive ||
        glossaryDrawer.isOpen ||
        miningToolsDrawer.isOpen ||
        planetDetailsDrawer.isOpen ||
        syndicatesProposalDrawer.isOpen ||
        isLandOwnerAddSlotDrawerOpen
          ? theme.zIndices.topbarUnderModal
          : theme.zIndices.topbar
      }
    >
      <Flex
        w="full"
        alignItems="center"
        position="relative"
        justifyContent="start"
        px={{ base: 5 }}
        h={Constants.MAIN_TOPBAR_HEIGHT}
      >
        <Flex alignItems="center">
          {isLoggedIn && (
            <>
              {isMainDrawerOpen && isMobile && (
                <Box
                  w="63px"
                  h="40px"
                  display="flex"
                  cursor="pointer"
                  justifyContent="center"
                  borderColor={Colors.BLACK_SOLID_90}
                >
                  <CrossIcon width="40px" height="40px" onClick={() => toggleMainDrawer()} />
                </Box>
              )}

              {!isMobile && (
                <Flex pl="15px">
                  <MenuToggler controls={toggleCompactSidebar} tabs={drawerTabs} />
                </Flex>
              )}
              {isMobile && !isMainDrawerOpen && (
                <Flex pl="15px">
                  <MenuToggler controls={toggleMainDrawer} tabs={drawerTabs} />
                </Flex>
              )}

              {!isMobile && (
                <HStack ml={2}>
                  {!isMobile && (
                    <Box>
                      <PlayerAvatar showBadge />
                    </Box>
                  )}
                  <VStack alignItems="start" pl="0px" pb="10px">
                    <Tag />
                    <Text
                      fontSize="14px"
                      fontFamily="tlm"
                      lineHeight={0.3}
                      color={Colors.DI_SERRIA}
                    >
                      {isDemoUser ? Constants.DEMO_ACCOUNT_TAG : walletId}
                    </Text>
                  </VStack>
                </HStack>
              )}
            </>
          )}
        </Flex>

        {isLoggedIn && !isAuthenticating && isLargeScreen && (
          <Flex width="full" flexShrink={1} gap={1} ml="50px">
            <BalanceUserPointsTop />
            <BalanceTlmTop />
          </Flex>
        )}

        {!isDemoUser && (
          <Flex display="none">
            <Image src={walletLogo} width="75px" ml="-40px" />
          </Flex>
        )}

        <Flex
          justifyContent="center"
          mr={isMobile ? '0px' : '50px'}
          ml={isNotDesktop ? '0px' : 'auto'}
          w={isLargeScreen ? '300px' : '100%'}
        >
          <MiningCounter height="40px" width={isMobile ? '120px' : '172px'} />
        </Flex>

        <Spacer />

        {/* DRAWER TABS */}
        {isLoggedIn && !isAuthenticating && !isNotDesktop && (
          <Flex h="100%" mt="30px" flexDirection="column" mr="15px">
            <HStack>
              {map(drawerTabs, (tab) => (
                <VStack
                  key={tab.index}
                  cursor="pointer"
                  paddingInline="7px"
                  css={{
                    WebkitTapHighlightColor: Colors.TRANSPARENT,
                  }}
                  onClick={() => {
                    if (
                      !isMainDrawerOpen ||
                      (isMainDrawerOpen && tab.index === selectedDrawerView)
                    ) {
                      toggleMainDrawer()
                    }
                    setSelectedDrawerView(tab.index)
                  }}
                >
                  <VStack
                    h="50px"
                    w="50px"
                    border="3px solid"
                    borderRadius="50%"
                    justifyContent="center"
                    borderColor={
                      tab.index === selectedDrawerView && isMainDrawerOpen
                        ? Colors.DI_SERRIA
                        : Colors.MINE_SHAFT
                    }
                  >
                    {MainDrawerTabIcon(tab.index)}
                  </VStack>
                  <Box h="8px" />
                </VStack>
              ))}
            </HStack>
          </Flex>
        )}

        {!(isSyndicatesPage && isMobile) && (
          <Box
            as="a"
            w="full"
            zIndex={1}
            target="_blank"
            href={config.AlienWorldsUrl}
            maxW={{ base: '65px', sm: '70px', md: '90px' }}
            pl={isSyndicatesPage && isMobile ? '15px' : '0px'}
            mr={isSyndicatesPage && isMobile ? '75px' : '0px'}
          >
            <AlienWorldsIcon fill={Colors.ALTO} boxSize="100%" />
          </Box>
        )}
        {isSyndicatesPage && isMobile && (
          <Flex
            gap={1}
            ml="auto"
            right="2px"
            cursor="pointer"
            alignItems="center"
            flexDirection="column"
            onClick={() => setIsSyndicatesSidebarOpen(!isSyndicatesSidebarOpen)}
          >
            <Box as="a" w="full" zIndex={1} width={{ base: '65px', sm: '80px', md: '100px' }}>
              <AlienWorldsIcon fill={Colors.ALTO} boxSize="100%" />
            </Box>
          </Flex>
        )}
      </Flex>
    </Flex>
  )
}

export { TopBar }
