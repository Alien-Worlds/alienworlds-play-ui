import { Dispatch, SetStateAction, useCallback, useEffect, useState } from 'react'

import SessionKit, { Session, SessionKitArgs, WalletPlugin } from '@wharfkit/session'
import { WalletPluginAnchor } from '@wharfkit/wallet-plugin-anchor'
import { WalletPluginCloudWallet } from '@wharfkit/wallet-plugin-cloudwallet'
import { WalletPluginWombat } from '@wharfkit/wallet-plugin-wombat'
import WebRenderer from '@wharfkit/web-renderer'
import { config } from 'shared/util/config'
import { useActions } from 'store'

export const SessionManager = () => {
  const {
    main: { setSessionKit, setCurrentSession },
  } = useActions()

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

  return <></>
}
