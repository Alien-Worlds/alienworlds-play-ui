import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ELEMENTTYPES } from 'features/inventory/utils/NFTCardHelper'
import { formatLandRating } from 'shared/util/helpers'

import {
  CommunityNFTCardOverlayRender,
  NFTCardBottomPanelRender,
  NFTCardDetailPanelRender,
  NFTCardOverlayRender,
  NFTCardSetAvatar,
  NFTCardTopRightPanelRender,
  NFTShowAllRender,
} from './NFTCardOverlayRender'

const mockNavigate = jest.fn()
let mockUseMatchResult: object | null = null
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useMatch: () => mockUseMatchResult,
}))

const mockSetLand = jest.fn()
const mockSetAvatar = jest.fn()
let mockAtomicState: any = {}
let mockWaxState: any = { isOnboarded: false }

jest.mock('store', () => ({
  useActions: () => ({
    wax: {
      setLand: mockSetLand,
      setLandId: jest.fn(),
      setNftLandCardProperties: jest.fn(),
      executeOnboarding: jest.fn(),
      setOnboarding: jest.fn(),
      collectEvent: jest.fn(),
      loadManagingLandDetailsAndBoosts: jest.fn(),
      setAvatar: mockSetAvatar,
    },
    main: { setIsLandOwnerAddSlotDrawerOpen: jest.fn() },
  }),
  useAppState: () => ({
    atomic: {
      ownedLandsAssets: [],
      landAsset: null,
      ownedLandsAssetsDayBoosts: [],
      assets: [],
      ...mockAtomicState,
    },
    wax: { isOnboarded: false, onboarding: {}, ...mockWaxState },
  }),
}))

