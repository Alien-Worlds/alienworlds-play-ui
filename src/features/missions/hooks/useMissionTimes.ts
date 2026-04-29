import { useMemo } from 'react'

import { humanizeMissionTime } from 'shared/util/duration-humanizer'
import { useAppState } from 'store'
import { getStatusAndTimes } from 'store/missions/helpers'
import { Mission, MissionStatus } from 'store/missions/types'

export type MissionTimes = {
  status: MissionStatus
  timeInSeconds: number
  timeLabel: string
  humanizedTime: string
}

export const useMissionTimes = (mission?: Mission | null): MissionTimes | null => {
  const {
    main: { runtimeInSeconds },
  } = useAppState()

  return useMemo(() => {
    if (!mission?.attributes) {
      return null
    }

    const { status, time, timeLabel } = getStatusAndTimes(mission.attributes)

    return {
      status,
      timeInSeconds: time,
      timeLabel,
      humanizedTime: humanizeMissionTime(time * 1000),
    }
  }, [mission?.attributes, runtimeInSeconds])
}
