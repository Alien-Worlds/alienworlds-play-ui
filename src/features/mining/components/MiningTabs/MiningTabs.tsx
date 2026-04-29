import { MiningIcon } from '@alien-worlds/icons'
import { Tabs, TabList, Tab, Flex, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { findIndex, map } from 'lodash'
import { useLocation, useNavigate } from 'react-router-dom'
import { Colors } from 'shared/util/colors'
import { useScreenSize } from 'shared/util/hooks'
import { PagePath } from 'store/main/types'

const miningTabsList = [
  {
    label: 'Tools',
    icon: 'tools',
    pagePath: PagePath.Tools,
  },
  {
    label: 'Lands',
    icon: 'lands',
    pagePath: PagePath.Land,
  },
  {
    label: 'Planets',
    icon: 'planets',
    pagePath: PagePath.Planet,
  },
  {
    label: 'Leaderboard',
    icon: 'leaderboard',
    pagePath: PagePath.MiningLeaderboard,
  },
]

export const MiningTabPanelMotion = ({ children, ...props }) => {
  return (
    <motion.div
      initial={{ y: 0, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 0, opacity: 0, transition: { duration: 0.15 } }}
      transition={{ duration: 0.3 }}
      style={{ width: '100%' }}
      {...props}
    >
      {children}
    </motion.div>
  )
}

const MiningTabs = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { isNotDesktop } = useScreenSize()
  const tabIndex = findIndex(miningTabsList, (item) => item.pagePath === pathname)
  const handleMiningTabClick = (index: number) => {
    const path = miningTabsList[index].pagePath
    navigate(path)
  }

  return (
    <Flex gap={4} flexDirection="column">
      <Flex alignItems="center" gap={{ base: '12px', md: 4 }}>
        <Flex
          bg={Colors.SNOW_WHITE}
          color={Colors.COD_GRAY}
          width={{ base: '32px', md: 10 }}
          height={{ base: '32px', md: 10 }}
          borderRadius="full"
          justifyContent="center"
          alignItems="center"
        >
          <MiningIcon boxSize={24} />
        </Flex>
        <Text fontFamily="orb" fontSize="3xl">
          Mining
        </Text>
      </Flex>

      <Tabs
        isLazy
        variant="full-rounded"
        defaultIndex={tabIndex}
        isFitted={!!isNotDesktop}
        px={{ base: '10px', lg: '0px' }}
        pt={{ base: '10px', sm: '0px' }}
        h={{ base: 'auto', lg: 'initial' }}
        onChange={(index) => handleMiningTabClick(index)}
        orientation={'horizontal'}
      >
        <TabList
          width={isNotDesktop ? '100%' : '570px'}
          overflowX="auto"
          overflowY="hidden"
          whiteSpace="nowrap"
          css={{
            '&::-webkit-scrollbar': {
              display: 'none', // Hide scrollbar for Chrome, Safari and Opera
            },
            msOverflowStyle: 'none', // Hide scrollbar for IE and Edge
            scrollbarWidth: 'none', // Hide scrollbar for Firefox
          }}
          // Add some padding to make scrollable area more visible
        >
          {map(miningTabsList, (item, index) => (
            <Tab
              key={item.pagePath + index}
              minWidth="fit-content" // Ensure tabs don't shrink
              px={6} // Add horizontal padding to tabs
            >
              {item.label}
            </Tab>
          ))}
        </TabList>
      </Tabs>
    </Flex>
  )
}

export { MiningTabs }
