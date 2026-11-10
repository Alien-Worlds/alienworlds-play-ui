import { screen } from '@testing-library/react'
import { buildPinata, buildUserWallet } from 'features/missions/testUtils/fixtures'
import { mockStore, renderMissions } from 'features/missions/testUtils/mockStore'

import { MissionsInventory } from './MissionsInventory'

jest.mock('store', () => jest.requireActual('features/missions/testUtils/mockStore').storeMock)

const showMissionsInventoryPage = jest.fn()

const setup = ({ userWallet = null, nfts = null, templatePinatas = null } = {}) => {
  mockStore({
    state: {
      web3: {
        userWallet,
        totalMissionsNfts: 0,
        loadedMissionsNfts: 0,
        loadingProgressMissionsNfts: 0,
      },
      missions: { nfts, templatePinatas },
    },
    actions: { main: { showMissionsInventoryPage } },
  })
  return renderMissions(<MissionsInventory />, { at: '/missions/inventory' })
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('MissionsInventory', () => {
  it('opens the inventory page', () => {
    setup()

    expect(showMissionsInventoryPage).toHaveBeenCalled()
  })

  it("groups the wallet's mission NFTs by name", () => {
    setup({
      userWallet: buildUserWallet(),
      nfts: [buildPinata({ name: 'A' }), buildPinata({ name: 'A' }), buildPinata({ name: 'B' })],
      templatePinatas: [buildPinata({ name: 'T' })],
    })

    expect(screen.getAllByAltText('NFT prize')).toHaveLength(2)
    expect(screen.getByText('#2 NFTs of this kind')).toBeInTheDocument()
    expect(screen.getByText('#1 NFT of this kind')).toBeInTheDocument()
  })

  it('shows one of each template NFT without a BSC wallet', () => {
    setup({ templatePinatas: [buildPinata({ name: 'T1' }), buildPinata({ name: 'T2' })] })

    expect(screen.getAllByText('#1 NFT of this kind')).toHaveLength(2)
  })

  it('shows the NFT traits on hover', () => {
    setup({ templatePinatas: [buildPinata({ name: 'T', series: 3, cardNumber: 8 })] })

    expect(screen.getByText('Series').nextSibling).toHaveTextContent('3')
    expect(screen.getByText('Card ID').nextSibling).toHaveTextContent('8')
    expect(screen.getByText('Key A')).toBeInTheDocument()
  })

  it('says the wallet has no mission NFTs yet', () => {
    setup({ userWallet: buildUserWallet(), nfts: [] })

    expect(screen.getByText('No Mission NFTs available yet.')).toBeInTheDocument()
  })

  it('shows a loading message while the template NFTs load', () => {
    setup()

    expect(screen.getByText('Loading Missions NFTs, please wait...')).toBeInTheDocument()
  })
})
