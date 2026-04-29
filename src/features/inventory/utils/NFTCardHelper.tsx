import {
  AttackIcon2,
  MiningIcon,
  DefenseIcon2,
  StackingIcon,
  LandIcon2,
  NFTOldIcon,
  CraftIcon,
  ElementAirIcon,
  ElementFireIcon,
  ElementGemIcon,
  ElementMetalIcon,
  ElementNatureIcon,
  ElementNeutralIcon,
  CatalystIcon2,
  MaterialIcon3,
  FusionIcon3,
} from '@alien-worlds/icons'
import mappingImages from 'assets/data/cardImgMappings.json'
import mappingPortraits from 'assets/data/cardPortraitImgMappings.json'
import templateMappings from 'assets/data/templateImageMappings.json'
import MegaBoostImg from 'assets/images/boosts/megaboost.gif'
import SuperBoostImg from 'assets/images/boosts/superboost.gif'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { NftRarity } from 'features/mining/utils/constants'
import _, { capitalize, find, toLower } from 'lodash'
import { Colors } from 'shared/util/colors'
import { AssetType, AssetProcess, AssetElement, AssetSchema } from 'store/atomic/types'

import { config } from '../../../shared/util/config'
import { Constants } from '../../../shared/util/constants'

export enum ELEMENTTYPES {
  ICON,
  TEXT,
  IMG,
  NODE,
}

export interface LooseObject {
  [key: string]: any
}

export type TextType = {
  name: string
  elementType: keyof typeof ELEMENTTYPES
  styleConfig: any
}

export type NFTCardTypes = {
  affinity?: TextType
  artifactType?: TextType
  type: TextType
  title: TextType
  description: TextType
  chargeValue?: TextType
  cardPowers?: any
  nftImage?: any
  rarity: any
  shine?: any
  cardcopies?: string
  mints?: TextType
  ease?: TextType
  difficulty?: TextType
  luck?: TextType
  defense?: TextType
  attack?: TextType
  moveCast?: TextType
  key?: TextType
  class?: TextType
  level?: TextType
  isInBag?: boolean
  commission?: TextType
  disableInnerRing?: boolean
  multipleMintTypes?: boolean
  assetId?: TextType
  templateId?: string
  issuedSupply?: TextType
  maxSupply?: TextType
}

const levelTemplateIdsAsOre = [
  '515558',
  '515559',
  '515560',
  '515561',
  '516018',
  '516019',
  '516020',
  '516021',
  '516022',
]

export { levelTemplateIdsAsOre }

const setType = (asset: IAsset, temp: LooseObject) => {
  const schema = _.get(asset, 'schema.schema_name', 'null')
  const templateId = _.get(asset, 'template.template_id', _.get(asset, 'template_id', null))
  const collection = _.get(asset, 'collection.collection_name', null)

  const isOreTemplateName = _.find(levelTemplateIdsAsOre, (n) => {
    if (n === templateId) {
      return true
    }
    return false
  })

  const mappings = {
    [AssetType.TOOL]: 'Tool',
    [AssetType.FACES]: 'Avatar',
    [AssetType.LAND]: 'Land',
    [AssetType.ARMS]: 'Weapon',
    [AssetType.CREW]: 'Minion',
    [AssetType.ITEMS]: 'Item',
    [AssetType.LEVEL]: isOreTemplateName ? 'Ore' : 'Level',
  }
  temp.disableInnerRing = false
  if (mappings[schema])
    temp.type = { name: mappings[schema], element: ELEMENTTYPES.TEXT, styleConfig: {} }

  if (
    mappings[schema] === 'Ore' ||
    mappings[schema] === 'Land' ||
    mappings[schema] === 'Item' ||
    collection === Constants.CONTRACT_ALIEN_AVATARS
  )
    temp.disableInnerRing = true

  return mappings[schema]
}

