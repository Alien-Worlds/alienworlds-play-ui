import { PLACE_VARIANT } from '@alien-worlds/uikit'
import anchorLogo from 'assets/images/anchor_wallet_logo.png'
import wcwLogo from 'assets/images/wcw_wallet_logo.png'
import wombatLogo from 'assets/images/wombat_wallet_logo.png'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import DOMPurify from 'dompurify'
import { Transaction } from 'eosjs/dist/eosjs-api-interfaces'
import { NftRarity } from 'features/mining/utils/constants'
import { DaoDetailsResponse } from 'graphql/types'
import {
  findKey,
  toLower,
  split,
  round,
  toUpper,
  toNumber,
  keys,
  reduce,
  includes,
  keysIn,
  map,
  reject,
  forEach,
  capitalize,
  get,
} from 'lodash'
import { DateTime } from 'luxon'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'
import { formatNumber } from 'shared/util/numbers'
import { WalletType } from 'store/main/types'
import { WaxPointsOffer } from 'store/wax/types'

import { Constants } from './constants'

export const dacList = {
  eye: 'eyeke',
  mag: 'magor',
  kav: 'kavian',
  nar: 'naron',
  ner: 'nerix',
  vel: 'veles',
  testa: 'testa',
  eyeunn: 'eyekeunn',
  kavunn: 'kavianunn',
  magunn: 'magorunn',
  narunn: 'naronunn',
  nerunn: 'neriunn',
  velunn: 'velesunn',
}
export const dacIdToDacTreasuryAccountList = {
  eyeke: 'eyeke.world',
  magor: 'magor.world',
  kavian: 'kavian.world',
  naron: 'naron.world',
  nerix: 'neri.world',
  veles: 'veles.world',
  testa: 'testdaca.dac',
  eyekeunn: 'eyekeunn',
  kavianunn: 'kavianunn',
  magorunn: 'magorunn',
  naronunn: 'naronunn',
  neriunn: 'neriunn',
  velesunn: 'velesunn',
}
export const dacUnionIdToPlanet = {
  eyekeunn: 'eyeke.world',
  magorunn: 'magor.world',
  kavianunn: 'kavian.world',
  naronunn: 'naron.world',
  neriunn: 'neri.world',
  velesunn: 'veles.world',
  eyeke: 'eyeke.world',
  magor: 'magor.world',
  kavian: 'kavian.world',
  naron: 'naron.world',
  nerix: 'neri.world',
  veles: 'veles.world',
  testa: 'testdaca.dac',
}
export const padZero = (value: number): string => (value < 10 ? `0${value}` : `${value}`)
export const formatUserPointsWithDecimal = (points: number) => formatNumber(points / 10, 1, 1)
export const formatVotePowerWithDecimal = (votePower: string | null): number =>
  parseFloat(votePower ?? '0') / 10000

export const formatLandRating = (rating: number) => {
  const convertedRating = rating / 10000
  // showing minimum no decimal places to maximum 4 decimal places with 5 significant digits
  return formatNumber(convertedRating, 0, 4, undefined, 5)
}
/**
 * Dates from WAX are coming without timezone, so we have to account for it
 * @example '2024-05-13T02:00:00'
 * @param isoDate
 */
export const getISODateUTC = (isoDate: string) => DateTime.fromISO(isoDate, { zone: 'utc' })

/**
 * Check if start of UTC date has already passed
 * @example '2024-05-13'
 * @param date
 */
export const hasUTCDateAlreadyOccurred = (date: string) => {
  return DateTime.now().toUTC() >= DateTime.fromISO(date, { zone: 'utc' })
}

export const showExpireTimeLeft = (isoDate: string) => {
  const { weeks, days, hours, minutes } = getISODateUTC(isoDate).diffNow([
    'weeks',
    'days',
    'hours',
    'minutes',
    'seconds',
  ])

  return `${weeks}w ${days}d ${hours}h ${minutes}m`
}

// @TODO use humanize-duration
export const showUpcomingTimeLeft = (isoDate: string) => {
  const { hours, minutes } = getISODateUTC(isoDate).diffNow(['hours', 'minutes', 'seconds'])
  return `${hours}h ${minutes}m`
}

