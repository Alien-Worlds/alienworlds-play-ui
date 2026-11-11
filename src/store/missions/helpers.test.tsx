import { render } from '@testing-library/react'
import { BigNumber } from 'ethers'
import {
  buildInvestInfo,
  buildMission,
  buildPinata,
  epochNow,
} from 'features/missions/testUtils/fixtures'
import {
  bindMissionView,
  bindMissionViews,
  getMaxShipsToLease,
  getMissionReward,
  getMissionSpacecrafts,
  getStatusAndTimes,
  isEmpty,
  MissionTypeIcon,
} from 'store/missions/helpers'
import { MissionRarity, MissionStatus, MissionType } from 'store/missions/types'

describe('getStatusAndTimes', () => {
  const now = epochNow()

  it('is Completed with no time left once the mission has ended', () => {
    expect(
      getStatusAndTimes({ boardingTime: now - 300, launchTime: now - 200, endTime: now - 1 } as any)
    ).toEqual({ status: MissionStatus.Completed, time: 0, timeLabel: '--' })
  })

  it('is Departed, counting down to the end, after launch', () => {
    const { status, time, timeLabel } = getStatusAndTimes({
      boardingTime: now - 300,
      launchTime: now - 200,
      endTime: now + 500,
    } as any)
    expect(status).toBe(MissionStatus.Departed)
    expect(timeLabel).toBe('Finishing in:')
    expect(time).toBeGreaterThanOrEqual(499)
    expect(time).toBeLessThanOrEqual(500)
  })

  it('is Boarding, counting down to launch, between boarding and launch', () => {
    const { status, time, timeLabel } = getStatusAndTimes({
      boardingTime: now - 100,
      launchTime: now + 400,
      endTime: now + 900,
    } as any)
    expect(status).toBe(MissionStatus.Boarding)
    expect(timeLabel).toBe('Starting in:')
    expect(time).toBeGreaterThanOrEqual(399)
  })

  it('is Soon, counting down to boarding, before boarding opens', () => {
    const { status, time, timeLabel } = getStatusAndTimes({
      boardingTime: now + 100,
      launchTime: now + 400,
      endTime: now + 900,
    } as any)
    expect(status).toBe(MissionStatus.Soon)
    expect(timeLabel).toBe('Boarding in:')
    expect(time).toBeGreaterThanOrEqual(99)
  })
})

describe('getMissionReward and getMissionSpacecrafts', () => {
  it('shows the reward in TLM (4 decimals on chain), or n/a without one', () => {
    expect(getMissionReward(10, 1234500000)).toBe('123,450')
    expect(getMissionReward(10, 0)).toBe('n/a')
    expect(getMissionReward(10, null)).toBe('n/a')
  })

  it('formats the spacecraft count', () => {
    expect(getMissionSpacecrafts(12000)).toBe('12,000')
    expect(getMissionSpacecrafts(0)).toBe('0')
  })

  it('treats null, undefined and 0 as empty', () => {
    expect(isEmpty(null)).toBe(true)
    expect(isEmpty(undefined)).toBe(true)
    expect(isEmpty(0)).toBe(true)
    expect(isEmpty(5)).toBe(false)
  })
})

describe('bindMissionView', () => {
  it('builds the view from the attributes and the mission NFT', () => {
    const mission = buildMission({
      raw: true,
      status: MissionStatus.Boarding,
      attributes: { reward: 1000000, totalShips: 10, duration: 2 * 86400 + 3 * 3600 },
      pinataNft: buildPinata({ rarity: MissionRarity.Epic, series: 2, cardNumber: 5 }),
    })

    const { view } = bindMissionView(mission)

    expect(view).toMatchObject({
      status: MissionStatus.Boarding,
      timeLabel: 'Starting in:',
      progressInPercentage: null,
      rarity: MissionRarity.Epic,
      rarityColor: '#9449db',
      hoverColor: 'rgba(135, 35, 217, .3)',
      textColor: 'white',
      statusColor: '#d9a555',
      series: '2',
      cardNumber: '5',
      basePower: '10',
      boostPower: '2',
      craftingKey: 'Key A',
      duration: '2 days, 3 hours',
      rewardPerShip: '10',
      stakedTlm: '0',
      stakedShips: 0,
    })
  })

  it('shows the staked TLM and ships from the explorer invest info', () => {
    const { view } = buildMission({
      attributes: { spaceshipCost: 10000 },
      investInfo: buildInvestInfo({ totalStakeTLM: 30000 }),
    })

    expect(view.stakedTlm).toBe('3.0')
    expect(view.stakedShips).toBe(3)
  })

  it('tracks progress while departed, and colours by status', () => {
    const departed = buildMission({ status: MissionStatus.Departed }).view
    expect(departed.progressInPercentage).toBe(50)
    expect(departed.textColor).toBe('#ff3b52')
    expect(departed.statusColor).toBe('#ff3b52')

    const completed = buildMission({ status: MissionStatus.Completed }).view
    expect(completed.textColor).toBe('#959595')
    expect(completed.statusColor).toBe('#959595')
  })

  it('falls back to Common colours and empty traits without an NFT', () => {
    const { view } = buildMission({ pinataNft: null })

    expect(view.rarity).toBeUndefined()
    expect(view.rarityColor).toBe('#c6c6c6')
    expect(view.series).toBe('')
  })

  it('shows n/a per ship without a reward, and the whole reward with no ships', () => {
    expect(buildMission({ attributes: { reward: 0 } }).view.rewardPerShip).toBe('n/a')
    expect(buildMission({ attributes: { reward: 50000, totalShips: 0 } }).view.rewardPerShip).toBe(
      '5'
    )
  })

  it('binds every mission in a list, and ignores a missing list', () => {
    const missions = [buildMission({ raw: true, id: '1' }), buildMission({ raw: true, id: '2' })]
    bindMissionViews(missions)
    expect(missions.every((m) => m.view?.status === MissionStatus.Boarding)).toBe(true)
    expect(() => bindMissionViews(null)).not.toThrow()
  })
})

describe('getMaxShipsToLease', () => {
  it('is how many whole spacecrafts the BSC TLM balance pays for', () => {
    const mission = buildMission({ attributes: { spaceshipCost: 10000 } })
    expect(getMaxShipsToLease(BigNumber.from(35000), mission)).toBe(3)
    expect(getMaxShipsToLease(BigNumber.from(9999), mission)).toBe(0)
  })
})

describe('MissionTypeIcon', () => {
  it('renders an icon per mission type, and nothing for an unknown one', () => {
    const { container, rerender } = render(
      <MissionTypeIcon type={MissionType.Battle} boxSize={20} />
    )
    expect(container.querySelector('svg')).not.toBeNull()

    rerender(<MissionTypeIcon type={MissionType.Unknown} boxSize={20} />)
    expect(container.querySelector('svg')).toBeNull()
  })
})
