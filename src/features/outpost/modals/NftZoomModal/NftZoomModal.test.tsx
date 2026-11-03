import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSessionStore } from 'shared/store/sessionStore'

import { NftZoomModal } from './NftZoomModal'

jest.mock('shared/util/config', () => ({
  config: { IpfsApiUrl: 'https://ipfs.example', DemoUserWaxAccount: 'demo.wam' },
}))

jest.mock('@alien-worlds/uikit', () => ({
  Button: ({ children, onClick }) => <button onClick={onClick}>{children}</button>,
}))

const props = { isOpen: true, src: 'QmNft', onClose: jest.fn(), redeemAction: jest.fn() }

describe('NftZoomModal', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useSessionStore.setState({ isDemoUser: false })
  })

  it('shows the NFT image from IPFS and the shards it costs', () => {
    render(<NftZoomModal {...props} pointsRequired={2500} />)

    expect(screen.getByRole('img')).toHaveAttribute('src', 'https://ipfs.example/QmNft')
    expect(screen.getByText('Shards')).toBeInTheDocument()
    expect(screen.getByText('250.0')).toBeInTheDocument()
  })

  it('labels a level reward with the experience it needs', () => {
    render(<NftZoomModal {...props} userPointsRequired={5000} redeemAction={undefined} />)

    expect(screen.getByText('Experience')).toBeInTheDocument()
    expect(screen.getByText('500.0')).toBeInTheDocument()
  })

  it('fuses from the zoomed view', async () => {
    render(<NftZoomModal {...props} pointsRequired={2500} />)

    await userEvent.click(screen.getByRole('button', { name: 'Fuse Shards' }))
    expect(props.redeemAction).toHaveBeenCalled()
  })

  it('hides Fuse Shards for a demo user, and without a redeem action', () => {
    useSessionStore.setState({ isDemoUser: true })
    const { rerender } = render(<NftZoomModal {...props} pointsRequired={2500} />)
    expect(screen.queryByRole('button', { name: 'Fuse Shards' })).not.toBeInTheDocument()

    act(() => useSessionStore.setState({ isDemoUser: false }))
    rerender(<NftZoomModal {...props} pointsRequired={2500} redeemAction={undefined} />)
    expect(screen.queryByRole('button', { name: 'Fuse Shards' })).not.toBeInTheDocument()
  })

  it('can show just the image', () => {
    render(<NftZoomModal {...props} pointsRequired={2500} hideSubtitle />)
    expect(screen.queryByText('Shards')).not.toBeInTheDocument()
  })

  it('closes', async () => {
    render(<NftZoomModal {...props} pointsRequired={2500} />)

    await userEvent.click(screen.getByRole('button', { name: 'Close' }))
    expect(props.onClose).toHaveBeenCalled()
  })
})
