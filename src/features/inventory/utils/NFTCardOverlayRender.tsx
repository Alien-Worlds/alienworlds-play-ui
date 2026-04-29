import { useEffect, useState } from 'react'

import {
  AttackIcon2,
  InfoIcon2,
  LandOccupancyIcon,
  MiningIcon,
  RarityCardIcon,
  DefenseIcon2,
  LightIcon2,
  StackingIcon,
  LandIcon2,
  NFTOldIcon,
  ShiningIcon,
  ItemIcon,
  CraftIcon,
  Search2Icon,
} from '@alien-worlds/icons'
import { Button as UIButton } from '@alien-worlds/uikit'
import { Flex, Grid, GridItem, HStack, Text, useMediaQuery, VStack, Button } from '@chakra-ui/react'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { ELEMENTTYPES, LooseObject } from 'features/inventory/utils/NFTCardHelper'
import { LandBoostsDay } from 'features/mining/types/LandownerTypes'
import _, { find, map, toLower, toUpper } from 'lodash'
import { useMatch, useNavigate } from 'react-router-dom'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'
import { PagePath } from 'store/main/types'
import { v4 } from 'uuid'

import { Constants } from '../../../shared/util/constants'
import { formatLandRating } from '../../../shared/util/helpers'

const NFTCardType = ({ asset }: LooseObject) => {
  const type = toUpper(_.get(asset, 'type.name', ''))
  const subType = toUpper(_.get(asset, 'subType.name', ''))
  if (!type || !subType || type === 'LAND' || type === 'ORE') return null

  return (
    <HStack width="100%">
      <HStack width="30%" justifyContent="flex-start">
        <ItemIcon boxSize={20} color={Colors.SNOW_WHITE} />
        <Text
          fontFamily="Titillium Web"
          fontSize={16}
          color={Colors.SNOW_WHITE}
          fontWeight={500}
          letterSpacing="tight"
        >
          Type
        </Text>
      </HStack>

      <HStack width="70%" justifyContent="flex-end">
        <Text
          fontFamily="Orbitron"
          fontSize={16}
          color={Colors.SNOW_WHITE}
          fontWeight={500}
          letterSpacing={2}
          align="end"
        >
          {subType}
        </Text>
      </HStack>
    </HStack>
  )
}

const NFTCardShine = ({ asset }: LooseObject) => {
  const shine = _.get(asset, 'shine.name', false) ? toUpper(_.get(asset, 'shine.name', false)) : ''
  const type = _.get(asset, 'type.name', false) ? toUpper(_.get(asset, 'type.name', false)) : ''

  if (!shine || type === 'LAND' || type === 'ORE' || asset.disableInnerRing) return null

  return (
    <HStack width="100%">
      <HStack width="50%" justifyContent="flex-start">
        <ShiningIcon boxSize={22} color={Colors.SHINE_COLORS[toLower(shine)]} />
        <Text
          fontFamily="Titillium Web"
          fontSize={16}
          color={Colors.SNOW_WHITE}
          fontWeight={500}
          letterSpacing="tight"
        >
          Shine
        </Text>
      </HStack>

      <HStack width="50%" justifyContent="flex-end">
        <Text
          fontFamily="Orbitron"
          fontSize={16}
          color={Colors.SHINE_COLORS[toLower(shine)]}
          fontWeight={500}
          letterSpacing={2}
        >
          {shine}
        </Text>
      </HStack>
    </HStack>
  )
}

const NFTCardRarity = ({ asset }: LooseObject) => {
  const rarity = toUpper(_.get(asset, 'rarity.name', false))
  if (!rarity) return null

  return (
    <HStack width="100%">
      <HStack width="50%" justifyContent="flex-start">
        <RarityCardIcon boxSize={22} color={Colors.RARITY_COLORS[toLower(rarity)]} />
        <Text
          fontFamily="Titillium Web"
          fontSize={16}
          color={Colors.SNOW_WHITE}
          fontWeight={500}
          letterSpacing="tight"
        >
          Rarity
        </Text>
      </HStack>

      <HStack width="50%" justifyContent="flex-end">
        <Text
          fontFamily="Orbitron"
          fontSize={14}
          color={Colors.RARITY_COLORS[toLower(rarity)]}
          fontWeight={500}
          letterSpacing={2}
        >
          {rarity}
        </Text>
      </HStack>
    </HStack>
  )
}

