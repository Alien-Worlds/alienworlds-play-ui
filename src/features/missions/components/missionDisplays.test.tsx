import { fireEvent, render, renderHook, screen } from '@testing-library/react'
import { useMissionTimes } from 'features/missions/hooks/useMissionTimes'
import { buildExplorer, buildMission } from 'features/missions/testUtils/fixtures'
import { mockStore, renderMissions } from 'features/missions/testUtils/mockStore'
import { MissionStatus } from 'features/missions/types/missionsTypes'

import { MissionInfo } from './MissionInfo'
import { MissionMainTimer } from './MissionMainTimer/MissionMainTimer'
import {
  AvailableTriliumBalance,
  MissionRewardsBalance,
  StakedTriliumBalance,
} from './MissionsBalances/MissionsBalances'
import { MissionsCrafts } from './MissionsCrafts'
import { MissionsNewsletter } from './MissionsNewsletter/MissionsNewsletter'
import { MissionToClaimSound } from './MissionToClaimSound'
import { StakedTriliumBalance as BnbStakedTriliumBalance } from './StakedTriliumBalance/StakedTriliumBalance'
import { TriliumBSCBalance } from './TriliumBSCBalance/TriliumBSCBalance'

// The small missions components that only display store state.

jest.mock('store', () => jest.requireActual('features/missions/testUtils/mockStore').storeMock)
jest.mock(
  'shared/layouts',
  () => jest.requireActual('features/missions/testUtils/mocks').layoutsMock
)
jest.mock(
  'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon',
  () => jest.requireActual('features/missions/testUtils/mocks').glossaryIconMock
)

const mockPlay = jest.fn()
jest.mock('react-use', () => ({
  ...jest.requireActual('react-use'),
  useAudio: () => [null, {}, { play: mockPlay }],
}))

beforeEach(() => {
  jest.clearAllMocks()
})

describe('useMissionTimes', () => {
  it('has no times without a mission', () => {
    mockStore({ state: { main: { runtimeInSeconds: 0 } } })

    expect(renderHook(() => useMissionTimes(null)).result.current).toBeNull()
  })

  it('gives the status, label and time left, humanized', () => {
    mockStore({ state: { main: { runtimeInSeconds: 0 } } })
    const mission = buildMission({ status: MissionStatus.Departed })

    const { result } = renderHook(() => useMissionTimes(mission))

    expect(result.current.status).toBe(MissionStatus.Departed)
    expect(result.current.timeLabel).toBe('Finishing in:')
    expect(result.current.humanizedTime).toMatch(/^(59m \d+s|1h)$/)
  })
})

describe('MissionInfo', () => {
  const show = (status: MissionStatus, at = '/missions', investInfo = undefined) => {
    mockStore({ state: { main: { runtimeInSeconds: 0 } } })
    return renderMissions(<MissionInfo mission={buildMission({ status, investInfo })} />, { at })
  }

  it.each([
    [MissionStatus.Boarding, 'Info'],
    [MissionStatus.Soon, 'Info'],
  ])('offers info on a %s mission in the centre', (status, label) => {
    show(status)
    expect(screen.getByRole('button', { name: label })).toBeInTheDocument()
  })

  it.each([MissionStatus.Departed, MissionStatus.Completed])(
    'shows the status of a %s mission in the centre',
    (status) => {
      show(status)
      expect(screen.getByText(status)).toBeInTheDocument()
    }
  )

  it.each([
    [MissionStatus.Soon, 'Soon'],
    [MissionStatus.Boarding, 'Stationed'],
  ])('shows a %s mission as %s on My Missions', (status, label) => {
    show(status, '/missions/my')
    expect(screen.getByText(label)).toBeInTheDocument()
  })

  it('offers to claim a completed mission, and shows Claimed once withdrawn, on My Missions', () => {
    show(MissionStatus.Completed, '/missions/my')
    expect(screen.getByRole('button', { name: 'Claim' })).toBeInTheDocument()

    show(MissionStatus.Completed, '/missions/my', {
      numberOfShips: 1,
      totalStakeBNB: 0,
      totalStakeTLM: 1,
      withdrawn: true,
    })
    expect(screen.getByText('Claimed')).toBeInTheDocument()
  })
})

