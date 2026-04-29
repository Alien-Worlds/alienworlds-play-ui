import { useEffect, useState, FC } from 'react'

import { Flex, FlexProps } from '@chakra-ui/react'
import { isUndefined } from 'lodash'
import { useEffectOnce } from 'react-use'
import { v4 } from 'uuid'

export enum RingPositions {
  TOP_CENTER,
  TOP_LEFT,
  TOP_RIGHT,
  BOTTOM_CENTER,
  BOTTOM_LEFT,
  BOTTOM_RIGHT,
  CENTER,
  CENTER_LEFT,
  CENTER_RIGHT,
}

export interface RingPositionHelperProps {
  posXY: RingPositions
  innerWidth?: string | number
  innerHeight?: string | number
  offsetTop?: string | number
  offsetBottom?: string | number
  offsetLeft?: string | number
  offsetRight?: string | number
  children?: string | JSX.Element | JSX.Element[] | (() => JSX.Element)
}

export interface RingPosition {
  justifyContent: string
  alignItems: string
  mt?: string | number
  mr?: string | number
  mb?: string | number
  ml?: string | number
}

export interface RingElementProps {
  children?: string | JSX.Element | JSX.Element[] | (() => JSX.Element)
}

const RingElement: FC<FlexProps> = ({ children, w, h, mt, mr, mb, ml, ...props }) => {
  return (
    <Flex
      w={w || 'auto'}
      h={h || 'min-content'}
      p={0}
      mt={mt || 0}
      mr={mr || 0}
      mb={mb || 0}
      ml={ml || 0}
      boxSizing="border-box"
      {...props}
    >
      {children}
    </Flex>
  )
}

const RingPositionHelper: FC<RingPositionHelperProps & FlexProps> = ({
  posXY,
  children,
  offsetTop,
  offsetRight,
  offsetBottom,
  offsetLeft,
  ...props
}) => {
  const [uid, setUid] = useState<string>('')
  const [ringPosition, setRingPosition] = useState<RingPosition>({
    justifyContent: 'center',
    alignItems: 'center',
    mt: offsetTop || 'auto',
    mr: offsetRight || 'auto',
    mb: offsetBottom || 'auto',
    ml: offsetLeft || 'auto',
  })

  useEffectOnce(() => setUid(v4()))

  useEffect(() => {
    switch (posXY) {
      default:
      case RingPositions.CENTER:
        setRingPosition({
          justifyContent: 'center',
          alignItems: 'center',
        })
        break
      case RingPositions.BOTTOM_CENTER:
        setRingPosition({
          justifyContent: 'center',
          alignItems: 'flex-end',
        })
        break
      case RingPositions.BOTTOM_LEFT:
        setRingPosition({
          justifyContent: 'flex-start',
          alignItems: 'flex-end',
        })
        break
      case RingPositions.BOTTOM_RIGHT:
        setRingPosition({
          justifyContent: 'flex-end',
          alignItems: 'flex-end',
        })
        break
      case RingPositions.TOP_CENTER:
        setRingPosition({
          justifyContent: 'center',
          alignItems: 'flex-start',
        })
        break
      case RingPositions.TOP_LEFT:
        setRingPosition({
          justifyContent: 'flex-start',
          alignItems: 'flex-start',
        })
        break
      case RingPositions.TOP_RIGHT:
        setRingPosition({
          justifyContent: 'flex-end',
          alignItems: 'flex-start',
        })
        break
      case RingPositions.CENTER_LEFT:
        setRingPosition({
          justifyContent: 'flex-start',
          alignItems: 'center',
        })
        break
      case RingPositions.CENTER_RIGHT:
        setRingPosition({
          justifyContent: 'flex-end',
          alignItems: 'center',
        })
    }
  }, [])

  return (
    <Flex
      className={`ring-position-helper-${uid}`}
      w="full"
      h="full"
      top={0}
      left={0}
      p={0}
      m={0}
      position="absolute"
      {...props}
      {...ringPosition}
    >
      <RingElement
        className={`ring-element-${uid}`}
        mt={!isUndefined(offsetTop) ? offsetTop : '0'}
        mr={!isUndefined(offsetRight) ? offsetRight : '0'}
        mb={!isUndefined(offsetBottom) ? offsetBottom : '0'}
        ml={!isUndefined(offsetLeft) ? offsetLeft : '0'}
        {...ringPosition}
      >
        {children}
      </RingElement>
    </Flex>
  )
}

export { RingPositionHelper }