const setTitle = (asset: IAsset, temp) => {
  const schema = _.get(asset, 'schema.schema_name', 'null')
  const data = _.get(asset, 'data', _.get(asset, 'immutable_data'))

  const mappings = {
    [AssetType.TOOL]: data.name,
    [AssetType.FACES]: data.name,
    [AssetType.LAND]: data.name
      .split(' ')
      .splice(0, data.name.split(' ').length - 2)
      .join(' '),
    [AssetType.ARMS]: data.name,
    [AssetType.CREW]: data.name,
    [AssetType.LEVEL]: data.name,
    [AssetType.ITEMS]: data.name,
  }
  if (mappings[schema])
    temp.title = { name: mappings[schema], element: ELEMENTTYPES.TEXT, styleConfig: {} }
  return mappings[schema]
}

const setMod = (asset: IAsset, temp: LooseObject) => {
  const schema = _.get(asset, 'schema.schema_name', null)
  const landMod = `${asset.data.x || 0}:${asset.data.y || 0}`
  const armsMod = _.get(asset, 'data.class', '')
  const crewModOrLevel = _.get(asset, 'data.element', '')
  const itemsMod = _.get(asset, 'data.element', '')

  const textStyle = { fontFamily: 'Orbitron', fontSize: 12, fontWeight: 700, letterSpacing: 2 }

  const mappings = {
    [AssetType.TOOL]: null,
    [AssetType.FACES]: null,
    [AssetType.LAND]: [
      { name: landMod, elementType: ELEMENTTYPES.TEXT, styleConfig: textStyle },
      {
        name: StackingIcon,
        elementType: ELEMENTTYPES.NODE,
        styleConfig: {
          fill: Colors.SNOW_WHITE,
          boxSize: 24,
          ml: 2,
        },
      },
    ],
    [AssetType.ITEMS]: [{ name: itemsMod, elementType: ELEMENTTYPES.TEXT, styleConfig: textStyle }],
    [AssetType.ARMS]: [{ name: armsMod, elementType: ELEMENTTYPES.TEXT, styleConfig: textStyle }],
    [AssetType.CREW]: [
      { name: crewModOrLevel, elementType: ELEMENTTYPES.TEXT, styleConfig: textStyle },
    ],
    [AssetType.LEVEL]: [
      { name: crewModOrLevel, elementType: ELEMENTTYPES.TEXT, styleConfig: textStyle },
    ],
  }

  if (mappings[schema] && mappings[schema].length > 0) temp.mod = mappings[schema]

  return mappings[schema]
}

const setSubtitle = (asset: IAsset, temp: LooseObject) => {
  const type = _.get(asset, 'data.type', '')
  const name = _.get(asset, 'data.name', '')
  const schema = _.get(asset, 'schema.schema_name', null)
  const description = _.get(asset, 'data.description', '')

  const collection = _.get(asset, 'collection.collection_name', null)
  let result

  if (collection === Constants.CONTRACT_ALIEN_AVATARS) {
    result = _.get(asset, 'data', _.get(asset, 'immutable_data'))

    if (result) {
      temp.description = {
        name: `${result.top}, ${result.head}, ${result.legs}, ${result.torso}, ${result.equipment}, ${result.background}`,
        element: ELEMENTTYPES.TEXT,
        styleConfig: {},
      }
    }
  } else {
    const mappings = {
      [AssetType.TOOL]: type,
      [AssetType.FACES]: description,
      [AssetType.LAND]: name.split(' ')[name.split(' ')?.length - 1],
      [AssetType.ARMS]: description,
      [AssetType.CREW]: description,
      [AssetType.LEVEL]: description,
      [AssetType.ITEMS]: description,
    }
    if (mappings[schema])
      temp.description = {
        name: mappings[schema],
        element: ELEMENTTYPES.TEXT,
        styleConfig: {},
      }
    result = mappings[schema]
  }

  return result
}

const setLandComission = (asset: IAsset, temp: LooseObject) => {
  const schema = _.get(asset, 'schema.schema_name', null)
  const mutableDataCommission = _.get(asset, 'mutable_data.commission', 0)
  const currentCommission = _.divide(mutableDataCommission, 100)
  const mappings = {
    [AssetType.TOOL]: null,
    [AssetType.FACES]: null,
    [AssetType.LAND]: schema === AssetType.LAND ? currentCommission : null,
    [AssetType.ARMS]: null,
    [AssetType.CREW]: null,
    [AssetType.LEVEL]: null,
    [AssetType.ITEMS]: null,
  }
  if (mappings[schema])
    temp.commission = {
      name: mappings[schema],
      element: ELEMENTTYPES.TEXT,
      styleConfig: {},
    }
  return mappings[schema]
}