describe('NFTCardOverlayRender', () => {
  afterEach(() => {
    jest.clearAllMocks()
    mockAtomicState = {}
    mockWaxState = { isOnboarded: false }
  })

  it('renders Tool stat rows: rarity, shine, type, mining power, PWR, NFT power, mints', () => {
    const asset: any = {
      type: { name: 'Tool' },
      subType: { name: 'Pickaxe' },
      rarity: { name: 'rare' },
      shine: { name: 'gold' },
      ease: { name: 2.5 },
      difficulty: { name: 150 },
      luck: { name: 1.5 },
      mints: { name: 5 },
      mintTypes: { name: 1 },
      assetId: { name: '1' },
    }

    render(<NFTCardOverlayRender asset={asset} isNFTCard={false} />)

    expect(screen.getByText('Rarity')).toBeInTheDocument()
    expect(screen.getByText('RARE')).toBeInTheDocument()
    expect(screen.getByText('Shine')).toBeInTheDocument()
    expect(screen.getByText('Mining Power')).toBeInTheDocument()
    expect(screen.getByText('PWR')).toBeInTheDocument()
    expect(screen.getByText('NFT Power')).toBeInTheDocument()
    expect(screen.getByText('Mint #')).toBeInTheDocument()
  })

  it('zeroes displayed NFT power for an Abundant Tool', () => {
    const asset: any = {
      type: { name: 'Tool' },
      rarity: { name: 'abundant' },
      luck: { name: 1.5 },
      assetId: { name: '1' },
    }

    render(<NFTCardOverlayRender asset={asset} isNFTCard={false} />)
    expect(screen.getByText('NFT Power')).toBeInTheDocument()
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('shows land-specific rows and hides Mint # for Land type', () => {
    const asset: any = {
      type: { name: 'Land' },
      commission: { name: 2.5 },
      landrating: { name: 420000 },
      mints: { name: 5 },
      mintTypes: { name: 1 },
      assetId: { name: '1' },
      isUserOwner: true,
    }

    render(<NFTCardOverlayRender asset={asset} isNFTCard />)

    expect(screen.getByText('Commission')).toBeInTheDocument()
    expect(screen.getByText('Land Rating')).toBeInTheDocument()
    expect(screen.getByText(formatLandRating(420000).toString())).toBeInTheDocument()
    expect(screen.queryByText('Mint #')).not.toBeInTheDocument()
  })

  it('shows a Zoom button for non-Land assets when a zoom handler is given', async () => {
    const zoom = jest.fn()
    const asset: any = { type: { name: 'Tool' }, assetId: { name: '1' } }

    render(<NFTCardOverlayRender asset={asset} isNFTCard={false} zoom={zoom} />)

    await userEvent.click(screen.getByText('Zoom'))
    expect(zoom).toHaveBeenCalled()
  })

  it('shows land management actions for a Land asset the user owns, when onboarded', () => {
    mockWaxState = { isOnboarded: true }
    const asset: any = {
      type: { name: 'Land' },
      assetId: { name: '1' },
      isUserOwner: true,
    }

    render(<NFTCardOverlayRender asset={asset} isNFTCard />)

    expect(screen.getByText('Manage Land')).toBeInTheDocument()
    expect(screen.getByText(/Boost Land/)).toBeInTheDocument()
  })
})

describe('NFTCardTopRightPanelRender', () => {
  it('renders each mod entry', () => {
    const asset: any = {
      mod: [{ name: '3:4', elementType: ELEMENTTYPES.TEXT, styleConfig: {} }],
    }

    render(<NFTCardTopRightPanelRender asset={asset} />)
    expect(screen.getByText('3:4')).toBeInTheDocument()
  })
})

describe('NFTCardDetailPanelRender', () => {
  it('renders title, description, and copies-owned count', () => {
    const asset: any = {
      title: { name: 'Pickaxe' },
      description: { name: 'Mining tool' },
      cardcopies: { name: 3 },
      type: { name: 'Tool' },
    }

    render(<NFTCardDetailPanelRender asset={asset} />)
    expect(screen.getByText('Pickaxe')).toBeInTheDocument()
    expect(screen.getByText('Mining tool')).toBeInTheDocument()
    expect(screen.getByText('3x copies owned')).toBeInTheDocument()
  })

  it('shows the owner for Land assets', () => {
    const asset: any = {
      type: { name: 'Land' },
      title: { name: 'Naron Plot' },
      owner: { name: 'wallet.wam' },
    }

    render(<NFTCardDetailPanelRender asset={asset} />)
    expect(screen.getByText('wallet.wam')).toBeInTheDocument()
  })
})

describe('NFTCardBottomPanelRender', () => {
  it('renders each power row', () => {
    const MiningIconStub = () => <svg data-testid="mining-icon" />
    const asset: any = {
      cardPowers: [
        [
          { name: MiningIconStub, elementType: ELEMENTTYPES.NODE, styleConfig: {} },
          { name: '2.5', elementType: ELEMENTTYPES.TEXT, styleConfig: {} },
        ],
      ],
    }

    render(<NFTCardBottomPanelRender asset={asset} />)
    expect(screen.getByText('2.5')).toBeInTheDocument()
  })
})

describe('NFTShowAllRender', () => {
  it('renders nothing when the asset has no multiple mint types', () => {
    const asset: any = { multipleMintTypes: false, title: { name: 'Pickaxe' } }
    const { container } = render(<NFTShowAllRender asset={asset} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('lists mint numbers for matching repeated assets', () => {
    mockAtomicState = {
      assets: [
        {
          data: { name: 'Pickaxe' },
          template: { template_id: '1' },
          template_mint: 1,
          asset_id: 'a',
        },
        {
          data: { name: 'Pickaxe' },
          template: { template_id: '1' },
          template_mint: 2,
          asset_id: 'b',
        },
      ],
    }
    const asset: any = { multipleMintTypes: true, title: { name: 'Pickaxe' }, templateId: '1' }

    render(<NFTShowAllRender asset={asset} />)
    expect(screen.getByText('MINT NUMBERS')).toBeInTheDocument()
    expect(screen.getByText('1')).toBeInTheDocument()
    expect(screen.getByText('2')).toBeInTheDocument()
  })
})

describe('CommunityNFTCardOverlayRender', () => {
  it('renders the title and artist name, and a zoom button when provided', async () => {
    const zoom = jest.fn()
    const asset: any = { title: { name: 'Community Pick' }, artist: { name: 'Some Artist' } }

    render(<CommunityNFTCardOverlayRender asset={asset} zoom={zoom} />)
    expect(screen.getByText('Community Pick')).toBeInTheDocument()
    expect(screen.getByText('Some Artist')).toBeInTheDocument()

    await userEvent.click(screen.getByText('Zoom'))
    expect(zoom).toHaveBeenCalled()
  })
})

describe('NFTCardSetAvatar', () => {
  it('renders nothing for a non-Avatar asset', () => {
    const asset: any = { type: { name: 'Tool' }, assetId: { name: '1' } }
    const { container } = render(<NFTCardSetAvatar asset={asset} />)
    expect(container).toBeEmptyDOMElement()
  })

  it('sets the avatar when clicked for an Avatar asset', async () => {
    const asset: any = { type: { name: 'Avatar' }, assetId: { name: '1' } }
    render(<NFTCardSetAvatar asset={asset} />)

    await userEvent.click(screen.getByText('Set Avatar'))
    expect(mockSetAvatar).toHaveBeenCalledWith('1')
  })
})
