//import { getYeomenText } from 'util/yeomen'

import { FC } from 'react'

import { DetailsOldIcon } from '@alien-worlds/icons'
import { Box, Flex, Text } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'

interface PercentageBarProps {
  title: string
  percentage: number
  showPercentageLabel?: boolean
}

const getColorByPercentage = (percentage: number) => {
  let color: string
  // 0 - 16 blue
  if (percentage >= 0 && percentage <= 16) {
    color = Colors.AQUA
  } else if (percentage > 16 && percentage <= 32) {
    color = Colors.ROBINS_EGG_BLUE
  } else if (percentage > 32 && percentage <= 48) {
    color = Colors.INCH_WORM
  } else if (percentage > 48 && percentage <= 64) {
    color = Colors.SCHOOL_BUS_YELLOW
  } else if (percentage > 64 && percentage <= 80) {
    color = Colors.TANGERINE
  } else if (percentage > 80 && percentage <= 100) {
    color = Colors.RADICAL_RED
  }

  return color
}

const Battery: FC<PercentageBarProps> = ({ title, percentage, showPercentageLabel = true }) => {
  const batteryPercentage = percentage > 100 ? 100 : percentage // set max to 100
  const batteryColor = getColorByPercentage(batteryPercentage)

  return (
    <Flex width="full" textAlign="center" fontFamily="orb" flexDirection="column" gap={2}>
      <Text fontWeight={700} color={Colors.SNOW_WHITE} fontSize={{ base: 12, md: 16 }}>
        {title}
      </Text>
      <Box padding="2px" borderRadius="4px" borderColor={Colors.SNOW_WHITE} border="2px solid">
        <Box width={`${batteryPercentage}%`} bg={batteryColor} height={3.5} borderRadius="2px" />
      </Box>
      {showPercentageLabel && (
        <Text fontWeight={400} color={batteryColor}>
          {percentage > 1 ? percentage : '<1'}%
        </Text>
      )}
    </Flex>
  )
}

const WaxResources: FC = () => {
  const {
    main: { isCompactSidebar },
    wax: { resources },
  } = useAppState()
  const {
    main: { toggleMainDrawer },
    modal: { setSecondaryModalActive },
  } = useActions()

  if (resources === null) {
    return <></>
  }

  const WaxResourcesTitle = () => {
    if (isCompactSidebar) {
      return (
        <Text
          textAlign="center"
          fontWeight={600}
          marginBottom="15px"
          color={Colors.ALTO}
          fontFamily="orb"
          fontSize={12}
        >
          WAX Res-s
        </Text>
      )
    }
    return (
      <Text
        textAlign="center"
        fontWeight={600}
        marginBottom="15px"
        color={Colors.ALTO}
        fontFamily="orb"
        fontSize={16}
      >
        WAX Resources
      </Text>
    )
  }

  return (
    <>
      <Flex
        alignItems="center"
        bg={Colors.MINE_SHAFT}
        px={isCompactSidebar ? 2 : 7}
        py={isCompactSidebar ? 3 : 4}
        borderRadius={isCompactSidebar ? 'lg' : '2xl'}
        flexDirection="column"
      >
        <WaxResourcesTitle />

        <Flex
          width="full"
          justifyContent="center"
          marginBottom="10px"
          gap={5}
          flexDirection={isCompactSidebar ? 'column' : 'row'}
        >
          <Battery
            title="CPU"
            percentage={Math.round(resources.percCPU)}
            showPercentageLabel={!isCompactSidebar}
          />
          <Battery
            title="NET"
            percentage={Math.round(resources.percNET)}
            showPercentageLabel={!isCompactSidebar}
          />
          <Battery
            title="RAM"
            percentage={Math.round(resources.percRAM)}
            showPercentageLabel={!isCompactSidebar}
          />
        </Flex>

        {/* {!isCompactSidebar && (
          <Flex width="100%" justifyContent="center">
            <Box textAlign="center">
              <Text
                fontWeight={400}
                fontSize={12}
                color={Colors.ALTO}
                fontFamily="Orbitron"
                marginTop="20px"
              >
                {getYeomenText()}
              </Text>
            </Box>
          </Flex>
        )} */}

        <Flex
          gap={2}
          justifyContent="center"
          alignItems="center"
          color={Colors.ALTO}
          cursor="pointer"
          _hover={{
            transform: 'scale(1.1)',
            transition: 'transform 0.3s ease',
          }}
          onClick={() => {
            toggleMainDrawer(false)
            setSecondaryModalActive({ modalName: 'NetworkResourcesModal', value: true })
          }}
          wrap="wrap"
          mt="20px"
        >
          <DetailsOldIcon boxSize={22} />

          <Text fontSize={isCompactSidebar ? 'sm' : 'md'} fontWeight="bold">
            Details
          </Text>
        </Flex>
      </Flex>
    </>
  )
}

export { WaxResources }