const setLandRating = (asset: IAsset, temp: LooseObject) => {
  const schema = _.get(asset, 'schema.schema_name', null)
  const landrating = _.get(asset, 'mutable_data.landrating', Constants.DEFAULT_LAND_RATING)
  const mappings = {
    [AssetType.TOOL]: null,
    [AssetType.FACES]: null,
    [AssetType.LAND]: landrating,
    [AssetType.ARMS]: null,
    [AssetType.CREW]: null,
    [AssetType.LEVEL]: null,
    [AssetType.ITEMS]: null,
  }
  if (mappings[schema])
    temp.landrating = {
      name: mappings[schema],
      element: ELEMENTTYPES.TEXT,
      styleConfig: {},
    }
  return mappings[schema]
}

const setChargeValue = (asset: IAsset, temp: LooseObject) => {
  const schema = _.get(asset, 'schema.schema_name', null)
  if (schema !== AssetType.TOOL && schema !== AssetType.LAND) {
    return null
  }

  const data = _.get(asset, 'data', _.get(asset, 'immutable_data'))

  const result = schema === AssetType.LAND ? `${data.delay / 10}x` : `${data.delay}`

  if (result) {
    temp.chargeValue = { name: result, element: ELEMENTTYPES.TEXT, styleConfig: {} }
  }
  return result
}

const getProcessIcon = (asset: IAsset) => {
  const schema = _.get(asset, 'data.process', null)

  const mappings = {
    [AssetProcess.CATALYST]: CatalystIcon2,
    [AssetProcess.FUSION]: FusionIcon3,
    [AssetProcess.MATERIAL]: MaterialIcon3,
  }

  return mappings[schema]
}
const setProcessIcon = (asset: IAsset, temp: LooseObject) => {
  const schema = _.get(asset, 'data.process', null)

  const mappings = {
    [AssetProcess.CATALYST]: CatalystIcon2,
    [AssetProcess.FUSION]: FusionIcon3,
    [AssetProcess.MATERIAL]: MaterialIcon3,
  }
  if (mappings[schema])
    temp.processIcon = {
      name: mappings[schema],
      element: ELEMENTTYPES.NODE,
      styleConfig: { boxSize: 20, color: Colors.DARK_YELLOW },
    }
  return mappings[schema]
}

const getElementIcon = (asset: IAsset) => {
  const schema = _.get(asset, 'data.element', null)
  const mappings = {
    [AssetElement.AIR]: ElementAirIcon,
    [AssetElement.FIRE]: ElementFireIcon,
    [AssetElement.GEM]: ElementGemIcon,
    [AssetElement.METAL]: ElementMetalIcon,
    [AssetElement.NATURE]: ElementNatureIcon,
    [AssetElement.NEUTRAL]: ElementNeutralIcon,
  }

  return mappings[schema]
}

const setElementIcon = (asset: IAsset, temp: LooseObject) => {
  const schema = _.get(asset, 'data.element', null)
  const mappings = {
    [AssetElement.AIR]: ElementAirIcon,
    [AssetElement.FIRE]: ElementFireIcon,
    [AssetElement.GEM]: ElementGemIcon,
    [AssetElement.METAL]: ElementMetalIcon,
    [AssetElement.NATURE]: ElementNatureIcon,
    [AssetElement.NEUTRAL]: ElementNeutralIcon,
  }

  if (mappings[schema])
    temp.elementIcon = {
      name: mappings[schema],
      element: ELEMENTTYPES.NODE,
      styleConfig: { boxSize: 20, color: Colors.DARK_YELLOW },
    }
  return mappings[schema]
}

