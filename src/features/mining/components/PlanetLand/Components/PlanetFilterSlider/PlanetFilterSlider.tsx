import { useEffect, useState, VFC } from 'react'

import { FilterRangeIcon, LockIcon2 } from '@alien-worlds/icons'
import {
  Box,
  Center,
  Flex,
  Icon,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderThumb,
  RangeSliderTrack,
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
} from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'

export interface PlanetFilterSliderProps {
  icon: React.ReactNode | React.ReactNode[]
  initialValue: number | number[]
  title: string
  color: string
  min: number
  max: number
  step: number
  onChange: (val: number | number[]) => void
}

const PlanetFilterSlider: VFC<PlanetFilterSliderProps> = ({
  onChange,
  icon,
  initialValue,
  min,
  max,
  step,
  title,
  color,
}) => {
  const [value, setValue] = useState<number | number[]>([0, 0])

  useEffect(() => setValue(initialValue), [initialValue])

  return (
    <Flex w="full">
      <Flex
        direction="column"
        marginBottom="7px"
        alignItems="center"
        position="relative"
        width="100%"
        zIndex={1000}
      >
        <Flex height="30px" width="100%" color={color}>
          <Center mr="10px" ml="4px">
            {icon}
          </Center>
          <Text mr="auto" color={Colors.SNOW_WHITE} marginBottom="20px" fontFamily="tlm">
            {title}
          </Text>
          <Box width="fit-content" pr="2px">
            <Icon
              fontSize={30}
              color={color}
              cursor="pointer"
              onClick={() => (Array.isArray(value) ? setValue(value[1]) : setValue([min, value]))}
              as={Array.isArray(value) ? FilterRangeIcon : LockIcon2}
            />
          </Box>
        </Flex>

        <Flex direction="column" position="relative" width="100%">
          <Flex
            backgroundColor="transparent"
            color={Colors.MINE_SHAFT_100}
            fontFamily="tlm"
            justifyContent="center"
            fontWeight="semibold"
            letterSpacing="0.1em"
            cursor="pointer"
            py={2}
            px={4}
            borderRadius={20}
            whiteSpace="nowrap"
          >
            {Array.isArray(value) ? (
              <RangeSlider
                min={min}
                max={max}
                step={step}
                value={value}
                onChangeEnd={onChange}
                minStepsBetweenThumbs={1}
                color={Colors.MINE_SHAFT_100}
                onChange={(val) => setValue(val)}
              >
                <RangeSliderTrack>
                  <RangeSliderFilledTrack bg={color} />
                </RangeSliderTrack>
                <RangeSliderThumb fontSize="16px" letterSpacing="normal" boxSize="35px" index={0}>
                  {value[0]?.toFixed(1)}
                </RangeSliderThumb>
                <RangeSliderThumb fontSize="16px" letterSpacing="normal" boxSize="35px" index={1}>
                  {value[1]?.toFixed(1)}
                </RangeSliderThumb>
              </RangeSlider>
            ) : (
              <Slider
                min={min}
                max={max}
                step={step}
                value={value}
                flex="1 1 auto"
                onChangeEnd={onChange}
                onChange={(val) => setValue(val)}
              >
                <SliderTrack>
                  <SliderFilledTrack bg={color} />
                </SliderTrack>
                <SliderThumb
                  bg={color}
                  boxSize="35px"
                  fontSize="16px"
                  letterSpacing="normal"
                  color={Colors.SNOW_WHITE}
                >
                  {value?.toFixed(1)}
                </SliderThumb>
              </Slider>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}

export { PlanetFilterSlider }