export const day25hInSeconds = 25 * 60 * 60
export const today25hDay = () => {
  return Math.floor(DateTime.utc().toUnixInteger() / day25hInSeconds)
}

export const next25hDayDiffNow = () => {
  const current25hDaySinceEpoch = today25hDay()
  const next25hDaySinceEpoch = current25hDaySinceEpoch + 1
  const next25hDayInSecondsSinceEpoch = next25hDaySinceEpoch * day25hInSeconds
  const next25hDay = DateTime.fromSeconds(next25hDayInSecondsSinceEpoch)
  return next25hDay.diffNow(['hours', 'minutes', 'seconds'])
}

export const getDiffToStartOfNext25hDay = () => {
  return next25hDayDiffNow().toFormat(`hh'h':mm'm':ss's'`)
}

export const isCurrentOffer = (offerItem: WaxPointsOffer) =>
  getISODateUTC(offerItem.start) < DateTime.now() && DateTime.now() < getISODateUTC(offerItem.end)

export const getCurrentOfferColor = (offerItem: WaxPointsOffer) =>
  getISODateUTC(offerItem.end).diffNow(['days']).days < 4 ? Colors.SECONDARY_RED : Colors.SNOW_WHITE

/**
 * Detect if offer has less time left before start than the threshold
 * @param start
 */
export const isUpcomingOffer = ({ start }: WaxPointsOffer) =>
  getISODateUTC(start) > DateTime.now() && getISODateUTC(start).diffNow(['hours']).hours < 24

export const getUpcomingOfferColor = (offerItem: WaxPointsOffer) =>
  getISODateUTC(offerItem.start).diffNow(['hours']).hours < 4
    ? Colors.SECONDARY_GREEN
    : Colors.SNOW_WHITE

/**
 * Clear browser storages (local, session, cookies)
 */
export const clearCookies = () => {
  window.localStorage.clear()
  window.sessionStorage.clear()

  const cookies = document.cookie.split('; ')
  for (let c = 0; c < cookies.length; c += 1) {
    const d = window.location.hostname.split('.')
    while (d.length > 0) {
      const cookieBase = `${encodeURIComponent(
        cookies[c].split(';')[0].split('=')[0]
      )}=; expires=Thu, 01-Jan-1970 00:00:01 GMT; domain=${d.join('.')} ;path='`
      const p = window.location.pathname.split('/')
      document.cookie = `${cookieBase}/`
      while (p.length > 0) {
        document.cookie = cookieBase + p.join('/')
        p.pop()
      }
      d.shift()
    }
  }
}

export const logAppVersion = () => {
  if (config.AppEnv !== 'production') {
    console.info(`Build version: ${config.AppVersion}`)
    console.info(`Build node env: ${config.NodeEnvironment}`)
    console.info(`Build app env: ${config.AppEnv}`)
  }
}

/**
 * Kavian -> kavian
 * Neri -> nerix - this is a special case we have to treat
 *
 * @param title - title of the planet
 */
export const convertPlanetNameToId = (title: string) => {
  let result = toLower(title)
  if (result === 'neri') result += 'x'
  return result
}

export const convertPlanetIdToName = (title: string) => {
  let result = toLower(title)
  if (result === 'nerix') result = 'neri'
  return result
}

export const getDacNameById = (id: string) => {
  return dacList[toLower(id)]
}
export const getDacSymbol = (id: string) => {
  const result = findKey(dacList, (val) => {
    return val === toLower(id)
  })
  if (result && result.length > 0) return toUpper(result)
  return null
}

export const getDacTreasuryAccountByDacId = (id: string) => {
  return dacIdToDacTreasuryAccountList[toLower(id)]
}

export const DateTimeNowInUTC = () => {
  return new Date().toISOString()
}

export const DateInUTC = () => {
  const currentDate = DateTime.utc()
  return `${currentDate.year}/${currentDate.month}/${currentDate.day}`
}

export const TimeInUTC = () => {
  const currentDate = DateTime.utc()
  return `${currentDate.hour}:${currentDate.minute}:${currentDate.second}`
}