export const setCardPowers = (asset: any, temp) => {
  let schema
  let ease
  let difficulty
  let attack
  let defense
  let movecast
  let rarity
  let key
  let artifactType
  let affinity
  let luck
  let collection

  // AssetType = IAsset
  if (asset.data) {
    schema = _.get(asset, 'schema.schema_name', null)
    ease = _.divide(_.get(asset, 'data.ease', null), 10)
    difficulty = _.get(asset, 'data.difficulty', null)
    attack = _.get(asset, 'data.attack', null)
    defense = _.get(asset, 'data.defense', null)
    movecast = _.get(asset, 'data.movecost', null)
    rarity = _.get(asset, 'data.rarity', null)
    key = _.get(asset, 'data.key', null)
    artifactType = _.get(asset, 'data.artifact_type', null)
    affinity = _.get(asset, 'data.affinity', null)
    luck = _.divide(_.get(asset, 'data.luck', null), 10)
    collection = _.get(asset, 'collection.collection_name', null)

    // set NFTPower to zero for Abundant Tools
    if (rarity === NftRarity.abundant && schema === AssetSchema.TOOL) {
      luck = 0
    }
    // AssetType = NFTCardTypes
  } else {
    ease = _.get(asset, 'ease.name', null)
    difficulty = _.get(asset, 'difficulty.name', null)
    attack = _.get(asset, 'attack.name', null)
    defense = _.get(asset, 'defense.name', null)
    movecast = _.get(asset, 'moveCast.name', null)
    rarity = _.get(asset, 'rarity.name', null)
    key = _.get(asset, 'key.name', null)
    artifactType = _.get(asset, 'artifact_type.name', null)
    affinity = _.get(asset, 'affinity.name', null)
    luck = _.get(asset, 'luck.name', null)
    collection = _.get(asset, 'collectionName.name', null)

    const mappings = {
      Tool: AssetType.TOOL,
      Avatar: AssetType.FACES,
      Weapon: AssetType.ARMS,
      Minion: AssetType.CREW,
      Artifact: AssetType.ITEMS,
    }

    const schemaTemp = _.get(asset, 'type.name', null)
    schema = mappings[schemaTemp]

    // Set NFTPower to zero for Abundant Tools
    if (capitalize(rarity) === NftRarity.abundant && schema === AssetSchema.TOOL) {
      luck = 0
    }
  }

  const textStyle = {
    fontFamily: 'Orbitron',
    fontSize: 14,
    color: 'white',
    fontWeight: 700,
    letterSpacing: 2,
  }
  const iconStyle = {
    boxSize: 20,
    color: Colors.DARK_YELLOW,
    fill: Colors.DARK_YELLOW,
  }
  const collectionStyle = {
    fontSize: 12,
    color: 'white',
    fontWeight: 500,
    letterSpacing: 2,
    fontFamily: 'Orbitron',
    opacity: collection === 'alienavatars' ? 1 : 0,
  }

  const mappings = {
    [AssetType.TOOL]: [
      [
        { name: MiningIcon, elementType: ELEMENTTYPES.NODE, styleConfig: iconStyle },
        { name: ease, elementType: ELEMENTTYPES.TEXT, styleConfig: textStyle },
      ],
      [
        { name: LandIcon2, elementType: ELEMENTTYPES.NODE, styleConfig: iconStyle },
        { name: difficulty, elementType: ELEMENTTYPES.TEXT, styleConfig: textStyle },
      ],
      [
        { name: luck, elementType: ELEMENTTYPES.TEXT, styleConfig: textStyle },
        { name: NFTOldIcon, elementType: ELEMENTTYPES.NODE, styleConfig: iconStyle },
      ],
    ],
    [AssetType.ITEMS]: [
      [{ name: affinity, elementType: ELEMENTTYPES.TEXT, styleConfig: textStyle }],
      [{ name: getElementIcon(asset), elementType: ELEMENTTYPES.NODE, styleConfig: iconStyle }],
      [{ name: artifactType, elementType: ELEMENTTYPES.TEXT, styleConfig: textStyle }],
    ],
    [AssetType.FACES]: [
      [{}],
      [{ name: 'AlienAvatars', elementType: ELEMENTTYPES.TEXT, styleConfig: collectionStyle }],
      [{}],
    ],
    [AssetType.LAND]: [
      [
        { name: MiningIcon, elementType: ELEMENTTYPES.NODE, styleConfig: iconStyle },
        { name: ease, elementType: ELEMENTTYPES.TEXT, styleConfig: textStyle },
      ],
      [
        { name: LandIcon2, elementType: ELEMENTTYPES.NODE, styleConfig: iconStyle },
        { name: difficulty, elementType: ELEMENTTYPES.TEXT, styleConfig: textStyle },
      ],
      [
        { name: luck, elementType: ELEMENTTYPES.TEXT, styleConfig: textStyle },
        { name: NFTOldIcon, elementType: ELEMENTTYPES.NODE, styleConfig: iconStyle },
      ],
    ],
    [AssetType.ARMS]: [
      [
        { name: AttackIcon2, elementType: ELEMENTTYPES.NODE, styleConfig: iconStyle },
        { name: attack, elementType: ELEMENTTYPES.TEXT, styleConfig: textStyle },
      ],
      [
        { name: defense, elementType: ELEMENTTYPES.TEXT, styleConfig: textStyle },
        {
          name: DefenseIcon2,
          elementType: ELEMENTTYPES.NODE,
          styleConfig: { ...iconStyle, ml: 'auto' },
        },
      ],
    ],
    [AssetType.CREW]: [
      [
        { name: AttackIcon2, elementType: ELEMENTTYPES.NODE, styleConfig: iconStyle },
        { name: attack, elementType: ELEMENTTYPES.TEXT, styleConfig: textStyle },
      ],
      [
        { name: StackingIcon, elementType: ELEMENTTYPES.NODE, styleConfig: iconStyle },
        { name: movecast, elementType: ELEMENTTYPES.TEXT, styleConfig: textStyle },
      ],
      [
        { name: defense, elementType: ELEMENTTYPES.TEXT, styleConfig: textStyle },
        { name: DefenseIcon2, elementType: ELEMENTTYPES.NODE, styleConfig: iconStyle },
      ],
    ],
    [AssetType.LEVEL]: [
      [
        { name: CraftIcon, elementType: ELEMENTTYPES.NODE, styleConfig: iconStyle },
        { name: key, elementType: ELEMENTTYPES.TEXT, styleConfig: textStyle },
      ],
      [{ name: getElementIcon(asset), elementType: ELEMENTTYPES.NODE, styleConfig: iconStyle }],
      [{ name: getProcessIcon(asset), elementType: ELEMENTTYPES.NODE, styleConfig: iconStyle }],
    ],
  }

  if (mappings[schema]) temp.cardPowers = mappings[schema]

  return mappings[schema]
}

