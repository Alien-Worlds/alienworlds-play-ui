import { useState, useEffect, useMemo } from 'react'

import { CheckmarkIcon } from '@alien-worlds/icons'
import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputRightElement,
  ResponsiveValue,
  Spinner,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'

const MotionBox = motion(Box)

const Tag = ({
  fontSize,
  fontWeight,
  width,
  textAlign,
  color,
}: {
  fontSize?: string
  width?: string
  textAlign?: ResponsiveValue<any>
  fontWeight?: number | string
  color?: string
}) => {
  const {
    wax: {
      isDemoUser,
      currentTag,
      player,
      isSettingTag,
      isAuthenticating,
      isLoggedIn,
      isOnboarded,
    },
  } = useAppState()

  const {
    wax: { setTag },
  } = useActions()

  const [localTag, setLocalTag] = useState('')

  useEffect(() => {
    if (player) {
      setLocalTag(player.tag)
    }
  }, [player])

  const canSetTag = useMemo(
    () =>
      !isSettingTag &&
      player?.tag !== localTag &&
      localTag?.length >= 4 &&
      localTag?.length <= 10 &&
      isOnboarded,
    [player, localTag]
  )
  if ((!isLoggedIn || isAuthenticating) && currentTag) {
    return <></>
  }
  return (
    <MotionBox width={width ?? { base: '135px', md: '150px' }}>
      <Flex
        direction="column"
        fontFamily="Titillium Web"
        color={color || Colors.ALTO}
        width="100%"
        display="inline-block"
      >
        <InputGroup color="white">
          <Input
            textAlign={textAlign ?? 'start'}
            fontSize={fontSize ?? '22px'}
            fontWeight={fontWeight ?? '400'}
            lineHeight={1}
            maxLength={10}
            disabled={isDemoUser}
            _disabled={{ color: Colors.SNOW_WHITE }}
            isReadOnly={!isOnboarded}
            value={localTag || currentTag || ''}
            onChange={(e) => setLocalTag(e.target.value)}
            variant="unstyled"
            // Added color prop to change text color
            onKeyDown={(k) => {
              if (k.key === 'Enter' && canSetTag) {
                setTag(localTag || currentTag)
              }
            }}
          />
          {canSetTag && (
            <InputRightElement
              onClick={() => {
                setTag(localTag)
              }}
              cursor="pointer"
            >
              {isSettingTag ? (
                <Spinner />
              ) : (
                <CheckmarkIcon boxSize={25} color={Colors.SECONDARY_GREEN} />
              )}
            </InputRightElement>
          )}
        </InputGroup>
      </Flex>
    </MotionBox>
  )
}

export { Tag }