export const PrepareDacTokenAmountWithPrecision = (
  amount: number,
  dacId: string,
  precision = Constants.DEFAULT_TOKEN_PRECISION
) => {
  return `${round(amount, precision).toFixed(precision)} TLM in ${capitalize(
    convertPlanetIdToName(dacId)
  )}`
}

export const PrepareTlmAmountWithPrecision = (
  amount: number,
  precision = Constants.DEFAULT_TOKEN_PRECISION
) => {
  return `${round(amount, precision).toFixed(precision)} TLM`
}

export const getDacTokenPrecision = (dac: DaoDetailsResponse) => {
  const [precision] = split(dac?.symbol?.sym, ',')

  if (!precision.length) {
    return Constants.DEFAULT_TOKEN_PRECISION
  }
  return toNumber(precision)
}

export const TokenSymbolWithPrecision = (dacId: string) => {
  return `${4},${convertPlanetIdToName(dacId)}`
}

export const renameKeys = (keysMap: any, obj: any) => {
  return reduce(
    keys(obj),
    (acc, key) => ({
      ...acc,
      ...{ [keysMap[key] || key]: obj[key] },
    }),
    {}
  )
}

/**
 * Formats a timestamp string into a specified format using Luxon's DateTime.
 *
 * @param {string} timestampString - The ISO timestamp string to be formatted.
 * @param {string} [format=DateTime.DATE_MED] - The desired format for the output date string. Defaults to DateTime.DATE_MED.
 * @returns {string} The formatted date string.
 */
export const formatDate = (timestampString: string, format = DateTime.DATE_MED) => {
  return DateTime.fromISO(timestampString).toLocaleString(format)
}
export const getFormattedDate = (
  proposalDate: string,
  separator: string,
  includeTimestamp: boolean = false
) => {
  let formattedDate: string
  const date: DateTime = DateTime.fromISO(proposalDate)

  if (date?.isValid) {
    formattedDate = includeTimestamp
      ? date.toFormat(`yyyy${separator}MM${separator}dd HH:mm:ss`)
      : date.toFormat(`yyyy${separator}MM${separator}dd`)
  }

  return formattedDate
}

export const truncateWithEllipsis = (str: string, maxLength: number) => {
  if (str.length <= maxLength) {
    return str // No truncation needed if string is shorter or equal to maxLength
  }

  return str.substring(0, maxLength - 3) + '...' // Return truncated string with ellipsis
}

export const getDacPlaceRingVariantByPlace = (place: number) => {
  let result: PLACE_VARIANT = PLACE_VARIANT.placeA

  if (place === 1) {
    // 1
    result = PLACE_VARIANT.placeD
  } else if (place > 1 && place < 5) {
    // 2-4
    result = PLACE_VARIANT.placeC
  } else if (place > 4 && place < 11) {
    // 5-10
    result = PLACE_VARIANT.placeB
  } else if (place > 10) {
    // 11+
    result = PLACE_VARIANT.placeA
  }

  return result
}

export const getLeaderboardPlaceRingVariantByRank = (place: number) => {
  let result: PLACE_VARIANT = PLACE_VARIANT.placeA

  if (place === 1) {
    // 1
    result = PLACE_VARIANT.placeD
  } else if (place === 2) {
    // 2-4
    result = PLACE_VARIANT.placeC
  } else if (place === 3) {
    // 5-10
    result = PLACE_VARIANT.placeB
  } else if (place > 3) {
    // 11+
    result = PLACE_VARIANT.placeA
  }

  return result
}
export const custodiansGradientColors = (rank: number) => {
  switch (rank) {
    case 1:
      return Colors.GOLDER_GRASS
    case 2:
    case 3:
    case 4:
      return Colors.OCEAN_GREEN
    case 5:
      return Colors.DODGE_BLUE
    default:
      return Colors.SNOW_WHITE_ALPHA_80
  }
}