const setNftImage = (asset: IAsset, temp: LooseObject) => {
  let result = null

  // temp solution until boost images are on IPFS
  if (asset?.data?.cardid === 45) {
    result = MegaBoostImg
  } else if (asset?.data?.cardid === 46) {
    result = SuperBoostImg
  } else {
    let mappedImg
    let hash = null
    // portraits mapping
    if (
      asset?.schema?.schema_name === 'tool.worlds' &&
      asset?.data?.cardid > 31 &&
      asset?.data?.cardid < 42
    ) {
      mappedImg = find(
        mappingPortraits,
        (item) => item.Cardid === asset?.data?.cardid && item.Shine === asset?.data?.shine
      )
      hash = mappedImg?.PortraitImage
    } else {
      mappedImg = find(
        mappingImages,
        (item) => item.Cardid === asset?.data?.cardid && item.Schema === asset?.schema?.schema_name
      )
      if (mappedImg && mappedImg.IPFSHash) {
        if (mappedImg.IPFSHash === 'templateLookup') {
          // some NFTs have template_id attribute, others have template.template_id
          const assetTemplateId: number = parseInt(`${asset?.template_id}` ?? '0', 10)
          const templateTemplateId: number = parseInt(`${asset?.template?.template_id}` ?? '0', 10)
          hash = find(
            templateMappings,
            (item) => item.Template === assetTemplateId || item.Template === templateTemplateId
          )?.IPFSHash
        } else {
          hash = mappedImg?.IPFSHash
        }
      }
    }
    if (hash) {
      result = `${config.IpfsApiUrl}/${hash}`
    } else {
      result = asset?.data?.img
        ? `${config.IpfsApiUrl}/${asset.data.img}`
        : '/images/alienworlds-profile-sample01.jpg'
    }
  }
  temp.nftImage = { name: result, elementType: ELEMENTTYPES.TEXT, styleConfig: {} }
  return result
}

