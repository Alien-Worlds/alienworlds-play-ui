import { VFC, useEffect } from 'react'

import { Text, Center, Flex } from '@chakra-ui/react'
import { useWallets } from '@web3-onboard/react'
import { MissionsTable } from 'features/missions/components/MissionsTable'
import { motion } from 'framer-motion'
import { useLocation, useMatch } from 'react-router-dom'
import { Colors } from 'shared/util/colors'
import { useActions } from 'store'
import { PagePath } from 'store/main/types'
const Missions: VFC = () => {
  const {
    main: { showMissionsPage, showMissionsExplorerPage },
  } = useActions()
  const connectedWallet = useWallets()
  const { pathname } = useLocation()
  const isMissionsPage = useMatch(PagePath.Missions)
  const isMissionsExplorerPage = useMatch(PagePath.MissionsExplorer)

  useEffect(() => {
    showMissionsPage()
  }, [])

  useEffect(() => {
    if (isMissionsPage) {
      showMissionsPage()
    } else if (isMissionsExplorerPage) {
      showMissionsExplorerPage()
    }
  }, [pathname])

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
