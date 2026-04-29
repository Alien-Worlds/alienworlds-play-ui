import { Box, Flex, HStack, Text, useBreakpoint } from '@chakra-ui/react'
import {
  UserLevelsBadge,
  UserLevelsBadgeTitle,
} from 'shared/components/UserLevelsBadges/UserLevelsBadges'
import { Colors } from 'shared/util/colors'
import { formatUserPointsWithDecimal } from 'shared/util/helpers'

type UserPointProgressBarTypes = {
  value: number

  currentRank?: number
  nextRank?: number
  total: number
}

const rankProperties = {
  '1': {
    filledSegmentColor: Colors.GRADIENT_SCORPION,
    unfilledSegmentColor: Colors.GRADIENT_MINE_SHAFT,
    nextLevelBadgeBg: Colors.GRADIENT_SILVER_CHALICE,
    currentBadgeWidth: {
      base: '70px',
      sm: '70px',
      md: '80px',
      lg: '80px',
      xl: '80px',
      '2xl': '80px',
    },
    currentBadgeHeight: {
      base: '70px',
      sm: '70px',
      md: '80px',
      lg: '80px',
      xl: '80px',
      '2xl': '80px',
    },
    currentBadgeTitleSize: {
      base: '14px',
      sm: '20px',
      md: '20px',
      lg: '24px',
      xl: '24px',
      '2xl': '24px',
    },
    left: { base: 5, sm: 5, md: 4, lg: 4, xl: 4, '2xl': 5 },
  },
  '2': {
    filledSegmentColor: Colors.GRADIENT_SCORPION,
    unfilledSegmentColor: Colors.GRADIENT_MINE_SHAFT,
    nextLevelBadgeBg: Colors.GRADIENT_SILVER_CHALICE,
    currentBadgeWidth: {
      base: '90px',
      sm: '90px',
      md: '100px',
      lg: '100px',
      xl: '110px',
      '2xl': '110px',
    },
    currentBadgeHeight: {
      base: '70px',
      sm: '70px',
      md: '80px',
      lg: '80px',
      xl: '90px',
      '2xl': '90px',
    },
    currentBadgeTitleSize: {
      base: '14px',
      sm: '20px',
      md: '20px',
      lg: '24px',
      xl: '24px',
      '2xl': '24px',
    },
    left: { base: 6, sm: 6, md: 10, lg: 10, xl: 10, '2xl': 10 },
  },
  '3': {
    filledSegmentColor: Colors.GRADIENT_SCORPION,
    unfilledSegmentColor: Colors.GRADIENT_MINE_SHAFT,
    nextLevelBadgeBg: Colors.GRADIENT_DANUBE,
    currentBadgeWidth: {
      base: '90px',
      sm: '110px',
      md: '120px',
      lg: '120px',
      xl: '120px',
      '2xl': '120px',
    },
    currentBadgeHeight: {
      base: '56px',
      sm: '70px',
      md: '74px',
      lg: '74px',
      xl: '74px',
      '2xl': '74px',
    },
    currentBadgeTitleSize: {
      base: '14px',
      sm: '20px',
      md: '20px',
      lg: '20px',
      xl: '20px',
      '2xl': '20px',
    },
    left: { base: 10, sm: 10, md: 10, lg: 12, xl: 12, '2xl': 12 },
  },
  '4': {
    filledSegmentColor: Colors.GRADIENT_DODGER_BLUE,
    unfilledSegmentColor: Colors.GRADIENT_BISCAY,
    nextLevelBadgeBg: Colors.GRADIENT_HELIOTROPE,
    currentBadgeWidth: {
      base: '90px',
      sm: '90px',
      md: '110px',
      lg: '110px',
      xl: '120px',
      '2xl': '120px',
    },
    currentBadgeHeight: {
      base: '80px',
      sm: '80px',
      md: '96px',
      lg: '96px',
      xl: '96px',
      '2xl': '96px',
    },

    currentBadgeTitleSize: {
      base: '14px',
      sm: '20px',
      md: '20px',
      lg: '20px',
      xl: '20px',
      '2xl': '20px',
    },
    left: { base: 10, sm: 10, md: 10, lg: 12, xl: 12, '2xl': 12 },
  },
  '5': {
    filledSegmentColor: Colors.GRADIENT_HELIOTROPE,
    unfilledSegmentColor: Colors.GRADIENT_PURPLE,
    nextLevelBadgeBg: Colors.GRADIENT_PINK_SALMON,
    currentBadgeWidth: {
      base: '100px',
      sm: '100px',
      md: '110px',
      lg: '110px',
      xl: '120px',
      '2xl': '120px',
    },
    currentBadgeHeight: {
      base: '75px',
      sm: '75px',
      md: '85px',
      lg: '85px',
      xl: '95px',
      '2xl': '95px',
    },
    currentBadgeTitleSize: {
      base: '14px',
      sm: '20px',
      md: '20px',
      lg: '20px',
      xl: '20px',
      '2xl': '20px',
    },
    left: { base: 10, sm: 10, md: 10, lg: 12, xl: 12, '2xl': 12 },
  },
  '6': {
    filledSegmentColor: Colors.GRADIENT_DODGER_BLUE,
    unfilledSegmentColor: Colors.GRADIENT_MARINER,
    nextLevelBadgeBg: Colors.GRADIENT_CAPE_PALLISER,
    currentBadgeWidth: {
      base: '100px',
      sm: '100px',
      md: '110px',
      lg: '110px',
      xl: '120px',
      '2xl': '120px',
    },
    currentBadgeHeight: {
      base: '75px',
      sm: '75px',
      md: '85px',
      lg: '85px',
      xl: '95px',
      '2xl': '95px',
    },
    currentBadgeTitleSize: {
      base: '14px',
      sm: '20px',
      md: '20px',
      lg: '20px',
      xl: '20px',
      '2xl': '20px',
    },
    left: { base: 10, sm: 10, md: 10, lg: 12, xl: 12, '2xl': 12 },
  },
  '7': {
    filledSegmentColor: Colors.GRADIENT_CAPE_PALLISER,
    unfilledSegmentColor: Colors.GRADIENT_COCOA_BEAN,
    nextLevelBadgeBg: Colors.GRADIENT_SUNSET_ORANGE,
    currentBadgeWidth: {
      base: '100px',
      sm: '100px',
      md: '110px',
      lg: '110px',
      xl: '120px',
      '2xl': '120px',
    },
    currentBadgeHeight: {
      base: '75px',
      sm: '75px',
      md: '85px',
      lg: '85px',
      xl: '95px',
      '2xl': '95px',
    },
    currentBadgeTitleSize: {
      base: '14px',
      sm: '20px',
      md: '20px',
      lg: '20px',
      xl: '20px',
      '2xl': '20px',
    },
    left: { base: 10, sm: 10, md: 10, lg: 12, xl: 12, '2xl': 12 },
  },
  '8': {
    filledSegmentColor: Colors.GRADIENT_SUNSET_ORANGE,
    unfilledSegmentColor: Colors.GRADIENT_COPPER,
    nextLevelBadgeBg: Colors.GRADIENT_AQUAMARINE,
    currentBadgeWidth: {
      base: '100px',
      sm: '100px',
      md: '110px',
      lg: '110px',
      xl: '120px',
      '2xl': '120px',
    },
    currentBadgeHeight: {
      base: '75px',
      sm: '75px',
      md: '85px',
      lg: '85px',
      xl: '95px',
      '2xl': '95px',
    },
    currentBadgeTitleSize: {
      base: '14px',
      sm: '20px',
      md: '20px',
      lg: '20px',
      xl: '20px',
      '2xl': '20px',
    },
    left: { base: 10, sm: 10, md: 10, lg: 12, xl: 12, '2xl': 12 },
  },
  '9': {
    filledSegmentColor: Colors.GRADIENT_AQUAMARINE,
    unfilledSegmentColor: Colors.GRADIENT_MINSK,
    nextLevelBadgeBg: Colors.GRADIENT_MUSTARD,
    currentBadgeWidth: {
      base: '100px',
      sm: '100px',
      md: '110px',
      lg: '110px',
      xl: '120px',
      '2xl': '120px',
    },
    currentBadgeHeight: {
      base: '75px',
      sm: '75px',
      md: '85px',
      lg: '85px',
      xl: '95px',
      '2xl': '95px',
    },
    currentBadgeTitleSize: {
      base: '14px',
      sm: '20px',
      md: '20px',
      lg: '20px',
      xl: '20px',
      '2xl': '20px',
    },
    left: { base: 10, sm: 10, md: 10, lg: 12, xl: 12, '2xl': 12 },
  },
  '10': {
    filledSegmentColor: Colors.GRADIENT_MUSTARD,
    unfilledSegmentColor: Colors.GRADIENT_DELUGE,
    nextLevelBadgeBg: Colors.TRANSPARENT,
    currentBadgeWidth: {
      base: '100px',
      sm: '100px',
      md: '110px',
      lg: '110px',
      xl: '110px',
      '2xl': '110px',
    },
    currentBadgeHeight: {
      base: '100px',
      sm: '100px',
      md: '110px',
      lg: '110px',
      xl: '110px',
      '2xl': '110px',
    },
    currentBadgeTitleSize: {
      base: '14px',
      sm: '20px',
      md: '20px',
      lg: '20px',
      xl: '20px',
      '2xl': '20px',
    },
    left: { base: 10, sm: 10, md: 10, lg: 12, xl: 12, '2xl': 12 },
  },
}

