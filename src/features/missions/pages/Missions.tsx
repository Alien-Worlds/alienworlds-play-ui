import { VFC, useEffect } from 'react'

import { Text, Center, Flex } from '@chakra-ui/react'
import { useWallets } from '@web3-onboard/react'
import { MissionsTable } from 'features/missions/components/MissionsTable'
import { useMissionsStore } from 'features/missions/store/missionsStore'
import { motion } from 'framer-motion'
import { useMatch } from 'react-router-dom'
import { usePageVisit } from 'shared/hooks/usePageVisit'
import { Colors } from 'shared/util/colors'
import { PagePath } from 'store/main/types'

// The Missions Centre and My Missions (the explorer's missions): one page, two routes.
const Missions: VFC = () => {
  const connectedWallet = useWallets()
  const isMyMissions = !!useMatch(PagePath.MissionsExplorer)
  const location = isMyMissions ? PagePath.MissionsExplorer : PagePath.Missions

  usePageVisit(location)

  useEffect(() => {
    const { setSelectedMissionsTab, resortMissions } = useMissionsStore.getState()
    setSelectedMissionsTab(isMyMissions ? 1 : 0)
    resortMissions()
  }, [location])

  return (
    <motion.div
      initial={{ translateY: -100, opacity: 0 }}
      animate={{ translateY: 0, opacity: 1 }}
      exit={{ translateY: 100, opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5 }}
    >
      {connectedWallet.length > 0 && <MissionsTable />}
      {connectedWallet.length === 0 && (
        <Center>
          <Flex justify="center" align="center">
            <Text
              mt={5}
              mr={2}
              fontSize={14}
              fontWeight={500}
              fontFamily="orb"
              color={Colors.BUTTERCUP}
            >
              No Missions Available yet
            </Text>
          </Flex>
        </Center>
      )}
    </motion.div>
  )
}

export { Missions }