const NFTCardLandRating = ({ asset }: LooseObject) => {
  const rating = _.get(asset, 'landrating.name')
  const type = toUpper(_.get(asset, 'type.name', ''))

  if (!rating || type !== 'LAND') return null

  return (
    <HStack width="100%">
      <HStack width="50%" justifyContent="flex-start">
        <InfoIcon2 boxSize={22} />
        <Text
          fontFamily="Titillium Web"
          fontSize={16}
          color={Colors.SNOW_WHITE}
          fontWeight={500}
          letterSpacing="tight"
        >
          Land Rating
        </Text>
      </HStack>

      <HStack width="50%" justifyContent="flex-end">
        <Text fontFamily="Orbitron" fontSize={14} fontWeight={500} letterSpacing={2}>
          {formatLandRating(rating)}
        </Text>
      </HStack>
    </HStack>
  )
}

const NFTCardLandComissionLabel = ({ asset }: LooseObject) => {
  const type = _.get(asset, 'type.name')
  const commission = _.get(asset, 'commission.name', 0)
  if (type !== 'Land') return null
  return (
    <HStack width="100%" mb="-5px">
      <HStack width="50%" justifyContent="flex-start">
        <LandOccupancyIcon width={22} />
        <Text
          fontFamily="Titillium Web"
          fontSize={16}
          color={Colors.SNOW_WHITE}
          fontWeight={500}
          letterSpacing="tight"
        >
          Commission
        </Text>
      </HStack>

      <HStack width="50%" justifyContent="flex-end">
        <Text fontFamily="Orbitron" fontSize={16} fontWeight={500} letterSpacing={2}>
          {commission}%
        </Text>
      </HStack>
    </HStack>
  )
}

const NFTCardCharge = ({ asset }: LooseObject) => {
  const charge = _.get(asset, 'chargeValue.name', false)

  const labelPostFix = toUpper(_.get(asset, 'type.name', '')) === 'TOOL' ? 'Time' : 'Multiplier'
  const valuePostFix = toUpper(_.get(asset, 'type.name', '')) === 'TOOL' ? 's' : ''
  if (!charge) return null
  return (
    <HStack width="100%">
      <HStack width="80%" justifyContent="flex-start">
        <LightIcon2 boxSize={22} />
        <Text
          fontFamily="Titillium Web"
          fontSize={16}
          color={Colors.SNOW_WHITE}
          fontWeight={500}
          letterSpacing="0.01em"
        >
          Charge {labelPostFix}
        </Text>
      </HStack>

      <HStack width="30%" justifyContent="flex-end" spacing={0}>
        <Text
          fontFamily="Orbitron"
          fontSize={16}
          color={Colors.NAVY_BLUE}
          fontWeight={600}
          letterSpacing="tight"
        >
          {charge}
        </Text>
        <Text fontFamily="Orbitron" fontSize={16} color="white" fontWeight={600} letterSpacing={2}>
          {valuePostFix}
        </Text>
      </HStack>
    </HStack>
  )
}

const NFTCardMiningPower = ({ asset }: LooseObject) => {
  const ease = _.get(asset, 'ease.name', false)

  if (!ease) return null
  return (
    <HStack width="100%">
      <HStack width="70%" justifyContent="flex-start">
        <MiningIcon boxSize={20} color={Colors.DARK_YELLOW} />
        <Text
          fontFamily="Titillium Web"
          fontSize={16}
          color={Colors.SNOW_WHITE}
          fontWeight={500}
          letterSpacing="tight"
        >
          Mining Power
        </Text>
      </HStack>

      <HStack width="30%" justifyContent="flex-end" spacing={0}>
        <Text
          fontFamily="Orbitron"
          fontSize={16}
          color={Colors.DARK_YELLOW}
          fontWeight={600}
          letterSpacing={2}
        >
          {ease}
        </Text>
      </HStack>
    </HStack>
  )
}