const UserPointProgressBar = ({
  value,
  currentRank,
  nextRank,
  total,
}: UserPointProgressBarTypes) => {
  const breakPoint = useBreakpoint()
  const percentage = (value / total) * 100

  return (
    <Box
      width={{ base: '90%', md: '95%' }}
      justifyContent="center"
      position="relative"
      display="flex"
      mb="80px"
      bg={Colors.TRANSPARENT}
    >
      {/* Current badge */}
      <Box position="absolute" zIndex={6} left={{ base: -5, md: 0 }} bottom={{ base: 6, md: -2 }}>
        <UserLevelsBadge
          width={rankProperties[currentRank].currentBadgeWidth[breakPoint]}
          height={rankProperties[currentRank].currentBadgeHeight[breakPoint]}
          levelId={currentRank}
          isTitle={false}
        />
      </Box>

      {/* Next badge */}
      <Box
        position="absolute"
        zIndex={5}
        right={0}
        bg={rankProperties[currentRank].nextLevelBadgeBg}
        width="60px"
        height="80px"
        borderRadius="12px"
        justifyItems="center"
        display="flex"
        justifyContent="center"
      >
        <UserLevelsBadge width="54px" height="54px" levelId={nextRank} isTitle={false} />
      </Box>

      {/* current value and total value */}
      <HStack
        zIndex={5}
        bottom={1}
        spacing={0.5}
        position="absolute"
        right={{ base: currentRank === 10 ? 10 : 16, sm: 16, md: 20 }}
      >
        <Text fontFamily="orb" fontSize="12px" fontWeight={600} letterSpacing="0.05rem">
          {formatUserPointsWithDecimal(value)}
        </Text>
        <Text fontFamily="orb" fontSize="12px" fontWeight={600} letterSpacing="0.05rem">
          /
        </Text>

        <Text fontFamily="orb" fontSize="12px" fontWeight={600} letterSpacing="0.05rem">
          {formatUserPointsWithDecimal(total)}
        </Text>
      </HStack>
      {/* Next Rank */}

      <Flex position="absolute" zIndex={5} right={20} bottom={-5}>
        {nextRank && nextRank < 11 && (
          <Flex>
            <Text fontFamily="tlm" fontSize="12px" letterSpacing="0.1rem">
              Next:
            </Text>
            <UserLevelsBadgeTitle
              levelId={nextRank}
              size="12px"
              fontFamily="tlm"
              fontWeight="normal"
            />
          </Flex>
        )}
        {!nextRank && (
          <Box>
            <Text fontFamily="tlm" fontSize="12px" letterSpacing="0.1rem">
              Well done!
            </Text>
          </Box>
        )}
      </Flex>

      {/* Main progress bar */}
      <Box
        w={{ base: '80%', md: '90%' }}
        h={['90px', '90px', '60px', '60px', '60px']}
        bg={Colors.GRADIENT_BISCAY}
        borderRadius="sm"
        overflow="hidden"
        position="relative"
        transform="skewX(-25deg)"
      >
        {/* Display current badge title */}
        <Box transform="skewX(25deg)" zIndex={5} position="relative">
          <Box
            w={['90px', '200px', '200px', '200px', '200px']}
            position="absolute"
            zIndex={3}
            top={4}
            left={rankProperties[currentRank].left[breakPoint]}
          >
            <UserLevelsBadgeTitle
              levelId={currentRank}
              size={rankProperties[currentRank].currentBadgeTitleSize[breakPoint]}
            />
          </Box>
        </Box>

        {/* Unfilled segment */}
        <Box
          position="absolute"
          h="100%"
          bg={rankProperties[currentRank].unfilledSegmentColor}
          w="100%"
          transform="skewX(0deg)"
          zIndex="-2"
        />

        {/* Main (filled) segment */}
        <Box
          position="absolute"
          h="100%"
          bg={rankProperties[currentRank].unfilledSegmentColor}
          w="100%"
          transform="skewX(0deg)"
          zIndex="-1"
        />

        {/* Display multiple border lines */}
        {[...Array(14)].map((_, index) => {
          const offset = (index + 1) * 6.67

          return (
            <Box
              key={index}
              position="absolute"
              left={`${offset}%`}
              top="0"
              h="100%"
              borderRightWidth="1.5px"
              borderRightColor={Colors.BLACK_SOLID_100}
              transform="skewX(0deg)"
              zIndex="-1"
            />
          )
        })}

        {/* Filled segment */}
        <Box
          position="absolute"
          h="100%"
          bg={rankProperties[currentRank].filledSegmentColor}
          w={`${percentage}%`}
          transform="skewX(0deg)"
          zIndex="2"
        />

        {/* Border on the filled segment */}
        <Box
          position="absolute"
          h="100%"
          bg={Colors.BLACK_SOLID_100}
          w={`${percentage}%`}
          transform="skewX(0deg)"
          zIndex="1"
        />

        {/* White line on the bottom of the progress bar */}
        <Box
          position="absolute"
          bottom={0}
          h="5%"
          bg={Colors.SNOW_WHITE}
          w={`${percentage}%`}
          transform="skewX(0deg)"
          zIndex="3"
        />
      </Box>
    </Box>
  )
}

// Export the component
export { UserPointProgressBar }