const setCardRarity = (asset: IAsset, temp: LooseObject) => {
  const result = toLower(_.get(asset, 'data.rarity', 'common'))
  if (result) temp.rarity = { name: result, element: ELEMENTTYPES.TEXT, styleConfig: {} }
  return result
}
const setCardOwner = (asset: IAsset, temp: LooseObject, walletId) => {
  const result = toLower(_.get(asset, 'owner', ''))
  if (result) {
    temp.owner = { name: result, element: ELEMENTTYPES.TEXT, styleConfig: {} }
    temp.isUserOwner = result === walletId
  }
  return result
}
const setCollectionName = (asset: IAsset, temp: LooseObject) => {
  const result = toLower(_.get(asset, 'collection.collection_name', ''))
  if (result) temp.collectionName = { name: result, element: ELEMENTTYPES.TEXT, styleConfig: {} }

  return result
}
const setCardShine = (asset: IAsset, temp: LooseObject) => {
  const result = toLower(_.get(asset, 'data.shine', 'stone'))
  if (result) temp.shine = { name: result, element: ELEMENTTYPES.TEXT, styleConfig: {} }
  return result
}
const setCardCopies = (asset: IAsset, temp: LooseObject) => {
  const result = _.get(asset, 'total_of_type', 0)
  if (result > 1) temp.cardcopies = { name: result, element: ELEMENTTYPES.TEXT, styleConfig: {} }
  return result
}

const setCardMint = (asset: IAsset, temp: LooseObject) => {
  const result = _.get(asset, 'template_mint', 0)
  // @ts-ignore
  if (result > 0) temp.mints = { name: result, element: ELEMENTTYPES.TEXT, styleConfig: {} }
  return result
}

const setCardMintTypes = (asset: IAsset, temp: LooseObject) => {
  const result = _.get(asset, 'total_of_type', 1)
  temp.multipleMintTypes = false
  if (result > 0) temp.mintTypes = { name: result, element: ELEMENTTYPES.TEXT, styleConfig: {} }
  if (result > 1) temp.multipleMintTypes = true
  return result
}
const setCardAssetId = (asset: IAsset, temp: LooseObject) => {
  const result = _.get(asset, 'asset_id', 1)
  // @ts-ignore
  if (result > 0) temp.assetId = { name: result, element: ELEMENTTYPES.TEXT, styleConfig: {} }
  return result
}

const setCardEase = (asset: IAsset, temp: LooseObject) => {
  const result = _.get(asset, 'data.ease', null)
  if (result !== null && result >= 0)
    temp.ease = { name: _.divide(result, 10), element: ELEMENTTYPES.TEXT, styleConfig: {} }
  return result
}

const setCardDifficulty = (asset: IAsset, temp: LooseObject) => {
  const result = _.get(asset, 'data.difficulty', null)
  if (result !== null && result >= 0)
    temp.difficulty = { name: result, element: ELEMENTTYPES.TEXT, styleConfig: {} }
  return result
}

const setCardLuck = (asset: IAsset, temp: LooseObject) => {
  const result = _.get(asset, 'data.luck', null)

  if (result !== null && result >= 0)
    temp.luck = { name: _.divide(result, 10), element: ELEMENTTYPES.TEXT, styleConfig: {} }
  return result
}

const setCardAttack = (asset: IAsset, temp: LooseObject) => {
  const result = _.get(asset, 'data.attack', null)
  if (result >= 0) temp.attack = { name: result, element: ELEMENTTYPES.TEXT, styleConfig: {} }
  return result
}

const setCardDefense = (asset: IAsset, temp: LooseObject) => {
  const result = _.get(asset, 'data.defense', null)
  if (result !== null && result >= 0)
    temp.defense = { name: result, element: ELEMENTTYPES.TEXT, styleConfig: {} }
  return result
}

const setCardMoveCast = (asset: IAsset, temp: LooseObject) => {
  const result = _.get(asset, 'data.movecost', null)
  if (result !== null && result >= 0)
    temp.moveCast = { name: result, element: ELEMENTTYPES.TEXT, styleConfig: {} }
  return result
}