const NFTCardPower = ({ asset }: LooseObject) => {
  const difficulty = _.get(asset, 'difficulty.name', null)

  if (difficulty === null) return null
  return (
    <HStack width="100%">
      <HStack width="70%" justifyContent="flex-start">
        <LandIcon2 boxSize={20} color={Colors.DARK_YELLOW} />
        <Text
          fontFamily="Titillium Web"
          fontSize={16}
          color={Colors.SNOW_WHITE}
          fontWeight={500}
          letterSpacing="tight"
        >
          PWR
        </Text>
      </HStack>

      <HStack width="30%" justifyContent="flex-end" spacing={0}>
        <Text
          fontFamily="Orbitron"
          fontSize={16}
          color={Colors.DARK_YELLOW}
          fontWeight={600}
          letterSpacing={2}
        >
          {difficulty}
        </Text>
      </HStack>
    </HStack>
  )
}

const NFTCardLuck = ({ asset }: LooseObject) => {
  const luck = _.get(asset, 'luck.name', null)
  const rarity = _.get(asset, 'rarity.name', null)
  const type = _.get(asset, 'type.name', '')

  if (luck === null || Number.isNaN(luck)) return null
  return (
    <HStack width="100%">
      <HStack width="70%" justifyContent="flex-start">
        <NFTOldIcon boxSize={22} color={Colors.DARK_YELLOW} />
        <Text
          fontFamily="Titillium Web"
          fontSize={16}
          color={Colors.SNOW_WHITE}
          fontWeight={500}
          letterSpacing="tight"
        >
          NFT Power
        </Text>
      </HStack>

      <HStack width="30%" justifyContent="flex-end" spacing={0}>
        <Text
          fontFamily="Orbitron"
          fontSize={16}
          color={Colors.DARK_YELLOW}
          fontWeight={600}
          letterSpacing={2}
        >
          {type === 'Tool' && rarity === 'abundant' ? 0 : luck}
        </Text>
      </HStack>
    </HStack>
  )
}

const NFTCardArtifactType = ({ asset }: LooseObject) => {
  const artifactType = _.get(asset, 'artifact_type.name', null)
  if (artifactType === null) return null
  return (
    <HStack width="100%">
      <HStack width="70%" justifyContent="flex-start">
        <Text
          fontFamily="Titillium Web"
          fontSize={16}
          color={Colors.SNOW_WHITE}
          fontWeight={500}
          letterSpacing="tight"
        >
          Item Type
        </Text>
      </HStack>

      <HStack width="30%" justifyContent="flex-end" spacing={0}>
        <Text
          fontFamily="Orbitron"
          fontSize={16}
          color={Colors.DARK_YELLOW}
          fontWeight={600}
          letterSpacing={2}
        >
          {artifactType}
        </Text>
      </HStack>
    </HStack>
  )
}
const NFTCardAffinity = ({ asset }: LooseObject) => {
  const affinity = _.get(asset, 'affinity.name', null)
  if (affinity === null) return null

  return (
    <HStack width="100%">
      <HStack width="70%" justifyContent="flex-start">
        <Text
          fontFamily="Titillium Web"
          fontSize={16}
          color={Colors.SNOW_WHITE}
          fontWeight={500}
          letterSpacing="tight"
        >
          Affinity
        </Text>
      </HStack>

      <HStack width="30%" justifyContent="flex-end" spacing={0}>
        <Text
          fontFamily="Orbitron"
          fontSize={16}
          color={Colors.DARK_YELLOW}
          fontWeight={600}
          letterSpacing={2}
        >
          {affinity}
        </Text>
      </HStack>
    </HStack>
  )
}

