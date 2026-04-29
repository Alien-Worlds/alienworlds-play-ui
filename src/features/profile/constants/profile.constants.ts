/**
 * Profile Feature Constants
 *
 * This file contains all constants used throughout the profile feature.
 * It centralizes configuration and makes the code more maintainable.
 */

import { Colors } from 'shared/util/colors'

export const PROFILE_CONSTANTS = {
  DEMO_ACCOUNT_TAG: 'Demo Account',
  AVATAR_SIZES: {
    SMALL: 5.2,
    MEDIUM: 7.6312,
    LARGE: 9,
    HEADER: 5.6312,
  },
  BREAKPOINTS: {
    MOBILE: 'base',
    TABLET: 'md',
    DESKTOP: 'xl',
    LARGE_DESKTOP: '2xl',
  },
  LEVELS: {
    MAX_LEVEL: 10,
    MIN_LEVEL: 1,
  },
  CLAIM_TYPES: {
    MINING: 'mining',
    COMMISSION: 'commission',
    DTAL: 'dtal',
    UNSTAKE: 'unstake',
  } as const,
  WALLET_TYPES: {
    WAX: 'wax',
    WOMBAT: 'wombat',
    BSC: 'bsc',
  } as const,
} as const

export const UI_CONSTANTS = {
  COLORS: {
    PRIMARY: Colors.SNOW_WHITE,
    SECONDARY: Colors.DI_SERRIA,
    ACCENT: Colors.PERSIAN_GREEN,
    SUCCESS: Colors.PERSIAN_GREEN,
    WARNING: Colors.RADICAL_RED,
    ERROR: Colors.RADICAL_RED,
    INFO: Colors.GRAY_CHATEAU,
    BACKGROUND: {
      PRIMARY: Colors.BLACK_SOLID_90,
      SECONDARY: Colors.BLACK_NEUTRAL,
      CARD: Colors.BLACK_SOLID_90,
    },
  },
  SPACING: {
    XS: '4px',
    SM: '8px',
    MD: '16px',
    LG: '24px',
    XL: '32px',
    XXL: '48px',
  },
  BORDER_RADIUS: {
    SM: '8px',
    MD: '12px',
    LG: '16px',
    XL: '20px',
    FULL: '50%',
  },
  FONT_SIZES: {
    XS: '12px',
    SM: '14px',
    MD: '16px',
    LG: '18px',
    XL: '20px',
    XXL: '24px',
    XXXL: '36px',
  },
  FONT_WEIGHTS: {
    NORMAL: 400,
    MEDIUM: 500,
    SEMIBOLD: 600,
    BOLD: 700,
  },
} as const

export const BALANCE_CONSTANTS = {
  DECIMAL_PLACES: 4,
  CURRENCY_SYMBOLS: {
    TLM: 'TLM',
    BSC: 'BSC',
  },
  DISPLAY_FORMATS: {
    BALANCE: '0,0.0000',
    PERCENTAGE: '0.00%',
    TIME: 'HH:mm:ss',
  },
} as const

export const CLAIMS_CONSTANTS = {
  MINING_REWARD_COOLDOWN_HOURS: 24,
  BUTTON_VARIANTS: {
    CLAIMABLE: 'lithium',
    COOLDOWN: 'beryllium',
    DISABLED: 'disabled',
  },
  LOADING_TEXT: {
    CLAIMING: 'Claiming...',
    PROCESSING: 'Processing...',
  },
} as const

export const PROGRESS_BAR_CONSTANTS = {
  RANK_PROPERTIES: {
    '1': {
      filledSegmentColor: Colors.GRADIENT_SCORPION,
      unfilledSegmentColor: Colors.GRADIENT_MINE_SHAFT,
      nextLevelBadgeBg: Colors.GRADIENT_SILVER_CHALICE,
    },
    '2': {
      filledSegmentColor: Colors.GRADIENT_SCORPION,
      unfilledSegmentColor: Colors.GRADIENT_MINE_SHAFT,
      nextLevelBadgeBg: Colors.GRADIENT_SILVER_CHALICE,
    },
    '3': {
      filledSegmentColor: Colors.GRADIENT_SCORPION,
      unfilledSegmentColor: Colors.GRADIENT_MINE_SHAFT,
      nextLevelBadgeBg: Colors.GRADIENT_DANUBE,
    },
    '4': {
      filledSegmentColor: Colors.GRADIENT_DODGER_BLUE,
      unfilledSegmentColor: Colors.GRADIENT_BISCAY,
      nextLevelBadgeBg: Colors.GRADIENT_HELIOTROPE,
    },
    '5': {
      filledSegmentColor: Colors.GRADIENT_HELIOTROPE,
      unfilledSegmentColor: Colors.GRADIENT_PURPLE,
      nextLevelBadgeBg: Colors.GRADIENT_PINK_SALMON,
    },
    '6': {
      filledSegmentColor: Colors.GRADIENT_DODGER_BLUE,
      unfilledSegmentColor: Colors.GRADIENT_MARINER,
      nextLevelBadgeBg: Colors.GRADIENT_CAPE_PALLISER,
    },
    '7': {
      filledSegmentColor: Colors.GRADIENT_CAPE_PALLISER,
      unfilledSegmentColor: Colors.GRADIENT_COCOA_BEAN,
      nextLevelBadgeBg: Colors.GRADIENT_SUNSET_ORANGE,
    },
    '8': {
      filledSegmentColor: Colors.GRADIENT_SUNSET_ORANGE,
      unfilledSegmentColor: Colors.GRADIENT_COPPER,
      nextLevelBadgeBg: Colors.GRADIENT_AQUAMARINE,
    },
    '9': {
      filledSegmentColor: Colors.GRADIENT_AQUAMARINE,
      unfilledSegmentColor: Colors.GRADIENT_MINSK,
      nextLevelBadgeBg: Colors.GRADIENT_MUSTARD,
    },
    '10': {
      filledSegmentColor: Colors.GRADIENT_MUSTARD,
      unfilledSegmentColor: Colors.GRADIENT_DELUGE,
      nextLevelBadgeBg: Colors.TRANSPARENT,
    },
  },
} as const

export const ERROR_MESSAGES = {
  PROFILE_LOAD_FAILED: 'Failed to load profile data',
  BALANCE_LOAD_FAILED: 'Failed to load balance data',
  CLAIM_FAILED: 'Failed to claim reward',
  NETWORK_ERROR: 'Network error occurred',
  WALLET_NOT_CONNECTED: 'Wallet not connected',
  INSUFFICIENT_BALANCE: 'Insufficient balance',
} as const

export const SUCCESS_MESSAGES = {
  PROFILE_UPDATED: 'Profile updated successfully',
  REWARD_CLAIMED: 'Reward claimed successfully',
  BALANCE_REFRESHED: 'Balance refreshed successfully',
  WALLET_COPIED: 'Wallet ID copied to clipboard',
} as const
