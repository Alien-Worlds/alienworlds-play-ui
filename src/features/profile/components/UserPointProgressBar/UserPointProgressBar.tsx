import { useBreakpoint } from '@alien-worlds/uikit'
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
    <div
      className="relative mb-[80px] flex w-[90%] justify-center md:w-[95%]"
      style={{ backgroundColor: Colors.TRANSPARENT }}
    >
      {/* Current badge */}
      <div className="absolute bottom-[24px] left-[-20px] z-[6] md:bottom-[-8px] md:left-0">
        <UserLevelsBadge
          width={rankProperties[currentRank].currentBadgeWidth[breakPoint]}
          height={rankProperties[currentRank].currentBadgeHeight[breakPoint]}
          levelId={currentRank}
          isTitle={false}
        />
      </div>

      {/* Next badge */}
      <div
        className="absolute right-0 z-[5] flex h-[80px] w-[60px] items-center justify-center rounded-[12px]"
        style={{ background: rankProperties[currentRank].nextLevelBadgeBg }}
      >
        <UserLevelsBadge width="54px" height="54px" levelId={nextRank} isTitle={false} />
      </div>

      {/* current value and total value */}
      <div
        className={`absolute bottom-[4px] z-[5] flex items-center gap-[2px] sm:right-[64px] md:right-[80px] ${
          currentRank === 10 ? 'right-[40px]' : 'right-[64px]'
        }`}
      >
        <p className="font-orb text-[12px] font-semibold tracking-[0.05rem]">
          {formatUserPointsWithDecimal(value)}
        </p>
        <p className="font-orb text-[12px] font-semibold tracking-[0.05rem]">/</p>

        <p className="font-orb text-[12px] font-semibold tracking-[0.05rem]">
          {formatUserPointsWithDecimal(total)}
        </p>
      </div>
      {/* Next Rank */}

      <div className="absolute bottom-[-20px] right-[80px] z-[5] flex">
        {nextRank && nextRank < 11 && (
          <div className="flex">
            <p className="font-tlm text-[12px] tracking-[0.1rem]">Next:</p>
            <UserLevelsBadgeTitle
              levelId={nextRank}
              size="12px"
              fontFamily="tlm"
              fontWeight="normal"
            />
          </div>
        )}
        {!nextRank && (
          <div>
            <p className="font-tlm text-[12px] tracking-[0.1rem]">Well done!</p>
          </div>
        )}
      </div>

      {/* Main progress bar */}
      <div
        className="relative h-[90px] w-[80%] overflow-hidden rounded-sm md:h-[60px] md:w-[90%]"
        style={{ background: Colors.GRADIENT_BISCAY, transform: 'skewX(-25deg)' }}
      >
        {/* Display current badge title */}
        <div className="relative z-[5]" style={{ transform: 'skewX(25deg)' }}>
          <div
            className="absolute z-[3] w-[90px] top-[16px] sm:w-[200px]"
            style={{ left: `${rankProperties[currentRank].left[breakPoint] * 4}px` }}
          >
            <UserLevelsBadgeTitle
              levelId={currentRank}
              size={rankProperties[currentRank].currentBadgeTitleSize[breakPoint]}
            />
          </div>
        </div>

        {/* Unfilled segment */}
        <div
          className="absolute h-full w-full"
          style={{
            background: rankProperties[currentRank].unfilledSegmentColor,
            transform: 'skewX(0deg)',
            zIndex: -2,
          }}
        />

        {/* Main (filled) segment */}
        <div
          className="absolute h-full w-full"
          style={{
            background: rankProperties[currentRank].unfilledSegmentColor,
            transform: 'skewX(0deg)',
            zIndex: -1,
          }}
        />

        {/* Display multiple border lines */}
        {[...Array(14)].map((_, index) => {
          const offset = (index + 1) * 6.67

          return (
            <div
              key={index}
              className="absolute top-0 h-full border-r-[1.5px]"
              style={{
                left: `${offset}%`,
                borderRightColor: Colors.BLACK_SOLID_100,
                transform: 'skewX(0deg)',
                zIndex: -1,
              }}
            />
          )
        })}

        {/* Filled segment */}
        <div
          className="absolute h-full"
          style={{
            background: rankProperties[currentRank].filledSegmentColor,
            width: `${percentage}%`,
            transform: 'skewX(0deg)',
            zIndex: 2,
          }}
        />

        {/* Border on the filled segment */}
        <div
          className="absolute h-full"
          style={{
            background: Colors.BLACK_SOLID_100,
            width: `${percentage}%`,
            transform: 'skewX(0deg)',
            zIndex: 1,
          }}
        />

        {/* White line on the bottom of the progress bar */}
        <div
          className="absolute bottom-0 h-[5%]"
          style={{
            background: Colors.SNOW_WHITE,
            width: `${percentage}%`,
            transform: 'skewX(0deg)',
            zIndex: 3,
          }}
        />
      </div>
    </div>
  )
}

// Export the component
export { UserPointProgressBar }