const NFTCardMints = ({ asset }: LooseObject) => {
  const mints = _.get(asset, 'mints.name', false)
  const mintTypes = _.get(asset, 'mintTypes.name', 1)
  const type = _.get(asset, 'type.name', false) ? toUpper(_.get(asset, 'type.name', false)) : ''

  if (!mints || mintTypes > 1 || type === 'LAND') return null
  return (
    <HStack width="100%">
      <HStack width="70%" justifyContent="flex-start">
        <Text
          fontFamily="Titillium Web"
          fontSize={16}
          color={Colors.SNOW_WHITE}
          fontWeight={500}
          letterSpacing="tight"
        >
          Mint #
        </Text>
      </HStack>

      <HStack width="30%" justifyContent="flex-end" spacing={0}>
        <Text
          fontFamily="Orbitron"
          fontSize={16}
          color={Colors.DARK_YELLOW}
          fontWeight={600}
          letterSpacing={2}
        >
          {mints}
        </Text>
      </HStack>
    </HStack>
  )
}

const NFTCardAttack = ({ asset }: LooseObject) => {
  const attack = _.get(asset, 'attack.name', null)
  if (attack === null) return null
  return (
    <HStack width="100%">
      <HStack width="70%" justifyContent="flex-start">
        <AttackIcon2 boxSize={20} color={Colors.DARK_YELLOW} />
        <Text
          fontFamily="Titillium Web"
          fontSize={16}
          color={Colors.SNOW_WHITE}
          fontWeight={500}
          letterSpacing="tight"
        >
          Attack
        </Text>
      </HStack>

      <HStack width="30%" justifyContent="flex-end" spacing={0}>
        <Text
          fontFamily="Orbitron"
          fontSize={16}
          color={Colors.DARK_YELLOW}
          fontWeight={600}
          letterSpacing={2}
        >
          {attack}
        </Text>
      </HStack>
    </HStack>
  )
}
const NFTCardMoveCast = ({ asset }: LooseObject) => {
  const movecast = _.get(asset, 'moveCast.name', null)
  if (movecast === null) return null
  return (
    <HStack width="100%">
      <HStack width="70%" justifyContent="flex-start">
        <StackingIcon boxSize={20} color={Colors.DARK_YELLOW} />
        <Text
          fontFamily="Titillium Web"
          fontSize={16}
          color={Colors.SNOW_WHITE}
          fontWeight={500}
          letterSpacing="tight"
        >
          Move Cost
        </Text>
      </HStack>

      <HStack width="30%" justifyContent="flex-end" spacing={0}>
        <Text
          fontFamily="Orbitron"
          fontSize={16}
          color={Colors.DARK_YELLOW}
          fontWeight={600}
          letterSpacing={2}
        >
          {movecast}
        </Text>
      </HStack>
    </HStack>
  )
}

const NFTCardDefense = ({ asset }: LooseObject) => {
  const defense = _.get(asset, 'defense.name', null)
  if (defense === null) return null
  return (
    <HStack width="100%">
      <HStack width="70%" justifyContent="flex-start">
        <DefenseIcon2 boxSize={20} color={Colors.DARK_YELLOW} />
        <Text
          fontFamily="Titillium Web"
          fontSize={16}
          color={Colors.SNOW_WHITE}
          fontWeight={500}
          letterSpacing="tight"
        >
          Defense
        </Text>
      </HStack>

      <HStack width="30%" justifyContent="flex-end" spacing={0}>
        <Text
          fontFamily="Orbitron"
          fontSize={16}
          color={Colors.DARK_YELLOW}
          fontWeight={600}
          letterSpacing={2}
        >
          {defense}
        </Text>
      </HStack>
    </HStack>
  )
}

