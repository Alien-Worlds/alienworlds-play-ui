import { useEffect, useRef, useState, VFC } from 'react'

import { Duration } from 'luxon'
import { useAudio } from 'react-use'
import { useAppState } from 'store'

const MiningReadySound: VFC = () => {
  const {
    main: { mineDelay },
  } = useAppState()

  const [audio, , controls] = useAudio({
    src: '/sounds/aw-mining-claim-sfx-02.mp3',
    autoPlay: false,
  })

  const soundPlayed = useRef(false)
  const threadIsWorking = useRef(false)
  const [delay, setDelay] = useState<Duration | null>(null)

  const tryPlay = async () => {
    try {
      await controls.play()
      return true
    } catch (e) {
      // console.info(e)
    }
    return false
  }

  useEffect(() => {
    if (mineDelay) {
      setDelay(mineDelay)
    }
    return () => {
      setDelay(null)
    }
  }, [mineDelay])

  useEffect(() => {
    if (threadIsWorking.current) return

    threadIsWorking.current = true

    if (delay === null) {
      threadIsWorking.current = false
    } else if (delay.toMillis() === 0) {
      if (soundPlayed.current) {
        threadIsWorking.current = false
        return
      }

      tryPlay().then((wasPlayed) => {
        if (wasPlayed) {
          soundPlayed.current = true
        }
        threadIsWorking.current = false
      })
    } else if (delay.toMillis() > 0) {
      if (soundPlayed.current) {
        soundPlayed.current = false
      }
      threadIsWorking.current = false
    }
  }, [delay])

  return <>{audio}</>
}

export { MiningReadySound }
