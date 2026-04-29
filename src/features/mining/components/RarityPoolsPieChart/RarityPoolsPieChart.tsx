import { FC, useState } from 'react'

import { Box, Flex, Text, Grid } from '@chakra-ui/react'
import { RarityPool } from 'features/mining/types/RarityPoolTypes'
import { NftRarity, RarityPoolColors } from 'features/mining/utils/constants'
import { map, startCase } from 'lodash'
import { Colors } from 'shared/util/colors'
import { useScreenSize } from 'shared/util/hooks'
import { VictoryContainer, VictoryPie } from 'victory'

interface RarityPoolsBarChartProps {
  rarityPools: RarityPool[]
}
const RarityPoolsPieChart: FC<RarityPoolsBarChartProps> = ({ rarityPools }) => {
  const { isMobile } = useScreenSize()

  const [hoveredIndex, setHoveredIndex] = useState<number>(null)

  const CustomLegend = () => {
    return (
      <Grid
        gridTemplateColumns={{ base: 'repeat(2, 1fr)', md: 'repeat(1, 1fr)' }}
        gap={7}
        mt={5}
        width="full"
        justifyContent="center"
      >
        {map(rarityPools, (rarityPool) => {
          return (
            <Flex key={rarityPool.rarityName} flexDirection="row" gap={3} width="max-content">
              <Box
                background={RarityPoolColors[rarityPool.rarityName]}
                w={4}
                h={8}
                borderRadius="base"
              />

              <Box>
                <Text fontSize="md" lineHeight={3}>
                  {startCase(rarityPool.rarityName)} ({rarityPool.percentage}%)
                </Text>
                <Text fontSize="md" color={Colors.DI_SERRIA} fontFamily="orb">
                  {rarityPool.amount}
                </Text>
              </Box>
            </Flex>
          )
        })}
      </Grid>
    )
  }

  const PieChartContainer = ({ children }) => {
    const sizeProps = {
      width: 400,
      height: 400,
    }

    if (isMobile) {
      return (
        <VictoryContainer {...sizeProps} responsive>
          {children}
        </VictoryContainer>
      )
    }

    return <svg {...sizeProps}>{children}</svg>
  }

  return (
    <Flex flexDirection="column" gap={8}>
      <Flex flexDirection={{ base: 'column', md: 'row' }} gap={8}>
        <Box>
          <Text fontSize="xl" mb={3} fontFamily="orb" textAlign="center">
            Pool Details
          </Text>
          <PieChartContainer>
            <VictoryPie
              width={400}
              height={400}
              standalone={false}
              padding={{ top: 20, bottom: 20 }}
              data={rarityPools}
              x="rarityName"
              y="percentage"
              labelRadius={100}
              labels={({ datum }) => `${datum.percentage}%`}
              style={{
                data: {
                  stroke: Colors.SNOW_WHITE,
                  strokeWidth: 1.5,
                  opacity: ({ index }) => (hoveredIndex === index ? 0.8 : 1),
                  transition: 'opacity 0.2s',
                  fill: ({ datum }) => RarityPoolColors[datum.rarityName],
                },
                labels: {
                  fontSize: 18,
                  fill: ({ datum }) =>
                    datum.rarityName === NftRarity.abundant
                      ? Colors.BLACK_SOLID_100
                      : Colors.SNOW_WHITE,
                },
              }}
              events={[
                {
                  target: 'data',
                  eventHandlers: {
                    onMouseOver: (_evt, data) => setHoveredIndex(data.index),
                    onMouseOut: () => setHoveredIndex(null),
                  },
                },
              ]}
            />

            {/* Opacity border for Pie */}
            <circle
              cx={200}
              cy={200}
              r={175}
              style={{
                stroke: Colors.SNOW_WHITE_ALPHA_50,
                strokeWidth: 10,
                fill: 'none',
              }}
            />
          </PieChartContainer>
        </Box>

        <CustomLegend />
      </Flex>

      {/* <Link
        width="100%"
        target="_blank"
        textAlign="center"
        textDecoration="underline"
        textDecorationColor={Colors.GRAY_CHATEAU}
        href="https://aw-metrics.yeomen.ai/d/g_cjfAD4z/alienworlds-planet-info?orgId=1&from=now-1h&to=now&refresh=5s"
      >
        <Text
          fontSize={{
            base: 'md',
            md: 'lg',
          }}
          fontWeight={400}
          fontFamily="orb"
          lineHeight="30px"
          color={Colors.GRAY_CHATEAU}
        >
          Real-Time All Planet Pools Data Feed
        </Text>
      </Link> */}
    </Flex>
  )
}

export { RarityPoolsPieChart }
