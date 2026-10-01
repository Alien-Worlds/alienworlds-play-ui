import { registerSyncScheduler, scheduleSync } from './syncScheduler'

describe('syncScheduler', () => {
  it('passes each key to the registered scheduler', () => {
    const scheduler = jest.fn()
    registerSyncScheduler(scheduler)

    scheduleSync(['assets', 'bag'], 15)

    expect(scheduler.mock.calls).toEqual([
      ['assets', 15],
      ['bag', 15],
    ])
  })
})