export const custodiansHoverGradientColors = (rank: number) => {
  switch (rank) {
    case 1:
      return 'rgba(223, 151, 37, 0.1)'
    case 2:
    case 3:
    case 4:
      return 'rgb(72, 187, 120, 0.1)'
    case 5:
      return 'rgb(0, 186, 255, 0.1)'
    default:
      return Colors.SNOW_WHITE_ALPHA_80
  }
}
export const candidatesGradientColors = (rank: number) => {
  switch (rank) {
    case 1:
      return Colors.GOLDER_GRASS
    case 2:
    case 3:
    case 4:
      return Colors.OCEAN_GREEN
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
    case 10:
      return Colors.DODGE_BLUE
    default:
      return Colors.SNOW_WHITE_ALPHA_50
  }
}

export const candidatesHoverGradientColors = (rank: number) => {
  switch (rank) {
    case 1:
      return 'rgba(223, 151, 37, 0.1)'
    case 2:
    case 3:
    case 4:
      return 'rgb(72, 187, 120, 0.1)'
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
    case 10:
      return 'rgb(0, 186, 255, 0.1)'
    default:
      return Colors.SNOW_WHITE_ALPHA_10
  }
}

export const rankGradientColors = (rank: number) => {
  switch (rank) {
    case 1:
      return Colors.GOLDER_GRASS
    case 2:
      return Colors.OCEAN_GREEN
    case 3:
      return Colors.DODGE_BLUE
    default:
      return Colors.SNOW_WHITE_ALPHA_80
  }
}

export const rankGradientHoverColors = (rank: number) => {
  switch (rank) {
    case 1:
      return 'rgba(223, 151, 37, 0.3)'
    case 2:
      return 'rgba(72, 187, 120, 0.3)'
    case 3:
      return 'rgba(0, 186, 255, 0.2)'
    default:
      return 'rgba(70, 70, 70, 0.7)'
  }
}

export const fallbackAvatarSrc = `${config.IpfsApiUrl}/QmWmAY3NELbkjLVk4qWrpBEafaS1wPJFwhsUNgRcurVox4`

export const isValidDacId = (id: string) => {
  return includes(split(config.ActiveDacIds, ','), toLower(id))
}

export const checkAndCreateAllPlanetStakes = (result: any): any => {
  map(keysIn(dacIdToDacTreasuryAccountList), (x) => {
    if (result[x] === undefined) result[x] = '0.0000'
  })
  return result
}

export const pluralize = (count: number, noun: string, suffix = 's') =>
  `${noun}${count !== 1 ? suffix : ''}`

export const getSyndicatesCurrentPage = () =>
  window.location.href.substring(window.location.href.indexOf('/syndicates'))

export const getVoteDecayColor = (voteDecay) => {
  let result

  if (voteDecay >= 1 && voteDecay < 5) {
    // 1-4
    result = Colors.AQUA
  } else if (voteDecay >= 5 && voteDecay < 16) {
    // 5-15
    result = Colors.ROBINS_EGG_BLUE
  } else if (voteDecay >= 16 && voteDecay < 25) {
    // 16-24
    result = Colors.INCH_WORM
  } else if (voteDecay >= 25 && voteDecay < 40) {
    // 25-39
    result = Colors.SCHOOL_BUS_YELLOW
  } else if (voteDecay >= 40 && voteDecay < 60) {
    // 40-59
    result = Colors.TANGERINE
  } else if (voteDecay >= 60) {
    // 60-60+
    result = Colors.RADICAL_RED
  }

  return result
}

export const landBoostValueByRarity = {
  common: 0,
  rare: 0.001,
  epic: 0.002,
  legendary: 0.003,
}

export const mainDrawerTabs = [
  { name: 'Mining', index: 0 },
  { name: 'Missions', index: 1 },
  { name: 'Landowner', index: 2 },
  //{ name: 'Governance', index: 3 },
]

export function getDrawerTabs(lands: IAsset[]) {
  const visibleDrawerTabs =
    lands?.length > 0 ? mainDrawerTabs : reject(mainDrawerTabs, (t) => t.name === 'Landowner')
  return visibleDrawerTabs
}

export function getTabProgress(index: number) {
  // @TODO
  switch (index) {
    case 0:
      return 10
    case 1:
      return 30
    case 2:
      return 50
    case 3:
      return 70
    default:
      return 50
  }
}