describe('MissionMainTimer', () => {
  it('shows the selected mission id and countdown', () => {
    mockStore({
      state: {
        main: { runtimeInSeconds: 0 },
        missions: { selectedMission: buildMission({ id: '7' }) },
      },
    })
    render(<MissionMainTimer />)

    expect(screen.getByText('ID: 7')).toBeInTheDocument()
    expect(screen.getByText('Starting in:')).toBeInTheDocument()
  })

  it('hides the countdown once completed, and renders nothing without a mission', () => {
    mockStore({
      state: {
        main: { runtimeInSeconds: 0 },
        missions: { selectedMission: buildMission({ id: '7', status: MissionStatus.Completed }) },
      },
    })
    const { container, rerender } = render(<MissionMainTimer />)
    expect(screen.queryByText('--')).not.toBeInTheDocument()

    mockStore({ state: { main: { runtimeInSeconds: 0 }, missions: { selectedMission: null } } })
    rerender(<MissionMainTimer />)
    expect(container).toBeEmptyDOMElement()
  })
})

describe('MissionsCrafts', () => {
  it('counts the departed explorer missions against the boarding ones', () => {
    mockStore({
      state: {
        missions: {
          explorer: buildExplorer([
            buildMission({ id: '1', status: MissionStatus.Departed }),
            buildMission({ id: '2', status: MissionStatus.Completed }),
          ]),
          availableMissions: [buildMission(), buildMission(), buildMission()],
        },
      },
    })
    render(<MissionsCrafts />)

    expect(screen.getByText('1 / 3')).toBeInTheDocument()
  })
})

describe('balances', () => {
  it('show the BSC TLM, staked TLM and rewards, with defaults', () => {
    mockStore({
      state: {
        web3: { bscTlmBalanceFormatted: null, bscStakedTlmBalanceFormatted: null },
        missions: { totalMissionsRewards: 0 },
      },
    })
    render(
      <>
        <AvailableTriliumBalance />
        <StakedTriliumBalance />
        <BnbStakedTriliumBalance />
        <MissionRewardsBalance />
      </>
    )

    expect(screen.getAllByText('0.0')).toHaveLength(3)
    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('show the formatted balances', () => {
    mockStore({
      state: {
        web3: { bscTlmBalanceFormatted: '1,234.5', bscStakedTlmBalanceFormatted: '20.0' },
        missions: { totalMissionsRewards: 1.23456 },
      },
    })
    render(
      <>
        <TriliumBSCBalance />
        <BnbStakedTriliumBalance />
        <MissionRewardsBalance />
      </>
    )

    expect(screen.getByText('1,234.5')).toBeInTheDocument()
    expect(screen.getByText('20.0')).toBeInTheDocument()
    expect(screen.getByText('1.2346')).toBeInTheDocument()
  })
})

describe('MissionsNewsletter', () => {
  it('ticks the box once subscribed, and opens the sign-up', async () => {
    ;(window as any).mootrack = jest.fn()
    mockStore({ state: { web3: { userWallet: null }, missions: { subscribedEmail: 'me@x.com' } } })
    renderMissions(<MissionsNewsletter />)

    const button = screen.getByRole('button', { name: /NEWS, UPDATES AND MORE!/ })
    expect(button.querySelector('svg')).not.toBeNull()

    fireEvent.click(button)
    expect(await screen.findByText(/After signing up for our newsletter/)).toBeInTheDocument()
  })
})

describe('MissionToClaimSound', () => {
  const play = (count: number, at = '/missions') => {
    mockStore({ state: { missions: { missionsToClaimCount: count } } })
    return renderMissions(<MissionToClaimSound />, { at })
  }

  it('plays when there are missions to claim on a missions page', () => {
    play(2)

    expect(mockPlay).toHaveBeenCalledTimes(1)
  })

  it('stays quiet with nothing to claim, or off the missions pages', () => {
    play(0).unmount()
    play(2, '/mining')

    expect(mockPlay).not.toHaveBeenCalled()
  })

  it('plays again when the count goes up, not when it goes down', () => {
    const { rerender } = play(2)

    mockStore({ state: { missions: { missionsToClaimCount: 3 } } })
    rerender(<MissionToClaimSound />)
    expect(mockPlay).toHaveBeenCalledTimes(2)

    mockStore({ state: { missions: { missionsToClaimCount: 1 } } })
    rerender(<MissionToClaimSound />)
    expect(mockPlay).toHaveBeenCalledTimes(2)
  })
})