const setCardKey = (asset: IAsset, temp: LooseObject) => {
  const result = _.get(asset, 'data.key', null)
  if (result) temp.key = { name: result, element: ELEMENTTYPES.TEXT, styleConfig: {} }
  return result
}
const setCardElement = (asset: IAsset, temp: LooseObject) => {
  const result = _.get(asset, 'data.element', null)
  if (result) temp.element = { name: result, element: ELEMENTTYPES.TEXT, styleConfig: {} }
  return result
}
const setCardAffinity = (asset: IAsset, temp: LooseObject) => {
  const result = _.get(asset, 'data.affinity', null)
  if (result) temp.affinity = { name: result, element: ELEMENTTYPES.TEXT, styleConfig: {} }
  return result
}
const setCardArtifactType = (asset: IAsset, temp: LooseObject) => {
  const result = _.get(asset, 'data.artifact_type', null)
  if (result) temp.artifact_type = { name: result, element: ELEMENTTYPES.TEXT, styleConfig: {} }
  return result
}
const setCardProcess = (asset: IAsset, temp: LooseObject) => {
  const result = _.get(asset, 'data.process', null)
  if (result) temp.process = { name: result, element: ELEMENTTYPES.TEXT, styleConfig: {} }
  return result
}

const setCardClass = (asset: IAsset, temp: LooseObject) => {
  const result = _.get(asset, 'data.class', null)
  if (result)
    temp.class = { name: result, label: 'Class', element: ELEMENTTYPES.TEXT, styleConfig: {} }
  return result
}

const setCardTemplateId = (asset: IAsset, temp: LooseObject) => {
  const result = _.get(asset, 'template.template_id', null)
  if (result) temp.templateId = result
  return result
}

const setCardLevel = (asset: IAsset, temp: LooseObject) => {
  const result = _.get(asset, 'data.level', null)
  if (result)
    temp.level = { name: result, label: 'Level', element: ELEMENTTYPES.TEXT, styleConfig: {} }
  return result
}
const setSubType = (asset: IAsset, temp: LooseObject) => {
  const result = _.get(asset, 'data.type', null)
  if (result)
    temp.subType = { name: result, label: 'Level', element: ELEMENTTYPES.TEXT, styleConfig: {} }
  return result
}
const setIsInBag = (asset: IAsset, temp: LooseObject, bagAssets: any) => {
  const result = bagAssets.some((x) => x.template?.template_id === asset?.template?.template_id)
  temp.isInBag = result
  return result
}
const getPlanetGradient = (name: string): string => {
  const schema = toLower(name)?.trim()
  const mappings = {
    eyeke: 'linear-gradient(133deg, rgb(15,85,129) 50%, rgb(211,192,3) 100%)',
    veles: 'linear-gradient(133deg, rgb(236,184,82) 50%, rgb(171,196,30) 100%)',
    neri: 'linear-gradient(133deg, rgb(230,184,118) 50%, rgb(179,65,16) 100%)',
    kavian: 'linear-gradient(133deg, rgb(133,56,17) 50%, rgb(246,133,25) 100%)',
    naron: 'linear-gradient(133deg, rgb(180,187,231) 50%, rgb(76,122,32) 100%)',
  }
  return mappings[schema]
}
const setIssuedSupply = (asset: IAsset, temp: LooseObject) => {
  const result = toLower(_.get(asset, 'issued_supply', ''))
  if (result) temp.issuedSupply = { name: result, element: ELEMENTTYPES.TEXT, styleConfig: {} }
  return result
}
const setMaxSupply = (asset: IAsset, temp: LooseObject) => {
  const result = toLower(_.get(asset, 'max_supply', ''))
  if (result) temp.maxSupply = { name: result, element: ELEMENTTYPES.TEXT, styleConfig: {} }
  return result
}

const setArtistName = (asset: IAsset, temp: LooseObject) => {
  const result = _.get(asset, 'data.artist', null)
  if (result) temp.artist = { name: result, element: ELEMENTTYPES.TEXT, styleConfig: {} }
  return result
}