export function enumToArray(enumObj: any) {
  const arrayFromEnum: {
    key: any
    value: any
  }[] = Object.entries(enumObj).map(([key, value]) => ({ key, value }))
  return arrayFromEnum
}

// ref: https://refine.dev/blog/use-react-dangerouslysetinnerhtml/
export const sanitizedHtmlString = (htmlString: string) => {
  return DOMPurify.sanitize(htmlString)
}

export const isBudgetClaim = (deserialisedTxn: Transaction) => {
  let isClaim: boolean = false

  // Set budget claims from action
  if (deserialisedTxn.actions[0].name === Constants.CONTRACT_DAO_WORLDS_ACTIONS_CLAIMBUDGET) {
    isClaim = true
  }

  return isClaim
}

export const isBoostNFT = (asset: IAsset) => {
  let isBoost = false

  // filter LandBoost NFTs
  if (asset?.data?.cardid === 45 || asset?.data?.cardid === 46) {
    isBoost = true
  }

  return isBoost
}

export const isShinableNFT = (asset: IAsset) => {
  const nftShine: string = asset?.data?.shine
  const nftRarity: string = asset?.data?.rarity
  const nftCopies: number = asset?.total_of_type
  const isNFTBoost: boolean = isBoostNFT(asset)

  // Min. 4 copies required for shining
  if (nftCopies < 4) return false
  // Abundant shined NFTs cannot be shined any further
  if (nftShine !== 'Stone' && nftRarity === NftRarity?.abundant) return false
  // Boost NFTs cannot be shined
  if (isNFTBoost) return false

  return true
}

/**
 * Helper function used to build a fine grained treshold array
 * to be used with IntersectionObserver
 */
export const tresholdBuilder = () => {
  const t = []
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < 100; i++) {
    t.push((i + 1) / 100)
  }
  return t
}

// Avoid security issues by setting rel attribute when target is "_blank"
// https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#Security_and_privacy
export const openInNewTab = (url: string): void => {
  const newWindow = window.open(url, '_blank', 'noopener')
  if (newWindow) newWindow.opener = null
}

export const dropdownStyles = {
  input: () => {
    return {
      cursor: 'pointer',
    }
  },
  menu: () => {
    return {
      width: '100%',
      cursor: 'pointer',
    }
  },
  option: () => {
    return {
      cursor: 'pointer',
    }
  },
}

const checkEnvVariable = (variableName) => {
  if (variableName[1] === undefined || variableName[1] === null) {
    console.error(`Error: ${variableName} is not defined in the environment variables.`)
    return false
  }
  return true
}

export const checkEnvVariables = () => {
  const requiredVariables = Object.entries(config)

  let allVariablesDefined = true

  forEach(requiredVariables, (variable) => {
    if (!checkEnvVariable(variable)) {
      // If any required variable is missing or undefined, set the flag to false
      allVariablesDefined = false
    }
  })

  // Return the flag indicating whether all required variables are defined
  return allVariablesDefined
}

export const getUserRankInfo = (toolRarity: string) => {
  let rankName: string
  let rankNumber: string
  let totalShards: string

  if (!toolRarity) return null

  switch (toolRarity) {
    case 'ABUNDANT':
    case 'COMMON':
      rankNumber = '1'
      totalShards = '0'
      rankName = 'Novice'
      toolRarity = 'Abundant/Common'
      break
    case 'RARE':
      rankNumber = '3'
      totalShards = '284'
      rankName = 'Associate'
      toolRarity = 'Rare'
      break
    case 'EPIC':
      rankNumber = '4'
      totalShards = '965'
      rankName = 'PeaceKeeper'
      toolRarity = 'Epic'
      break
    case 'LEGENDARY':
      rankNumber = '5'
      totalShards = '2843'
      rankName = 'Expert'
      toolRarity = 'Legendary'
      break
    case 'MYTHICAL':
      rankNumber = '6'
      totalShards = '7853'
      rankName = 'SkyRider'
      toolRarity = 'Mythical'
      break
    default:
      break
  }
  return { toolRarity, rankName, rankNumber, totalShards }
}