const NFTCardKey = ({ asset }: LooseObject) => {
  const key = _.get(asset, 'key.name', false)
  if (!key) return null
  return (
    <HStack width="100%">
      <HStack width="70%" justifyContent="flex-start">
        <CraftIcon boxSize={20} color={Colors.DARK_YELLOW} />
        <Text
          fontFamily="Titillium Web"
          fontSize={16}
          color={Colors.SNOW_WHITE}
          fontWeight={500}
          letterSpacing="tight"
        >
          Key
        </Text>
      </HStack>

      <HStack width="30%" justifyContent="flex-end" spacing={0}>
        <Text
          fontFamily="Orbitron"
          fontSize={16}
          color={Colors.DARK_YELLOW}
          fontWeight={600}
          letterSpacing={2}
        >
          {key}
        </Text>
      </HStack>
    </HStack>
  )
}
const NFTCardElementOrProcess = ({ asset, keyword }: LooseObject) => {
  const icon = _.get(asset, `${toLower(keyword)}Icon`, false)
  const name = _.get(asset, `${toLower(keyword)}.name`, null)

  if (!name) return null

  return (
    <HStack width="100%">
      <HStack width="70%" justifyContent="flex-start">
        <icon.name {...icon.styleConfig} />
        <Text
          fontFamily="Titillium Web"
          fontSize={16}
          color={Colors.SNOW_WHITE}
          fontWeight={500}
          letterSpacing="tight"
        >
          {keyword}
        </Text>
      </HStack>

      <HStack width="30%" justifyContent="flex-end" spacing={0}>
        <Text
          fontFamily="Orbitron"
          fontSize={16}
          color={Colors.DARK_YELLOW}
          fontWeight={600}
          letterSpacing={2}
        >
          {name}
        </Text>
      </HStack>
    </HStack>
  )
}

/**
 * Works for the Class,Level
 * @param asset
 * @param key
 * @returns
 */
const NFTCardEntity = ({ asset, keyword }) => {
  const name = _.get(asset, `${keyword}.name`, false)
  const label = _.get(asset, `${keyword}.label`, false)
  if (!name) return null
  return (
    <HStack width="100%">
      <HStack width="70%" justifyContent="flex-start">
        <Text
          fontFamily="Titillium Web"
          fontSize={16}
          color={Colors.SNOW_WHITE}
          fontWeight={500}
          letterSpacing="tight"
        >
          {label}
        </Text>
      </HStack>

      <HStack width="30%" justifyContent="flex-end" spacing={0}>
        <Text
          fontFamily="Orbitron"
          fontSize={16}
          color={Colors.DARK_YELLOW}
          fontWeight={600}
          letterSpacing={2}
        >
          {name}
        </Text>
      </HStack>
    </HStack>
  )
}

const NFTCardLandActions = ({ asset }: LooseObject) => {
  const type = toUpper(_.get(asset, 'type.name', null))
  const assetId = _.get(asset, 'assetId.name', null)
  const isCardOwner = _.get(asset, 'isUserOwner')
  const {
    wax: {
      setLand,
      setLandId,
      setNftLandCardProperties,
      executeOnboarding,
      setOnboarding,
      collectEvent,
      loadManagingLandDetailsAndBoosts,
    },
    main: { setIsLandOwnerAddSlotDrawerOpen },
  } = useActions()
  const {
    atomic: { ownedLandsAssets, landAsset, ownedLandsAssetsDayBoosts },
    wax: { isOnboarded, onboarding },
  } = useAppState()

  const setLandOrOnboard = () => {
    if (isOnboarded) {
      setLand(assetId)
    } else {
      collectEvent({ name: Constants.GA_AW_ONBOARDING_LAND })

      setOnboarding({ ...onboarding, landId: assetId })
      executeOnboarding()
    }
  }

  const [boostsIndicator, setBoostsIndicator] = useState<string | null>(null)

  useEffect(() => {
    if (type === 'LAND') {
      const hoveredLandAsset: IAsset = find(
        ownedLandsAssets,
        (b) => b.asset_id === asset.assetId.name
      )
      if (hoveredLandAsset) {
        const dayBoosts: LandBoostsDay = find(
          ownedLandsAssetsDayBoosts,
          (b) => b.landId === hoveredLandAsset.asset_id
        )

        const activeBoostSlots: number = dayBoosts?.boosts?.length
        const availableBoostSlots: number = hoveredLandAsset.data?.openslots

        setBoostsIndicator(`(${activeBoostSlots}/${availableBoostSlots})`)
      }
    }
  }, [])

  const navigate = useNavigate()
  const isLandPage = useMatch(PagePath.Land)

  if (type !== 'LAND') return null
  return (
    <Flex direction="column" w="full">
      {isOnboarded && (
        <Flex justify="center" mt="-5px">
          <Button
            w="200px"
            h="38px"
            textAlign="center"
            _hover={{ background: Colors.CARIBBEAN_GREEN, color: Colors.SNOW_WHITE }}
            background={Colors.CARIBBEAN_GREEN_ALPHA_30}
            borderRadius="22px"
            onClick={() => {
              setLandId(assetId)
              setNftLandCardProperties(asset)
              if (isCardOwner) {
                navigate(`${PagePath.LandMgt}/${assetId}`)
              } else {
                navigate(`${PagePath.Land}/${assetId}`)
              }
            }}
            border="2px solid"
            borderColor={Colors.CARIBBEAN_GREEN}
            color={Colors.CARIBBEAN_GREEN}
            pointerEvents="auto"
          >
            {isCardOwner ? 'Manage Land' : 'View Land'}
          </Button>
        </Flex>
      )}

      {isOnboarded && (
        <Flex pt={2} justify="center">
          <Button
            w="200px"
            h="38px"
            textAlign="center"
            _hover={{ background: Colors.WHISKEY, color: Colors.SNOW_WHITE }}
            background={Colors.WHISKEY_ALPHA_30}
            borderRadius="22px"
            onClick={() => {
              setLandId(assetId)
              loadManagingLandDetailsAndBoosts()
              setNftLandCardProperties(asset)
              setIsLandOwnerAddSlotDrawerOpen(true)
            }}
            border="2px solid"
            borderColor={Colors.WHISKEY}
            color={Colors.WHISKEY}
            pointerEvents="auto"
          >
            Boost Land {type === 'LAND' && boostsIndicator}
          </Button>
        </Flex>
      )}
      {assetId !== landAsset?.asset_id && (
        <Flex pt={2} justify="center">
          <UIButton
            variant="negative"
            size="sm"
            width="200px"
            height="38px"
            maxHeight="38px"
            fontSize={14}
            onClick={() => {
              if (isLandPage) {
                setLandOrOnboard()
              } else {
                setLand(assetId)
              }
            }}
          >
            Set Land
          </UIButton>
        </Flex>
      )}
    </Flex>
  )
}

