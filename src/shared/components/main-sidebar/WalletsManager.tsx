import { useState, Dispatch, SetStateAction, useEffect, useCallback } from 'react'

import { Flex, Text, Image, Tooltip } from '@chakra-ui/react'
import SessionKit, { Session, WalletPlugin, SessionKitArgs } from '@wharfkit/session'
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor'
import { WalletPluginCloudWallet } from '@wharfkit/wallet-plugin-cloudwallet'
import { WalletPluginWombat } from '@wharfkit/wallet-plugin-wombat'
import WebRenderer from '@wharfkit/web-renderer'
import darkRectangle from 'assets/images/darkRectangle.png'
import { map } from 'lodash'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'
import { sessionKitWallets } from 'shared/util/helpers'
import { useActions, useAppState } from 'store'
import { v4 } from 'uuid'

export const WalletsManager = () => {
  const {
    main: { setSessionKit, setCurrentSession },
  } = useActions()
  const {
    wax: { isDemoUser },
    main: { isCompactSidebar, currentWallet },
  } = useAppState()

  const [selectedWallet, setSelectedWallet] = useState<string>(null)
  const [, setSession]: [Session | undefined, Dispatch<SetStateAction<Session | undefined>>] =
    useState()

  // Restore previous WharfKit session
  const restoreSession = useCallback(
    async (sessionKit: SessionKit) => {
      if (sessionKit == null) {
        return
      }
      const existingSession: Session = await sessionKit.restore()

      if (existingSession != null) {
        setSession(existingSession)
        setCurrentSession(existingSession)
      }
    },
    [setSession]
  )

  // Start new WharfKit session
  const createSession = () => {
    const sessionKitUI: WebRenderer = new WebRenderer()
    const anchorPlugin: WalletPluginAnchor = new WalletPluginAnchor()
    const wombatPlugin: WalletPluginWombat = new WalletPluginWombat()
    const cloudWalletPlugin: WalletPluginCloudWallet = new WalletPluginCloudWallet()
    const walletPlugins: WalletPlugin[] = [anchorPlugin, wombatPlugin, cloudWalletPlugin]

    const sessionKitArgs: SessionKitArgs = {
      appName: config.AlienWorldsName,
      walletPlugins: walletPlugins,
      ui: sessionKitUI,
      chains: [
        {
          url: config.WaxApiUrl,
          id: config.WaxMainnetChainId,
        },
      ],
    }

    const sessionKit: SessionKit = new SessionKit(sessionKitArgs)

    setSessionKit(sessionKit)
    restoreSession(sessionKit)
    sessionKitUI.appendDialogElement()
  }

  useEffect(() => {
    createSession()
  }, [restoreSession])

  useEffect(() => {
    setSelectedWallet(currentWallet)
  }, [currentWallet])

  return (
    <Flex flexDirection="column" w="full" mb="-5px">
      {!isCompactSidebar && (
        <Flex w="full" justifyContent="center" alignItems="center" mb={0}>
          {!isDemoUser && (
            <Text color={Colors.DI_SERRIA} fontSize="12px" lineHeight="20px" mb="-5px">
              Logout to use other Wallet
            </Text>
          )}
        </Flex>
      )}
      <Flex
        width="100%"
        flexWrap="wrap"
        alignSelf="center"
        alignItems="center"
        justifyContent="center"
        w={isCompactSidebar ? 'full' : '120%'}
        mb={isCompactSidebar ? '25px' : '0px'}
        mt={isCompactSidebar ? '5px' : '20px'}
        gap={isCompactSidebar ? '25px' : '10px'}
        direction={isCompactSidebar ? 'column' : 'row'}
        display={{ base: 'none', md: 'flex' }}
      >
        {map(sessionKitWallets, (wallet) => {
          return (
            <Tooltip
              label="Add Wombat Extension"
              key={v4()}
              isDisabled={wallet.enabled}
              placement="top"
            >
              <Flex
                key={wallet.title}
                alignItems="center"
                flexDirection="column"
                justifyContent="center"
                backgroundRepeat="round"
                w={isCompactSidebar ? '65px' : '80px'}
                h={isCompactSidebar ? '75px' : '100px'}
                gap={isCompactSidebar ? '3px' : '10px'}
                backgroundImage={selectedWallet !== wallet.type ? '' : darkRectangle}
                //  cursor={wallet.enabled && selectedWallet !== wallet.type ? 'pointer' : 'default'}
                // _hover={{
                //   backgroundImage:
                //     wallet.enabled &&
                //     (isDemoUser
                //       ? darkRectangle
                //       : selectedWallet !== wallet.type
                //       ? rectangle
                //       : darkRectangle),
                // }}
                filter={
                  wallet.enabled
                    ? selectedWallet === wallet.type
                      ? 'none'
                      : 'none'
                    : 'opacity(.5)'
                }
                // onClick={async () => {
                //   // disable click if selected wallet is not available
                //   if (!wallet.enabled) return

                //   setPrimaryModalActive({ modalName: 'LoadingModal', value: true })

                //   // if user is not logged in (demo), trigger normal login flow
                //   if (isDemoUser) {
                //     await selectWallet(wallet.type)
                //   } else {
                //     // if user is already logged in, try to switch to a stored session before login
                //     await switchWallet(wallet.type)
                //   }

                //   setTimeout(() => {
                //     setPrimaryModalActive({ modalName: 'LoadingModal', value: false })
                //   }, 1000)
                // }}
              >
                {selectedWallet === wallet.type && (
                  <Flex
                    ml="5px"
                    mb="-10px"
                    boxSize="10px"
                    alignSelf="start"
                    position="relative"
                    borderRadius="100%"
                    bg={Colors.CARIBBEAN_GREEN}
                  />
                )}
                <Image src={wallet.logo} boxSize={isCompactSidebar ? '40px' : '50px'} />
                <Text fontFamily="tlm" fontSize="13px" fontWeight={700} textAlign="center">
                  {wallet.title}
                </Text>
              </Flex>
            </Tooltip>
          )
        })}
      </Flex>
    </Flex>
  )
}