export const socialButtonsProps = {
  width: { base: '80px', lg: '100px', xl: '120px' },
  height: { base: '40px', lg: '50px', xl: '60px' },
  backgroundColor: Colors.DARK_GRAY,
  color: Colors.SNOW_WHITE,
  transitionProperty: 'color',
  transitionDuration: '.5s',
  transitionTimingFunction: 'ease-in-out',
  _hover: {
    color: Colors.SNOW_WHITE,
    backgroundColor: Colors.SNOW_WHITE_ALPHA_50,
  },
  borderRadius: 8,
}

export const getTopbarLogo = (currentWallet: string) => {
  let logo: any

  switch (currentWallet) {
    case null:
    case undefined:
    case WalletType.WAX:
    case 'demo':
      logo = wcwLogo
      break
    case WalletType.ANCHOR:
      logo = anchorLogo
      break
    case WalletType.WOMBAT:
      logo = wombatLogo
      break
    default:
      break
  }
  return logo
}

export const sessionKitWallets = [
  {
    title: 'WCW',
    fullTitle: 'WAX Cloud Wallet',
    type: WalletType.WAX,
    logo: wcwLogo,
    enabled: true,
  },
  {
    title: 'WOMBAT',
    fullTitle: 'Wombat Wallet',
    type: WalletType.WOMBAT,
    logo: wombatLogo,
    // @ts-ignore
    enabled: window?.wombat?.isWombat,
  },
  // {
  //   title: 'ANCHOR',
  //   fullTitle: 'Anchor Wallet',
  //   type: WalletType.ANCHOR,
  //   logo: anchorLogo,
  //   enabled: true,
  // },
]

export const abbreviateNumber = (number) => {
  const SI_SYMBOLS = ['', 'k', 'M', 'B', 'T', 'Q', 'E']

  // Ensure number is a valid number
  if (typeof number !== 'number' || isNaN(number)) {
    return number.toString()
  }

  // Pre-process for negative numbers
  const sign = number < 0 ? '-' : ''
  number = Math.abs(number)

  // For numbers less than 1000, return the number as is
  if (number < 1000) {
    return sign + number.toString()
  }

  // Calculate the exponent
  const exponent = Math.floor(Math.log10(number) / 3)

  // For extremely large numbers that go beyond 'E'
  if (exponent >= SI_SYMBOLS.length) {
    const decimal = (number / Math.pow(1000, SI_SYMBOLS.length - 1)).toFixed(2)
    return `${sign}${decimal}E`
  }

  const base = Math.pow(1000, exponent)
  const decimal = (number / base).toFixed(exponent > 3 ? 2 : 0) // Adjust decimal places for larger numbers

  // Add comma separators for thousands
  const parts = decimal.split('.')
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  return `${sign}${parts.join('.')}${SI_SYMBOLS[exponent]}`
}

export const extractNumber = (inputString: any) => {
  // Regular expression to match the number part
  const numberRegex = /(\d+\.\d+)/

  // Extract the number using the regular expression
  if (typeof inputString === 'string') {
    const match = inputString.match(numberRegex)

    if (match) {
      return Number(match[1]) // Return the captured number
    } else {
      return null // Or handle invalid input as needed
    }
  }
  return null
}

// union finder

export const unionDAOFinder = (dao: string) => {
  switch (dao) {
    case 'eyeke':
      return 'eyekeunn'
    case 'kavian':
      return 'kavianunn'
    case 'magor':
      return 'magorunn'
    case 'naron':
      return 'naronunn'
    case 'nerix':
      return 'neriunn'
    case 'veles':
      return 'velesunn'
  }
}
export const unionToPlanetFinder = (dao: string) => {
  switch (dao) {
    case 'eyekeunn':
      return 'eyeke'
    case 'kavianunn':
      return 'kavian'
    case 'magorunn':
      return 'magor'
    case 'naronunn':
      return 'naron'
    case 'neriunn':
      return 'nerix'
    case 'velesunn':
      return 'veles'
  }
}

export const DaoIdToNameFinder = (dao: string) => {
  switch (dao) {
    case 'eyeke':
      return 'Eyeke'
    case 'kavian':
      return 'Kavian'
    case 'magor':
      return 'Magor'
    case 'naron':
      return 'Naron'
    case 'nerix':
      return 'Neri'
    case 'veles':
      return 'Veles'
    default:
      return null
  }
}

