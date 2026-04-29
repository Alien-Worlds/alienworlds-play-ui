import { useEffect, useRef, useState, VFC } from 'react'

import { useAudio } from 'react-use'
import { useActivePath } from 'shared/hooks/useRouter'
import { useAppState } from 'store'
import { PagePath } from 'store/main/types'

const MissionToClaimSound: VFC = () => {
  const {
    missions: { missionsToClaimCount },
  } = useAppState()

  const [audio, , controls] = useAudio({
    src: '/sounds/aw-missions-claim-sfx-01.mp3',
    autoPlay: false,
  })

  const shouldPlaySound = useRef(false)
  const missionPage = useActivePath([
    PagePath.Missions,
    PagePath.MissionsExplorer,
    PagePath.MissionsInventory,
  ])

  const [missionsToClaimCountLocal, setMissionsToClaimCountLocal] = useState<number>(null)

  useEffect(() => {
    if (!missionsToClaimCountLocal) {
      setMissionsToClaimCountLocal(missionsToClaimCount)
      if (missionsToClaimCount > 0) {
        shouldPlaySound.current = true
      }
    } else if (missionsToClaimCountLocal < missionsToClaimCount) {
      setMissionsToClaimCountLocal(missionsToClaimCount)
      shouldPlaySound.current = true
    }

    // Play sound only on listed pages
    if (!missionPage) {
      shouldPlaySound.current = false
    }

    if (shouldPlaySound.current) {
      controls.play()
      shouldPlaySound.current = false
    }
  }, [missionsToClaimCount])

  return <>{audio}</>
}

export { MissionToClaimSound }
