import { FC, useRef, useEffect, useState } from 'react'

import { PlaceRing, PLACE_VARIANT } from '@alien-worlds/uikit'
import { Box, SkeletonCircle } from '@chakra-ui/react'
import { useIntersection, useDebounce } from 'react-use'
import { fallbackAvatarSrc } from 'shared/util/helpers'
import { useActions, useAppState } from 'store'
import { v4 as uuidV4 } from 'uuid'

export const LazyAvatarRing: FC<{
  playerWalletId: string
  viewportContainer: HTMLDivElement
  radius: number
  variant: PLACE_VARIANT
}> = ({ playerWalletId, viewportContainer, radius, variant }) => {
  const intersectionRef = useRef(null)
  const [visible, setVisible] = useState(false)
  const [trigger, setTrigger] = useState(null)
  const [avatarImage, setAvatarImage] = useState(fallbackAvatarSrc)
  const intersection = useIntersection(intersectionRef, {
    root: viewportContainer,
    rootMargin: '0px',
    threshold: 0.5,
  })
  const {
    wax: { cachePlayerProfileImageURL },
  } = useActions()

  const {
    wax: { playersImageMap },
  } = useAppState()

  const [, cancel] = useDebounce(
    () => {
      cachePlayerProfileImageURL(playerWalletId)
        .then(() => {
          setVisible(true)
        })
        .catch(() => {
          setAvatarImage(fallbackAvatarSrc)
          setVisible(true)
        })
    },
    1000,
    [trigger]
  )

  useEffect(() => {
    if (!visible) {
      if (intersection?.isIntersecting) {
        setTrigger(uuidV4())
      } else {
        cancel()
      }
    }
  }, [intersection])

  useEffect(() => {
    if (playersImageMap && playersImageMap[playerWalletId]) {
      setAvatarImage(playersImageMap[playerWalletId])
    }
  }, [playersImageMap])

  return (
    <Box ref={intersectionRef} display="block">
      {visible && (
        <PlaceRing variant={variant} src={avatarImage} radius={radius} fallbackSrc={avatarImage} />
      )}
      {!visible && <SkeletonCircle size={`${radius * 4}`} />}
    </Box>
  )
}
