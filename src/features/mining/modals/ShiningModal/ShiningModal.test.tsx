import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { mockStore, renderWithChakra } from 'features/mining/testUtils/mockStore'
import { useModalStore } from 'shared/store/modalStore'

import { ShiningModal } from './ShiningModal'

jest.mock('store', () => jest.requireActual('features/mining/testUtils/mockStore').storeMock)
jest.mock('react-player', () => ({
  __esModule: true,
  default: ({ url }: any) => <div data-testid="player">{url}</div>,
}))

const setShiningUrl = jest.fn()

beforeEach(() => {
  mockStore({
    state: { main: { shiningUrl: '/shining/gold_shine.mp4' } },
    actions: { main: { setShiningUrl } },
  })
  useModalStore.getState().setPrimaryModalActive({ modalName: 'ShiningModal', value: false })
})

describe('ShiningModal', () => {
  it('plays the shining video when opened', () => {
    renderWithChakra(<ShiningModal />)
    expect(screen.queryByTestId('player')).not.toBeInTheDocument()

    act(() =>
      useModalStore.getState().setPrimaryModalActive({ modalName: 'ShiningModal', value: true })
    )

    expect(screen.getByTestId('player')).toHaveTextContent('/shining/gold_shine.mp4')
  })

  it('clears the video when closed', async () => {
    useModalStore.getState().setPrimaryModalActive({ modalName: 'ShiningModal', value: true })
    renderWithChakra(<ShiningModal />)

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))

    expect(useModalStore.getState().primaryModals.ShiningModal).toBe(false)
    expect(setShiningUrl).toHaveBeenCalledWith(null)
  })
})
