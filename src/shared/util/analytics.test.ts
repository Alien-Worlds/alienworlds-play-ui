import { LOAD_USER_POINTS_QUERY_KEY } from 'shared/hooks/queries/wax/queryKeys'
import { useAssetsStore } from 'shared/store/assetsStore'
import { useMinerStore } from 'shared/store/minerStore'
import { useSessionStore } from 'shared/store/sessionStore'

import { collectEvent } from './analytics'
import { queryClient } from './queryClient'

jest.mock('shared/util/config', () => ({
  config: { GoogleAnalytics: 'G-TEST', DemoUserWaxAccount: 'demo.wam' },
}))

const gtag = jest.fn()

beforeEach(() => {
  gtag.mockReset()
  window.ga4 = { gtag } as any
  localStorage.clear()
  queryClient.clear()
  useSessionStore.setState({ walletId: null, player: null })
  useAssetsStore.setState({ bag: undefined })
  useMinerStore.setState({ miner: null })
})

describe('collectEvent', () => {
  it("sends the event with the caller's fields and the player's context", () => {
    useSessionStore.setState({
      walletId: 'someplayer.wam',
      player: { account: 'someplayer.wam', avatar: '1', tag: 'alien' },
    })
    useAssetsStore.setState({ bag: { items: ['10', '11'] } as any })
    useMinerStore.setState({ miner: { last_mine: '2026-10-01T00:00:00' } as any })
    queryClient.setQueryData([LOAD_USER_POINTS_QUERY_KEY], { total_points: 42 })

    collectEvent({ name: 'page_visit', fields: { location: '/mining/land' } })

    expect(gtag).toHaveBeenCalledWith(
      'event',
      'page_visit',
      expect.objectContaining({
        send_to: 'G-TEST',
        location: '/mining/land',
        wallet: 'someplayer.wam',
        username: 'alien',
        bag: ['10', '11'],
        lastMine: '2026-10-01T00:00:00',
        nftPoints: 42,
      })
    )
  })

  it("sends 'null' as the username when there is no player", () => {
    collectEvent({ name: 'aw_error' })

    expect(gtag).toHaveBeenCalledWith(
      'event',
      'aw_error',
      expect.objectContaining({ wallet: null, username: 'null', bag: undefined })
    )
  })

  it('logs instead of throwing when sending fails', async () => {
    const error = jest.spyOn(console, 'error').mockImplementation(() => {})
    gtag.mockImplementation(() => {
      throw new Error('blocked')
    })

    expect(() => collectEvent({ name: 'page_visit' })).not.toThrow()
    await Promise.resolve()

    expect(error).toHaveBeenCalledWith(new Error('blocked'))
    error.mockRestore()
  })
})
