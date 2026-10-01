// Lets code outside Overmind ask its sync loop to reload something sooner, e.g. reload the
// player's assets 15s after a transaction changes them. Overmind's loaders still own that data
// and their schedule (main.syncAi); store/main registers the real scheduler on start-up.

export type SyncKey = 'assets' | 'avatar' | 'bag' | 'land' | 'planets'

type Scheduler = (key: SyncKey, inSeconds: number) => void

let scheduler: Scheduler = () => {}

export const registerSyncScheduler = (fn: Scheduler) => {
  scheduler = fn
}

/** Asks the sync loop to reload `keys` in `inSeconds` seconds. */
export const scheduleSync = (keys: SyncKey[], inSeconds: number) => {
  keys.forEach((key) => scheduler(key, inSeconds))
}