const NFTCardDataPreparation = (rawData: IAsset[], walletId?: string, bagAssets?: any) => {
  const organisedData = []
  for (let i = 0; rawData && i < rawData.length; i += 1) {
    const currentAsset = rawData[i]

    const temp: LooseObject = {}
    setCardAssetId(currentAsset, temp)
    setType(currentAsset, temp)
    setSubType(currentAsset, temp)
    setChargeValue(currentAsset, temp)
    setTitle(currentAsset, temp)
    setSubtitle(currentAsset, temp)
    setCardPowers(currentAsset, temp)
    setCardTemplateId(currentAsset, temp)
    setNftImage(currentAsset, temp)
    setCardRarity(currentAsset, temp)
    setCardShine(currentAsset, temp)
    setCardCopies(currentAsset, temp)
    setCardMint(currentAsset, temp)
    setCardEase(currentAsset, temp)
    setCardDifficulty(currentAsset, temp)
    setCardLuck(currentAsset, temp)
    setCardAttack(currentAsset, temp)
    setCardDefense(currentAsset, temp)
    setCardMoveCast(currentAsset, temp)
    setCardKey(currentAsset, temp)
    setCardClass(currentAsset, temp)
    setCardLevel(currentAsset, temp)
    setCardOwner(currentAsset, temp, walletId)
    setMod(currentAsset, temp)
    setElementIcon(currentAsset, temp)
    setProcessIcon(currentAsset, temp)
    setCardElement(currentAsset, temp)
    setCardAffinity(currentAsset, temp)
    setCardArtifactType(currentAsset, temp)
    setCardProcess(currentAsset, temp)
    setCardMintTypes(currentAsset, temp)
    setLandComission(currentAsset, temp)
    setLandRating(currentAsset, temp)
    setIssuedSupply(currentAsset, temp)
    setMaxSupply(currentAsset, temp)
    setCollectionName(currentAsset, temp)

    if (bagAssets) setIsInBag(currentAsset, temp, bagAssets)
    organisedData.push(temp)
  }

  return organisedData
}
const NFTCardSingleCardPrep = (currentAsset: IAsset, walletId) => {
  const temp: any = {}
  setCardAssetId(currentAsset, temp)
  setType(currentAsset, temp)
  setSubType(currentAsset, temp)
  setChargeValue(currentAsset, temp)
  setTitle(currentAsset, temp)
  setSubtitle(currentAsset, temp)
  setCardPowers(currentAsset, temp)
  setCardTemplateId(currentAsset, temp)
  setNftImage(currentAsset, temp)
  setCardRarity(currentAsset, temp)
  setCardShine(currentAsset, temp)
  setCardCopies(currentAsset, temp)
  setCardMint(currentAsset, temp)
  setCardEase(currentAsset, temp)
  setCardDifficulty(currentAsset, temp)
  setCardLuck(currentAsset, temp)
  setCardAttack(currentAsset, temp)
  setCardDefense(currentAsset, temp)
  setCardMoveCast(currentAsset, temp)
  setCardKey(currentAsset, temp)
  setCardClass(currentAsset, temp)
  setCardLevel(currentAsset, temp)
  setCardOwner(currentAsset, temp, walletId)
  setMod(currentAsset, temp)
  setElementIcon(currentAsset, temp)
  setProcessIcon(currentAsset, temp)
  setCardElement(currentAsset, temp)
  setCardProcess(currentAsset, temp)
  setCardMintTypes(currentAsset, temp)
  setLandComission(currentAsset, temp)
  setLandRating(currentAsset, temp)
  setIssuedSupply(currentAsset, temp)
  setMaxSupply(currentAsset, temp)
  setCollectionName(currentAsset, temp)
  return temp
}

const CommunityNftCardDataPreparation = (currentAsset: IAsset) => {
  const temp: any = {}
  setTitle(currentAsset, temp)
  setNftImage(currentAsset, temp)
  setCardRarity(currentAsset, temp)
  setArtistName(currentAsset, temp)

  return temp
}

export {
  NFTCardDataPreparation,
  getPlanetGradient,
  NFTCardSingleCardPrep,
  CommunityNftCardDataPreparation,
}
