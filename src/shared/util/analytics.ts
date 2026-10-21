import { LOAD_USER_POINTS_QUERY_KEY } from 'shared/hooks/queries/wax/queryKeys'
import { useAssetsStore } from 'shared/store/assetsStore'
import { useMinerStore } from 'shared/store/minerStore'
import { useSessionStore } from 'shared/store/sessionStore'
import { WaxUserPoints } from 'store/wax/types'

import { config } from './config'
import { queryClient } from './queryClient'

export const collectGAEvent = async (eventName: string, eventParameters?: any) => {
  eventParameters.cookies_cleared = localStorage.getItem('aw_cookies_cleared')
  const lastEventTimestamp = localStorage.getItem('aw_lastEvtTimestamp')

  const defaultParameters = {
    send_to: config.GoogleAnalytics,
    page_location: window?.location?.href,
  }

  const eventCollected = {
    ...defaultParameters,
    ...eventParameters,
  }

  if (Date.now().toString() !== lastEventTimestamp) {
    window?.ga4?.gtag('event', eventName, eventCollected)
    localStorage.setItem('aw_lastEvtTimestamp', Date.now().toString())
  }
}

/**
 * Sends a GA event with the player's context (wallet, tag, bag, last mine, NFT points) added to
 * `fields`. Formerly Overmind's wax.collectEvent. Never throws: analytics must not break the caller.
 */
export const collectEvent = ({ name, fields }: { name: string; fields?: any }) => {
  try {
    // @TODO do we want to use queryClient.ensureQueryData instead to load data if not present?
    const nftPoints = queryClient.getQueryData<WaxUserPoints>([LOAD_USER_POINTS_QUERY_KEY])
    const { walletId, player } = useSessionStore.getState()

    const stateInfo = {
      ...fields,
      bag: useAssetsStore.getState().bag?.items,
      wallet: walletId,
      lastMine: useMinerStore.getState().miner?.last_mine,
      username: player?.tag ?? 'null',

      nftPoints: nftPoints?.total_points,
    }
    collectGAEvent(name, stateInfo).catch(console.error)
  } catch (error) {
    console.error(error)
  }
}