export const NFTCardSetAvatar = ({ asset }: LooseObject) => {
  const type = toUpper(_.get(asset, 'type.name', null))

  const assetId = _.get(asset, 'assetId.name', null)

  const {
    wax: { setAvatar },
  } = useActions()

  if (type !== 'AVATAR') return null
  return (
    <Flex w="full" justify="flex-end" mt={6}>
      <UIButton onClick={() => setAvatar(assetId)} variant="negative" size="xs" width="110px">
        Set Avatar
      </UIButton>
    </Flex>
  )
}

const renderComponent = (element: LooseObject) => {
  switch (element.elementType) {
    case ELEMENTTYPES.TEXT:
      return (
        <Text key={v4()} {...element.styleConfig}>
          {element.name}
        </Text>
      )
    case ELEMENTTYPES.NODE:
      return <element.name key={v4()} {...element.styleConfig}></element.name>

    default:
      return <></>
  }
}

const NFTCardChargeRender = ({ asset }: LooseObject) => {
  const type = toUpper(_.get(asset, 'type.name', null))
  const charge = _.split(_.get(asset, 'chargeValue.name', null), 'x')[0]
  const postfix = type === 'LAND' ? 'x' : 's'
  const postfixLand = type === 'LAND' ? 'MULTIPLIER' : ''
  if (!charge) return null
  return (
    <HStack>
      <LightIcon2 boxSize={20} />
      <HStack spacing={2}>
        <HStack spacing={0}>
          <Text
            fontFamily="Orbitron"
            fontSize={20}
            color={Colors.ELECTRIC_BLUE}
            fontWeight={600}
            letterSpacing={2}
          >
            {charge}
          </Text>
          <Text
            fontFamily="Orbitron"
            fontSize={18}
            color={Colors.SNOW_WHITE}
            fontWeight={500}
            letterSpacing={2}
          >
            {postfix}
          </Text>
        </HStack>

        <Text
          fontFamily="Orbitron"
          fontSize={16}
          color={Colors.SNOW_WHITE}
          fontWeight={500}
          ml={2}
          letterSpacing="0.1em"
        >
          {postfixLand}
        </Text>
      </HStack>
    </HStack>
  )
}

