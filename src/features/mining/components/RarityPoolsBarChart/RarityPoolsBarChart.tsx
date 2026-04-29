import { FC, useCallback, useEffect, useRef, useState } from 'react'

import { useBreakpointValue, Flex } from '@chakra-ui/react'
import { RarityPool } from 'features/mining/types/RarityPoolTypes'
import { RarityPoolColors } from 'features/mining/utils/constants'
import { Colors } from 'shared/util/colors'
import { tresholdBuilder } from 'shared/util/helpers'
import { VictoryBar, VictoryLabel, VictoryTooltip, VictoryTooltipProps } from 'victory'

import { Constants } from '../../../../shared/util/constants'

interface RarityPoolsBarChartProps {
  rarityPools: RarityPool[]
}

type ChartSizeType = {
  height: number
  width: number
}

const CustomTooltip = (props: VictoryTooltipProps) => {
  const flyoutPadding = useBreakpointValue({ base: 3, sm: 10 })
  const tlmFontSize = useBreakpointValue({ base: 10, sm: 12 })
  const orbFontSize = useBreakpointValue({ base: 14, sm: 16 })

  return (
    <VictoryTooltip
      {...props}
      center={{ x: 100, y: 0 }}
      centerOffset={{ x: 0, y: -50 }}
      flyoutStyle={{
        fill: Colors.BLACK_SOLID_100,
        stroke: Colors.DI_SERRIA,
        strokeWidth: 1,
      }}
      style={{
        fill: Colors.SNOW_WHITE,
      }}
      flyoutPadding={flyoutPadding}
      labelComponent={
        <VictoryLabel
          lineHeight={1.3}
          style={[
            {
              fill: Colors.SNOW_WHITE,
              fontFamily: 'Titillium Web',
              fontSize: tlmFontSize,
              fontWeight: 600,
            },
            {
              fill: Colors.DI_SERRIA,
              fontFamily: 'Orbitron',
              fontSize: orbFontSize,
              fontWeight: 600,
            },
            {
              fill: Colors.SILVER,
              fontFamily: 'Titillium Web',
              fontSize: tlmFontSize,
              fontWeight: 300,
            },
          ]}
        />
      }
    />
  )
}

CustomTooltip.defaultEvents = VictoryTooltip.defaultEvents

const RarityPoolsBarChart: FC<RarityPoolsBarChartProps> = ({ rarityPools }) => {
  const victoryWidth = useBreakpointValue({ base: 200, sm: 200 })
  const victoryHeight = useBreakpointValue({ base: 110 })
  const chartRef = useRef(null)
  const [opacity, setOpacity] = useState(1)

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries?.forEach((entry) => {
        setOpacity(entry.intersectionRatio)
      })
    },
    [opacity]
  )

  const initObserver = (chartSize: ChartSizeType) => {
    const observer = new IntersectionObserver(handleIntersect, {
      root: null,
      rootMargin: `-${chartSize.height + Constants.MAIN_TOPBAR_HEIGHT}px 0px 0px 0px`,
      threshold: tresholdBuilder(),
    })
    observer.observe(chartRef.current)
    return observer
  }

  useEffect(() => {
    if (chartRef?.current && victoryHeight && victoryWidth) {
      const chartSize = { height: victoryHeight, width: victoryWidth }
      const observer = initObserver(chartSize)

      return () => observer.disconnect()
    }
    return () => null
  }, [chartRef?.current, victoryHeight, victoryWidth])

  return (
    <>
      {rarityPools && rarityPools?.length > 0 && (
        <Flex
          ref={chartRef}
          h={victoryHeight}
          w={victoryWidth}
          p={0}
          zIndex={1}
          position="relative"
          alignItems="flex-end"
          overflow="visible"
          opacity={opacity}
        >
          <VictoryBar
            x="rarityName"
            y="percentage"
            barWidth={20}
            width={victoryWidth}
            height={victoryHeight}
            data={rarityPools}
            padding={5}
            labels={({ datum }) => [
              `${datum.rarityName.toUpperCase()} Rarity Pool`,
              `${datum.amount}`,
              `(${datum.percentage}% of total pool)`,
            ]}
            labelComponent={<CustomTooltip />}
            style={{
              data: {
                fill: ({ datum }) => RarityPoolColors[datum.rarityName],
                overflow: 'visible',
              },
            }}
          />
        </Flex>
      )}
    </>
  )
}

export { RarityPoolsBarChart }
