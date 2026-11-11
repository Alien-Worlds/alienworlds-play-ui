import { fireEvent, screen, waitFor } from '@testing-library/react'
import { buildMission, buildPinata } from 'features/missions/testUtils/fixtures'
import { mockStore, renderMissions } from 'features/missions/testUtils/mockStore'
import { MissionRarity, MissionStatus, MissionType } from 'features/missions/types/missionsTypes'

import { ClaimRewards } from './ClaimRewards'

jest.mock('store', () => jest.requireActual('features/missions/testUtils/mockStore').storeMock)

const loadMissionRewards = jest.fn()
const claimMissionRewards = jest.fn()
const onClose = jest.fn()

const mission = buildMission({
  id: '7',
  status: MissionStatus.Completed,
  attributes: { name: 'Courier Run', missionType: MissionType.Battle },
  pinataNft: buildPinata({ rarity: MissionRarity.Epic, image: 'https://nft/epic.png' }),
})

const setup = (state: Record<string, any> = {}) => {
  mockStore({
    state: { missions: { missionRewards: null, missionRewardsLoading: false, ...state } },
    actions: { missions: { loadMissionRewards, claimMissionRewards } },
  })
  return renderMissions(<ClaimRewards mission={mission} onClose={onClose} />)
}

beforeEach(() => {
  jest.clearAllMocks()
})

describe('ClaimRewards', () => {
  it('loads the rewards for the mission', () => {
    setup()

    expect(loadMissionRewards).toHaveBeenCalledWith('7')
    expect(screen.getByText('Courier Run')).toBeInTheDocument()
    expect(screen.getByText('Battle')).toBeInTheDocument()
  })

  it('shows a spinner and no claim button while loading', () => {
    setup({ missionRewardsLoading: true })

    expect(screen.getByText('Loading...')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Claim Rewards' })).not.toBeInTheDocument()
  })

  it('shows the TLM and NFT rewards', () => {
    setup({ missionRewards: { tlm: '12.5', nft: '2' } })

    expect(screen.getByText('12.5')).toBeInTheDocument()
    expect(screen.getByText(/2x/)).toHaveTextContent('2x Rarity NFT')
    // Chakra shows the fallback until the image loads, which it never does in jsdom.
    expect(screen.getByAltText('NFT prize')).toBeInTheDocument()
  })

  it('closes after a successful claim', async () => {
    claimMissionRewards.mockResolvedValue(true)
    setup({ missionRewards: { tlm: '12.5', nft: '0' } })

    fireEvent.click(screen.getByRole('button', { name: 'Claim Rewards' }))

    expect(claimMissionRewards).toHaveBeenCalledWith('7')
    await waitFor(() => expect(onClose).toHaveBeenCalled())
  })

  it('stays open when the claim fails', async () => {
    claimMissionRewards.mockResolvedValue(false)
    setup({ missionRewards: { tlm: '12.5', nft: '0' } })

    fireEvent.click(screen.getByRole('button', { name: 'Claim Rewards' }))

    await waitFor(() => expect(claimMissionRewards).toHaveBeenCalled())
    expect(onClose).not.toHaveBeenCalled()
  })

  it('closes on Return', () => {
    setup()

    fireEvent.click(screen.getByRole('button', { name: 'Return' }))

    expect(onClose).toHaveBeenCalled()
  })
})