const NFTCardOverlayRender = ({ asset, isNFTCard = true, zoom }: LooseObject) => {
  const Entities = ['level', 'class']
  const Entities2 = ['Element', 'Process']
  const type = toUpper(_.get(asset, 'type.name', ''))

  return (
    <VStack width="100%" spacing={3} pt={type === 'LAND' ? 0 : 7}>
      <NFTCardLandComissionLabel asset={asset} />
      <NFTCardRarity asset={asset} />
      <NFTCardShine asset={asset} />
      <NFTCardType asset={asset} />
      <NFTCardCharge asset={asset} />
      <NFTCardMiningPower asset={asset} />,
      <NFTCardPower asset={asset} />
      <NFTCardLuck asset={asset} />
      <NFTCardAffinity asset={asset} />
      <NFTCardArtifactType asset={asset} />
      <NFTCardAttack asset={asset} />,
      <NFTCardMoveCast asset={asset} />,
      <NFTCardDefense asset={asset} />,
      <NFTCardKey asset={asset} />
      {Entities2.map((data, index) => {
        return (
          <NFTCardElementOrProcess key={`entity2-${data}-${index}`} asset={asset} keyword={data} />
        )
      })}
      {Entities.map((data, index) => {
        return <NFTCardEntity key={`entity-${data}-${index}`} asset={asset} keyword={data} />
      })}
      {type !== 'LAND' && (
        <Flex w="100%" mt="15px">
          <NFTCardMints asset={asset} />
        </Flex>
      )}
      {isNFTCard && <NFTCardLandRating asset={asset} />}
      {isNFTCard && <NFTCardLandActions asset={asset} />}
      {zoom && type !== 'LAND' && (
        <Flex h="100%" alignItems="end" position="absolute" bottom="25px">
          <UIButton
            size="md"
            fontSize={16}
            variant="info"
            onClick={zoom}
            leftIcon={<Search2Icon boxSize="15px" style={{ marginLeft: '-10px' }} />}
          >
            Zoom
          </UIButton>
        </Flex>
      )}
    </VStack>
  )
}

const NFTCardTopRightPanelRender = ({ asset }: LooseObject) => {
  const mod = _.get(asset, 'mod', [])

  if (!mod) return null
  return (
    <HStack height={18}>
      {mod.map((item: LooseObject, index: number) => {
        // Create stable key based on item properties and index
        const stableKey = `mod-${index}-${item.name || ''}-${item.elementType || ''}`
        return <Flex key={stableKey}>{renderComponent(item)}</Flex>
      })}
    </HStack>
  )
}

const NFTCardDetailPanelRender = ({ asset }: LooseObject) => {
  const copies = _.get(asset, 'cardcopies.name', false)
  const type = toUpper(_.get(asset, 'type.name', null))
  const title = _.get(asset, 'title.name', '')
  const description = _.get(asset, 'description.name', '')
  const owner = _.get(asset, 'owner.name', '')

  return (
    <VStack spacing={0} align="center">
      <NFTCardChargeRender asset={asset} />
      <VStack spacing={0} align="center">
        <Text
          fontFamily="Orbitron"
          fontSize={18}
          maxW={250}
          color="white"
          fontWeight={500}
          letterSpacing="0.1em"
          textAlign="center"
          marginTop={0}
        >
          {title}
        </Text>
        {copies && (
          <Text
            fontFamily="Orbitron"
            fontSize={12}
            color={Colors.DARK_YELLOW}
            fontWeight={600}
            letterSpacing="0.1em"
          >
            {copies}x copies owned
          </Text>
        )}
        <Text
          fontFamily="Titillium Web"
          fontSize={14}
          color={Colors.SNOW_WHITE}
          textAlign="center"
          fontWeight={400}
          maxW={250}
          letterSpacing="0.1em"
        >
          {description}
        </Text>
      </VStack>

      {type === 'LAND' && (
        <Text
          fontFamily="Titillium Web"
          fontSize={14}
          color={Colors.DARK_YELLOW}
          textAlign="center"
          fontWeight={400}
          mt={2}
          maxW={250}
          letterSpacing="0.1em"
        >
          {owner}
        </Text>
      )}
    </VStack>
  )
}