export const isUnionDAO = (dao: string) => {
  return includes(dao, 'unn')
}

export const processElectionGlobals = (result: any) => {
  const electionGlobals = get(result, 'electionGlobals', null)

  const processedResult: any = result
  if (electionGlobals) {
    const periodLength = get(electionGlobals, 'periodLength', 0)
    const lastPeriodTime = get(electionGlobals, 'lastPeriodTime', '')
    const totalBudgetPercentage = get(electionGlobals, 'budgetPercentage', 0)
    const totalVotesCandidates = get(electionGlobals, 'totalVotesOnCandidates', '')
    const totalActiveCandidates = get(electionGlobals, 'numberActiveCandidates', '')
    const lockupAsset = get(electionGlobals, 'lockupAsset', { quantity: '', contract: '' })

    // Process lockupAsset
    if (lockupAsset && lockupAsset.quantity) {
      processedResult.lockupAsset = lockupAsset.quantity
    }

    // Process totalVotesCandidates
    if (totalVotesCandidates) {
      processedResult.totalVotesCandidates = totalVotesCandidates
    }

    // Process totalActiveCandidates
    if (totalActiveCandidates) {
      processedResult.totalActiveCandidates = totalActiveCandidates
    }

    // Process totalBudgetPercentage and custodianBudget
    if (totalBudgetPercentage > 0) {
      processedResult.totalBudgetPercentage = totalBudgetPercentage
      processedResult.custodianBudget = Math.trunc(
        (totalBudgetPercentage * parseFloat(split(result.dacTreasury.balance, 'TLM')[0])) /
          100 /
          100
      )
    }

    // Process lastPeriodTime and periodLength for nextPeriodTime
    if (lastPeriodTime && periodLength) {
      const dateLastElection = getISODateUTC(lastPeriodTime)
      const dateNewElection: any = dateLastElection.plus({ seconds: periodLength }).toBSON()
      processedResult.lastElectionTime = dateLastElection.toMillis()

      // Calculate time for next election
      processedResult.nextPeriodTime = dateNewElection - DateTime.now().toMillis()
    }
    processedResult.dac_id = get(result, 'dacId', '')
    processedResult.dac_state = 0
    processedResult.symbol.sym = result.symbol.precision + ',' + result.symbol.code
    if (!result.dacTreasury) {
      processedResult.dacTreasury = { balance: 0 }
    } else {
      processedResult.dacTreasury.balance = result.dacTreasury.balance || 0
    }

    return processedResult
  }

  return {}
}

export const isObjectEqual = (obj1: any, obj2: any) => {
  // Check if both are the same type and not null
  if (typeof obj1 !== typeof obj2 || obj1 === null || obj2 === null) {
    return false
  }

  // If both are not objects (primitives), directly compare them
  if (typeof obj1 !== 'object') {
    return obj1 === obj2
  }

  // Compare the keys length
  const keys1 = Object.keys(obj1)
  const keys2 = Object.keys(obj2)

  if (keys1.length !== keys2.length) {
    return false
  }

  // Recursively check each key and its value
  for (let key of keys1) {
    if (!keys2.includes(key) || !isObjectEqual(obj1[key], obj2[key])) {
      return false
    }
  }

  return true
}

export const getPreviousDate = (inputDate: string, daysToSubtract: number): string | undefined => {
  const date: DateTime = DateTime.fromISO(inputDate)

  if (date?.isValid) {
    const previousDate = date.minus({ days: daysToSubtract })
    return previousDate.toISO() // Return the result in ISO format
  }

  return undefined // Return undefined if input date is invalid
}

export const getMiningRewardsTimeInHours = (timerMiningRewards: string | null) => {
  if (!timerMiningRewards) return 0

  const timerDate: Date = new Date(timerMiningRewards)
  const now: Date = new Date(split(new Date().toISOString(), 'Z')[0])

  const timeDifference: number = timerDate.getTime() - now.getTime()
  const hourDifference: number = Math.ceil(timeDifference / (1000 * 60 * 60))

  if (hourDifference < 0) return 0
}
