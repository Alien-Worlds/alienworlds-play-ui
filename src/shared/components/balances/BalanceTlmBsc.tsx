import { useEffect } from 'react'

import {
  BlockNativeIcon,
  CoinBaseIcon,
  LockIcon,
  MetamaskIcon,
  MissionsIcon,
  BSCIcon,
} from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Box, Flex, HStack, Icon, Spinner, Text, useMediaQuery } from '@chakra-ui/react'
import { useConnectWallet, useSetChain, useWallets } from '@web3-onboard/react'
import { GlossaryInfoIcon } from 'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon'
import { TooltipLocations } from 'features/glossary/utils/glossaryConst'
import { motion } from 'framer-motion'
import { pageTransition } from 'shared/util/animations'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'
import { useActions, useAppState } from 'store'

type BalanceTlmBscTypes = {
  isDrawer: boolean
  cycleMenu: () => void
}

const BalanceTlmBsc = ({ isDrawer, cycleMenu }: BalanceTlmBscTypes) => {
  const connectedWallets = useWallets()
  const [{ wallet }] = useConnectWallet()
  const [, connect] = useConnectWallet()
  const [{ connectedChain }, setChain] = useSetChain()
  const isBinanceChain =
    connectedWallets.length > 0 &&
    connectedChain &&
    parseInt(connectedChain.id, 16) === config.BscChainId
  const {
    wax: { isDemoUser },
    web3: { bscTlmBalanceFormatted, bscStakedTlmBalanceFormatted, userWallet },
  } = useAppState()
  const {
    modal: { setPrimaryModalActive },
  } = useActions()
  const [isLargerThanMobile] = useMediaQuery('(min-width: 640px)')
  const {
    web3: { setWallet, setIsSync },
  } = useActions()

  useEffect(() => {
    if (!connectedWallets.length) return

    const connectedWalletsLabelArray = connectedWallets.map(({ label }: any) => label)
    if (connectedWalletsLabelArray)
      window.localStorage.setItem('connectedWallets', JSON.stringify(connectedWalletsLabelArray))

    if (userWallet && wallet) {
      if (userWallet.label !== wallet.label) {
        setIsSync(false)
      }
    }
    setWallet(wallet)
  }, [connectedWallets, wallet])

  useEffect(() => {
    if (!isBinanceChain) {
      if (connectedWallets.length > 0) setChain({ chainId: `0x${config.BscChainId.toString(16)}` })
    }
  }, [connectedChain])

  return (
    <motion.div {...pageTransition}>
      <Box mb={4}>
        {isBinanceChain && (
          <HStack>
            <MissionsIcon color={Colors.GRAY} boxSize={15} />
            <Text ml={2} fontSize="x-small" color="grey" fontFamily="Orbitron">
              MISSIONS BSC WALLET
            </Text>
            <GlossaryInfoIcon width={16} glossaryId={TooltipLocations.PROFILE_MISSIONS_WALLET} />
          </HStack>
        )}
      </Box>
      {connectedWallets.length === 0 && (
        <Box>
          <Button
            justifyContent="flex-start"
            fontWeight={600}
            fontSize={16}
            size="md"
            variant="info"
            onClick={() => {
              if (isDemoUser) {
                setPrimaryModalActive({ modalName: 'LoginModal', value: true })
              } else {
                if (!isLargerThanMobile) {
                  cycleMenu()
                }
                connect()
              }
            }}
            leftIcon={<Icon as={BlockNativeIcon} boxSize={24} height="auto" />}
          >
            Connect Wallet
          </Button>
        </Box>
      )}
      {connectedWallets.length > 0 &&
        connectedChain &&
        parseInt(connectedChain.id, 16) === config.BscChainId && (
          <Flex alignItems="flex-start" mb={4}>
            <Flex gap={3}>
              <Box w={10} position="relative">
                <BSCIcon color={Colors.DI_SERRIA} boxSize={40} />
              </Box>
              <Flex direction="column">
                {bscTlmBalanceFormatted !== null ? (
                  <Text
                    fontSize="2xl"
                    lineHeight="0.8"
                    fontFamily="Orbitron"
                    color={Colors.DI_SERRIA}
                  >
                    {bscTlmBalanceFormatted}
                  </Text>
                ) : (
                  <Spinner size="sm" color={Colors.DI_SERRIA} />
                )}
                <Text
                  fontFamily="Titillium Web"
                  fontWeight="bold"
                  fontSize="smaller"
                  letterSpacing="0.1em"
                >
                  BSC Trilium w/ {connectedWallets[0].label}
                </Text>
              </Flex>
            </Flex>

            {!isDrawer && (
              <Flex align="flex-end" alignItems="center" gap={1}>
                <BlockNativeIcon fill="white" boxSize={28} />
                {connectedWallets[0].label === 'Coinbase Wallet' && (
                  <CoinBaseIcon fill="white" boxSize={28} />
                )}
                {connectedWallets[0].label === 'MetaMask' && (
                  <MetamaskIcon fill="white" boxSize={33} />
                )}
              </Flex>
            )}
          </Flex>
        )}
      {connectedWallets.length > 0 && bscStakedTlmBalanceFormatted && (
        <Flex alignItems="flex-start" color={Colors.RADICAL_RED} gap={3}>
          <Box w={10} position="relative" fill={Colors.RADICAL_RED}>
            <Icon
              as={LockIcon}
              boxSize={30}
              height="auto"
              position="absolute"
              left={5}
              bottom={15}
              zIndex={2}
            />
            <BSCIcon color={Colors.RADICAL_RED} boxSize={40} />
          </Box>
          <Flex direction="column">
            <Text fontSize="2xl" lineHeight="0.8" fontFamily="Orbitron">
              {bscStakedTlmBalanceFormatted}
            </Text>
            <Text
              fontFamily="Titillium Web"
              fontWeight="bold"
              fontSize="smaller"
              color="white"
              letterSpacing="0.1em"
            >
              Staked BSC Trilium
            </Text>
          </Flex>
        </Flex>
      )}
    </motion.div>
  )
}

export { BalanceTlmBsc }