const NFTCardBottomPanelRender = ({ asset }: LooseObject) => {
  const cardPowers = _.get(asset, 'cardPowers', [])
  const justify = (index: number, size: number) => {
    switch (index) {
      case 0:
        return 'flex-start'
      case 1:
        if (size > 2) return 'center'
        return 'flex-end'
      default:
        return 'flex-end'
    }
  }
  return (
    <Grid width="90%" templateColumns={cardPowers.length === 3 ? '1fr 1fr 1fr' : '1fr 1fr'}>
      {map(cardPowers, (item: any, index: number) => (
        <GridItem key={v4()} justifySelf={justify(index, cardPowers.length)}>
          <HStack>
            {map(item, (element) => {
              return <div key={v4()}>{renderComponent(element)}</div>
            })}
          </HStack>
        </GridItem>
      ))}
    </Grid>
  )
}

const NFTShowAllRender = ({ asset }: LooseObject) => {
  const {
    atomic: { assets },
  } = useAppState()
  const [isLargerThanMobile] = useMediaQuery('(min-width: 640px)')
  const assetsRepeated =
    assets && assets.length
      ? assets.filter(
          (nft) =>
            nft.data?.name === asset.title.name && nft.template?.template_id === asset.templateId
        )
      : []
  if (!asset.multipleMintTypes) return null
  return (
    <VStack spacing={1} align="center">
      <Text
        fontFamily="Orbitron"
        fontSize={16}
        color={Colors.SNOW_WHITE}
        fontWeight={500}
        letterSpacing="0.1em"
      >
        {asset?.title?.name}
      </Text>
      <Text
        fontFamily="Orbitron"
        fontSize={14}
        color={Colors.SNOW_WHITE}
        fontWeight={500}
        mt={1}
        letterSpacing="0.1em"
      >
        {asset?.subType?.name}
      </Text>

      <Text
        ml="auto"
        letterSpacing="0.1em"
        textTransform="uppercase"
        fontFamily="Orbitron"
        color={Colors.SHINY_GOLD}
        textAlign="left"
        marginTop={4}
      >
        MINT NUMBERS
      </Text>
      <Grid templateColumns="1fr 1fr" gap={isLargerThanMobile ? 3 : 2}>
        {assetsRepeated.map((item, index) => {
          return (
            <GridItem key={`asset-${item.asset_id || item.template_id || index}`}>
              <Text
                letterSpacing="0.1em"
                textTransform="uppercase"
                fontFamily="Orbitron"
                color={Colors.SHINY_GOLD}
                textAlign="left"
              >
                {item.template_mint}
              </Text>
            </GridItem>
          )
        })}
      </Grid>
    </VStack>
  )
}

const CommunityNFTCardOverlayRender = ({ asset, zoom }: LooseObject) => {
  const title = _.get(asset, 'title.name', '')
  const artistName = _.get(asset, 'artist.name', '')

  return (
    <VStack width="100%" align="center" mt={10}>
      <Text
        fontFamily="orb"
        fontSize={20}
        color={Colors.SNOW_WHITE}
        fontWeight={400}
        textAlign="center"
        isTruncated
        maxW="full"
      >
        {title}
      </Text>

      <Text fontFamily="tlm" fontSize={14} color={Colors.DI_SERRIA} fontWeight={400}>
        {artistName}
      </Text>
      {zoom && (
        <Flex pt="100%">
          <UIButton
            size="md"
            fontSize={16}
            variant="info"
            onClick={zoom}
            leftIcon={<Search2Icon boxSize="20px" />}
          >
            Zoom
          </UIButton>
        </Flex>
      )}
    </VStack>
  )
}

export {
  NFTCardOverlayRender,
  NFTCardTopRightPanelRender,
  NFTCardDetailPanelRender,
  NFTCardBottomPanelRender,
  NFTShowAllRender,
  CommunityNFTCardOverlayRender,
}
