import { act, render } from '@testing-library/react'
import { useMissionsStore } from 'features/missions/store/missionsStore'
import { MemoryRouter, useNavigate } from 'react-router-dom'
import { useModalStore } from 'shared/store/modalStore'

import { MissionsSync } from './MissionsSync'

const realSync = useMissionsStore.getState().sync
const sync = jest.fn()

let navigate: ReturnType<typeof useNavigate>
const Navigator = () => {
  navigate = useNavigate()
  return null
}

const renderSync = (at = '/missions') =>
  render(
    <MemoryRouter initialEntries={[at]}>
      <Navigator />
      <MissionsSync />
    </MemoryRouter>
  )

beforeEach(() => {
  jest.useFakeTimers()
  sync.mockClear()
  useMissionsStore.setState({ sync })
  useModalStore.setState({ isMainDrawerOpen: false })
})

afterEach(() => {
  jest.useRealTimers()
  useMissionsStore.setState({ sync: realSync })
})

describe('MissionsSync', () => {
  it('syncs the page straight away, then every second', () => {
    renderSync('/missions/my')
    expect(sync).toHaveBeenCalledTimes(1)
    expect(sync).toHaveBeenLastCalledWith('/missions/my')

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    expect(sync).toHaveBeenCalledTimes(4)
  })

  it('syncs straight away for a new page, or when the main drawer opens', () => {
    renderSync('/mining')

    act(() => navigate('/profile/balances'))
    expect(sync).toHaveBeenLastCalledWith('/profile/balances')

    act(() => useModalStore.setState({ isMainDrawerOpen: true }))
    expect(sync).toHaveBeenCalledTimes(3)
  })

  it('stops when unmounted', () => {
    const { unmount } = renderSync()
    unmount()

    act(() => {
      jest.advanceTimersByTime(3000)
    })

    expect(sync).toHaveBeenCalledTimes(1)
  })
})
