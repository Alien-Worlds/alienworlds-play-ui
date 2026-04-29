import { useEffect } from 'react'

import { BlockNativeIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Box, Text } from '@chakra-ui/react'
import { useConnectWallet, useSetChain, useWallets } from '@web3-onboard/react'
import { useNavigate } from 'react-router-dom'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'
import { useScreenSize } from 'shared/util/hooks'
import { useActions, useAppState } from 'store'
import { PagePath } from 'store/main/types'
import { DACUserStatusType } from 'store/wax/types'

import { Constants } from '../../../../shared/util/constants'

export const MyMissionsBtn = () => {
  const {
    missions: { missionsToClaimCount },
  } = useAppState()
  const { isNotDesktop } = useScreenSize()

  const navigate = useNavigate()

  return (
    <Button
      height="56px"
      size="lg"
      minWidth="240px"
      maxWidth="240px"
      fontSize={16}
      variant="hydrogen"
      justifyContent="center"
      isFullWidth={!isNotDesktop}
      style={{ borderRadius: '14px' }}
      onClick={() => navigate(PagePath.MissionsExplorer)}
      width={isNotDesktop ? 'full' : '240px'}
      backgroundColor={Colors.CARIBBEAN_GREEN}
      borderColor={Colors.SNOW_WHITE}
      rightIcon={
        <>
          {missionsToClaimCount > 0 && (
            <Box
              w="23px"
              pl="2px"
              border="2px solid"
              borderRadius="full"
              bg={Colors.DEEP_SEA}
              borderColor={Colors.PERSIAN_GREEN}
            >
              <Text
                fontFamily="tlm"
                fontWeight="normal"
                fontSize="medium"
                color={Colors.SNOW_WHITE}
              >
                {missionsToClaimCount}
              </Text>
            </Box>
          )}
        </>
      }
    >
      Open My Missions
    </Button>
  )
}

export const MissionsCentreBtn = () => {
  const {
    missions: { availableMissions },
  } = useAppState()
  const { isNotDesktop } = useScreenSize()

  const navigate = useNavigate()

  return (
    <Button
      height="56px"
      size="lg"
      minWidth="240px"
      maxWidth="240px"
      variant="info"
      fontSize={16}
      justifyContent="center"
      isFullWidth={!isNotDesktop}
      borderColor={Colors.SNOW_WHITE}
      width={isNotDesktop ? 'full' : '240px'}
      backgroundColor={Colors.BLACK_SOLID_100}
      style={{ borderRadius: '14px', marginLeft: '0px' }}
      onClick={() => navigate(PagePath.Missions)}
      rightIcon={
        <>
          {availableMissions?.length > 0 && (
            <Box
              w="23px"
              ml="4px"
              pl="1px"
              border="2px solid"
              borderRadius="full"
              bg={Colors.SNOW_WHITE}
              borderColor={Colors.GRAY_CHATEAU}
            >
              <Text fontFamily="tlm" fontWeight="normal" fontSize="medium" color={Colors.DARK_GRAY}>
                {availableMissions.length}
              </Text>
            </Box>
          )}
        </>
      }
    >
      Missions Centre
    </Button>
  )
}

export const ConnectWalletBtn = ({ onClick }: { onClick: any }) => {
  const { isNotDesktop } = useScreenSize()
  const {
    modal: { setPrimaryModalActive },
  } = useActions()
  const {
    wax: { isDemoUser },
  } = useAppState()
  return (
    <Button
      height="40px"
      size="lg"
      fontSize={16}
      variant="info"
      onClick={() => {
        if (isDemoUser) {
          setPrimaryModalActive({ modalName: 'LoginModal', value: true })
        } else {
          onClick()
        }
      }}
      isFullWidth={!isNotDesktop}
      style={{ borderRadius: '14px' }}
      width={isNotDesktop ? '100%' : '240px'}
      leftIcon={<BlockNativeIcon boxSize="25px" style={{ marginRight: '10px' }} />}
    >
      Connect Wallet
    </Button>
  )
}

export const useShowVisitPlanetBtn = (dacUserStatus: string) => {
  let showButton: boolean = false
  const { isNotDesktop, isLargeScreen } = useScreenSize()

  if (
    (dacUserStatus !== DACUserStatusType.CANDIDATE &&
      dacUserStatus !== DACUserStatusType.CUSTODIAN) ||
    ((dacUserStatus === DACUserStatusType.CANDIDATE ||
      dacUserStatus === DACUserStatusType.CUSTODIAN) &&
      (isNotDesktop || isLargeScreen))
  ) {
    showButton = true
  }
  return showButton
}

export const useWalletConnect = () => {
  const connectedWallets = useWallets()
  const [, connect] = useConnectWallet()
  const [{ wallet, connecting }] = useConnectWallet()
  const [{ connectedChain }, setChain] = useSetChain()
  const {
    web3: { setWallet, setIsAutoConnect, setIsSync },
    wax: { collectEvent },
  } = useActions()
  const {
    web3: { userWallet },
    wax: { walletId },
  } = useAppState()

  const isWalletPresent = (name: string) => {
    for (let i = 0; i < connectedWallets.length; i = +1) {
      if (connectedWallets[i].label === name) {
        return { isFound: true, index: i }
      }
    }
    return { isFound: false, index: -1 }
  }

  useEffect(() => {
    if (!connectedWallets.length) {
      setIsAutoConnect(false)
      return
    }

    const connectedWalletsLabelArray = connectedWallets.map(({ label }: any) => label)
    if (connectedWalletsLabelArray)
      window.localStorage.setItem('connectedWallets', JSON.stringify(connectedWalletsLabelArray))
    if (userWallet && wallet) {
      if (userWallet.label !== wallet.label) {
        setIsSync(false)
      }
    }
    const loginEvent = {}
    if (walletId) {
      // @ts-ignore
      loginEvent.wallet = walletId
    }
    if (
      wallet &&
      wallet.accounts.length > 0 &&
      wallet.accounts[0].address &&
      isWalletPresent('Coinbase Wallet').isFound
    ) {
      // @ts-ignore
      loginEvent.wallet_cb =
        connectedWallets[isWalletPresent('Coinbase Wallet').index].accounts[0].address
    }
    if (
      wallet &&
      wallet.accounts.length > 0 &&
      wallet.accounts[0].address &&
      isWalletPresent('MetaMask').isFound
    ) {
      // @ts-ignore
      loginEvent.wallet_metamask =
        connectedWallets[isWalletPresent('MetaMask').index].accounts[0].address
    }
    // @ts-ignore
    if (loginEvent.wallet || loginEvent.wallet_metamask || loginEvent.wallet_cb) {
      collectEvent({ name: Constants.GA_AW_LOGIN, fields: loginEvent })
    }
    setWallet(wallet)
    setChain({ chainId: `0x${config.BscChainId.toString(16)}` })
  }, [connectedWallets, wallet])

  return { connect, connecting, connectedChain, connectedWallets }
}
