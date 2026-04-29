import { useState, VFC, useEffect } from 'react'

import { RarityCardIcon, StackingIcon, ForwardIcon } from '@alien-worlds/icons'
import {
  Box,
  Divider,
  Flex,
  Stack,
  VStack,
  Text,
  useDisclosure,
  Button as ChakraButton,
  Img,
} from '@chakra-ui/react'
import megaboost from 'assets/images/boosts/megaboost.jpg'
import superboost from 'assets/images/boosts/superboost.jpg'
import { NFTCardSingleCardPrep } from 'features/inventory/utils/NFTCardHelper'
import { NFTCardOverlayRender } from 'features/inventory/utils/NFTCardOverlayRender'
import { BoostTable } from 'features/mining/components/LandOwners/Components/BoostTable/BoostTable'
import { LandImage } from 'features/mining/components/LandOwners/Components/LandImage'
import { NFTLandOwnerCommission } from 'features/mining/components/LandOwners/Components/LandOwnerCommission'
import { MinimumBoostSetting } from 'features/mining/components/LandOwners/Components/MinimumBoostSetting'
import { NextBoostCountdown } from 'features/mining/components/LandOwners/Components/NextBoostCountdown'
import { LandAddSlotModal } from 'features/mining/components/PlanetLand/Components/LandAddSlotModal'
import { LandUnlockSlotModal } from 'features/mining/components/PlanetLand/Components/LandUnlockSlotModal'
import { LandBoostLevel } from 'features/mining/types/LandownerTypes'
import { MainBoostLevels } from 'features/mining/utils/constants'
import { MEGA_BOOST_NFT_DESCRIPTION, SUPER_BOOST_NFT_DESCRIPTION } from 'features/mining/utils/land'
import {
  ClaimCommissionRewardsBtn,
  ClaimDTALRewardsBtn,
  SetLandBtn,
} from 'features/syndicates/components/PlanetaryActions/PlanetaryActions'
import { filter, toLower } from 'lodash'
import { useNavigate, useParams } from 'react-router-dom'
import { AppModal } from 'shared/layouts'
import { Colors } from 'shared/util/colors'
import { landBoostValueByRarity, formatLandRating } from 'shared/util/helpers'
import { useActions, useAppState } from 'store'
import { AssetSchema } from 'store/atomic/types'
import { PagePath } from 'store/main/types'

import { Constants } from '../../../shared/util/constants'

const LandMgt: VFC = () => {
  const {
    atomic: { landAsset: currentLand, ownedLandBoostsAssets, assetsFilter },
    wax: { walletId, managingLandId, nftLandCardProperties, managingLandDetails: landAsset },
  } = useAppState()

  const {
    atomic: { setAssetsFilter },
    wax: { setNftLandCardProperties },
    main: { showLandMgtPage },
  } = useActions()

  const navigate = useNavigate()
  const { id: currentLandId } = useParams()

  const boostDisclosure = useDisclosure()
  const unlockDisclosure = useDisclosure()
  const [showMainBoostsModal, setShowMainBoostsModal] = useState(false)
  const [slotToUnlock, setSlotToUnlock] = useState<number | null>(null)
  const [showUnlockModal, setShowUnlockModal] = useState<boolean>(false)
  const [selectedBoostImg, setSelectedBoostImg] = useState<string | null>(null)
  const [selectedBoost, setSelectedBoost] = useState<LandBoostLevel | null>(null)
  const [showLandBoostsSection, setShowLandBoostsSection] = useState<boolean>(false)
  const [availableMegaBoosts, setAvailableMegaBoosts] = useState<number | null>(null)
  const [availableSuperBoosts, setAvailableSuperBoosts] = useState<number | null>(null)

  const onShowMainBoostsModal = () => {
    setShowMainBoostsModal(true)
    boostDisclosure.onOpen()
  }

  const onBoost = (boostLvl: LandBoostLevel, img: string) => {
    setSelectedBoost(boostLvl)
    setSelectedBoostImg(img)
    onShowMainBoostsModal()
  }

  useEffect(() => {
    showLandMgtPage(currentLandId)
  }, [currentLandId])

  useEffect(() => {
    if (ownedLandBoostsAssets && ownedLandBoostsAssets?.length > 0) {
      setShowLandBoostsSection(true)
    }
    const megaBoostsCount: number = filter(
      ownedLandBoostsAssets,
      (boost) => boost.name === MainBoostLevels[0].name
    )?.length
    const superBoostsCount: number = filter(
      ownedLandBoostsAssets,
      (boost) => boost.name === MainBoostLevels[1].name
    )?.length

    setAvailableMegaBoosts(megaBoostsCount)
    setAvailableSuperBoosts(superBoostsCount)
  }, [ownedLandBoostsAssets])

  useEffect(() => {
    if (managingLandId && !nftLandCardProperties && landAsset) {
      setNftLandCardProperties(NFTCardSingleCardPrep(landAsset, walletId))
    }
  }, [managingLandId, nftLandCardProperties, landAsset])

  const onShowUnlockModal = () => {
    setShowUnlockModal(true)
    unlockDisclosure.onOpen()
  }

  return (
    <VStack spacing={4} w="full" pl={{ base: 0, lg: 6 }} mt={{ base: '-10px', md: '-30px' }}>
      <Stack
        gap={6}
        w="full"
        flexWrap="wrap"
        direction={{ base: 'column', lg: 'row' }}
        alignItems={{ base: 'center', lg: 'start' }}
        justifyContent={{ base: 'center', xl: 'start' }}
      >
        {/* Left section - Land Information */}
        <Flex
          padding="20px"
          h="min-content"
          direction="column"
          alignItems="center"
          borderRadius="20px"
          minW={{ base: '0px', sm: '400px' }}
          backgroundColor={Colors.GRAY_ALPHA_56}
          w={{ base: '100%', sm: 'fit-content' }}
        >
          <Flex
            justifyContent="flex-start"
            fontSize={20}
            color={Colors.SNOW_WHITE}
            fontFamily="tlm"
            alignItems="center"
            mb={5}
          >
            ({`${landAsset?.data?.x}:${landAsset?.data?.y}`}
            <StackingIcon />)
          </Flex>

          <Flex
            maxW={48}
            flexDir="column"
            position="relative"
            overflow="visible"
            ml="auto"
            mr="auto"
            w="full"
            mb={{ base: 8, sm: 0, lg: 8 }}
            mt={2}
            p={0}
          >
            <LandImage landAsset={landAsset} showPlanetIndicator />

            <Flex marginTop="20px" flexDirection="column">
              <Text
                fontFamily="Orbitron"
                fontWeight="bold"
                fontSize="large"
                letterSpacing="0.1em"
                textAlign="center"
              >
                {landAsset?.name.split(' on ')[0]}
              </Text>
              <Text
                fontFamily="Orbitron"
                fontWeight="normal"
                fontSize="medium"
                letterSpacing="0.1em"
                textAlign="center"
              >
                {landAsset?.name.split(' on ')[1]}
              </Text>
            </Flex>
          </Flex>

          <Divider />

          <Flex marginBlock="20px" flexDirection="column">
            <Text
              fontFamily="Orbitron"
              fontWeight="bold"
              fontSize={32}
              letterSpacing="0.1em"
              textAlign="center"
              color={Colors.CARIBBEAN_GREEN}
            >
              {formatLandRating(
                landAsset?.data?.landrating
                  ? landAsset?.data?.landrating
                  : Constants.DEFAULT_LAND_RATING
              )}
            </Text>
            <Text
              fontFamily="Titillium Web"
              fontWeight="bold"
              fontSize={18}
              letterSpacing="0.1em"
              textAlign="center"
            >
              Land Rating
            </Text>
          </Flex>

          {/* Boosts section */}
          {showLandBoostsSection && (
            <VStack marginBlock="25px">
              {/* MegaBoost */}
              <Flex
                gap="20px"
                mb="20px"
                flexWrap="wrap-reverse"
                justifyContent="center"
                alignItems="flex-end"
              >
                <Box w="200px" mb="20px">
                  <Text fontFamily="tlm" fontSize="24px" fontWeight={400} mt="-5px" mb="5px">
                    MEGA Boost
                  </Text>
                  <Text fontFamily="tlm" fontSize="small" fontWeight={400}>
                    {MEGA_BOOST_NFT_DESCRIPTION}
                  </Text>
                  <Text fontFamily="tlm" fontSize="small" fontWeight={400} fontStyle="italic">
                    *Cannot reduce the rating
                  </Text>
                  <ChakraButton
                    mt={4}
                    width="100%"
                    fontFamily="tlm"
                    borderRadius="22px"
                    // isFullWidth
                    borderColor={Colors.CARIBBEAN_GREEN}
                    borderWidth={2}
                    backgroundColor={Colors.CARIBBEAN_GREEN_ALPHA_30}
                    _hover={{ background: Colors.CARIBBEAN_GREEN, color: Colors.SNOW_WHITE }}
                    fontWeight={600}
                    fontSize="small"
                    onClick={() => onBoost(MainBoostLevels[0], megaboost)}
                  >
                    Apply Boost
                  </ChakraButton>
                </Box>
                <Box minW="150px" height="170px" justifySelf="end">
                  {availableMegaBoosts > 0 && (
                    <Box
                      p="1px"
                      mt="5px"
                      w="30px"
                      h="30px"
                      ml="115px"
                      border="2px solid"
                      position="absolute"
                      borderRadius="full"
                      bg={Colors.DARK_GRAY}
                      borderColor={Colors.SNOW_WHITE}
                    >
                      <Text
                        mb="3px"
                        fontFamily="tlm"
                        fontSize="medium"
                        textAlign="center"
                        fontWeight="normal"
                        color={Colors.SNOW_WHITE}
                      >
                        {availableMegaBoosts}
                      </Text>
                    </Box>
                  )}
                  <Img src={megaboost} width="150px" height="170px" borderRadius="10px" />
                </Box>
              </Flex>
              {/* SuperBoost */}
              <Flex
                width="100%"
                gap="20px"
                flexWrap="wrap-reverse"
                justifyContent="center"
                alignItems="flex-end"
              >
                <Box w="200px">
                  <Text fontFamily="tlm" fontSize="24px" fontWeight={400} mt="-5px" mb="5px">
                    SUPER Boost
                  </Text>
                  <Text fontFamily="tlm" fontSize="small" fontWeight={400}>
                    {SUPER_BOOST_NFT_DESCRIPTION}
                  </Text>
                  <Text fontFamily="tlm" fontSize="small" fontWeight={400} fontStyle="italic">
                    *Cannot reduce the rating
                  </Text>
                  <ChakraButton
                    mt={4}
                    width="100%"
                    fontFamily="tlm"
                    borderRadius="22px"
                    // isFullWidth
                    borderColor={Colors.CARIBBEAN_GREEN}
                    borderWidth={2}
                    backgroundColor={Colors.CARIBBEAN_GREEN_ALPHA_30}
                    _hover={{ background: Colors.CARIBBEAN_GREEN, color: Colors.SNOW_WHITE }}
                    fontWeight={600}
                    fontSize="small"
                    onClick={() => onBoost(MainBoostLevels[1], superboost)}
                  >
                    Apply Boost
                  </ChakraButton>
                </Box>
                <Box minW="150px" height="170px" justifySelf="end">
                  {availableSuperBoosts > 0 && (
                    <Box
                      p="1px"
                      mt="5px"
                      w="30px"
                      h="30px"
                      ml="115px"
                      border="2px solid"
                      position="absolute"
                      borderRadius="full"
                      bg={Colors.DARK_GRAY}
                      borderColor={Colors.SNOW_WHITE}
                    >
                      <Text
                        fontFamily="tlm"
                        fontSize="medium"
                        textAlign="center"
                        fontWeight="normal"
                        color={Colors.SNOW_WHITE}
                      >
                        {availableSuperBoosts}
                      </Text>
                    </Box>
                  )}
                  <Img src={superboost} width="150px" height="170px" borderRadius="10px" />
                </Box>
              </Flex>
            </VStack>
          )}

          <Divider />

          <Flex width="100%" mt={5}>
            {nftLandCardProperties && (
              <NFTCardOverlayRender asset={nftLandCardProperties} isNFTCard={false} />
            )}
          </Flex>

          <Flex
            flexDirection="column"
            mt={5}
            width="100%"
            display={landAsset?.owner === walletId ? 'flex' : 'none'}
          >
            <Flex>
              {nftLandCardProperties && (
                <NFTLandOwnerCommission asset={nftLandCardProperties} landAsset={landAsset} />
              )}
            </Flex>

            {/* Land Action Buttons */}
            <VStack
              marginBlock={4}
              justify="center"
              align="center"
              w="100%"
              gap="15px"
              pt="20px"
              display={landAsset?.owner === walletId ? 'flex' : 'none'}
            >
              {currentLand?.asset_id !== managingLandId && (
                <SetLandBtn land={landAsset} currentLand={currentLand} />
              )}
              <ClaimDTALRewardsBtn />
              <ClaimCommissionRewardsBtn />
            </VStack>
          </Flex>
        </Flex>

        {/* Right section - Land Boosts table */}
        <Flex
          alignItems={{ base: 'center', lg: 'start' }}
          w={{ base: '100%', xl: 'calc(100% - 530px)' }}
          minW={{ base: '0px', lg: '450px' }}
          direction="column"
        >
          <Flex
            w="100%"
            mb="20px"
            paddingInline={10}
            pb={{ base: 5, lg: 2 }}
            pt={{ base: 3, lg: 1 }}
            h={{ base: '160px', lg: '100%' }}
            justifyContent="space-between"
            backgroundColor={Colors.BLACK_ALPHA_80}
            direction={{ base: 'column', lg: 'row' }}
            borderRadius={{ base: '25px', lg: '100px' }}
          >
            <NextBoostCountdown />

            <MinimumBoostSetting />
          </Flex>
          <Flex
            marginBlock="20px"
            width="100%"
            pr="24px"
            alignItems="center"
            display={{ base: 'none', lg: 'inherit' }}
          >
            <Flex alignItems="center">
              <Box w="50px" mr="45px" ml="25px">
                <RarityCardIcon w="50px" h="50px" />
              </Box>
              <Text
                fontFamily="tlm"
                fontWeight={600}
                fontSize={24}
                textAlign="start"
                textTransform="capitalize"
              >
                {toLower(landAsset?.data?.rarity)}
              </Text>
            </Flex>
            <Flex flexDirection="column" marginLeft="auto">
              <Text
                fontFamily="Orbitron"
                fontWeight={500}
                fontSize={20}
                letterSpacing="0.1em"
                textAlign="end"
              >
                {landBoostValueByRarity[toLower(landAsset?.data?.rarity)]}%
              </Text>
            </Flex>
          </Flex>
          <BoostTable onShowUnlockModal={onShowUnlockModal} setSlotToUnlock={setSlotToUnlock} />
        </Flex>

        {/* close icon */}
        <Flex
          transform="rotateY(180deg)"
          position="absolute"
          right={{ base: '15%', sm: '25%', md: 8 }}
          top={{ base: 9, md: 0 }}
        >
          <ForwardIcon
            boxSize={30}
            onClick={() => {
              if (landAsset?.owner === walletId) {
                navigate(PagePath.Inventory)
                setTimeout(() => {
                  setAssetsFilter({
                    ...assetsFilter,
                    assetSchema: AssetSchema.LAND,
                  })
                }, 200)
              } else {
                navigate(PagePath.Land)
              }
            }}
            cursor="pointer"
          />
        </Flex>

        {showUnlockModal && (
          <AppModal onClose={() => {}} isOpen={unlockDisclosure.isOpen}>
            <LandUnlockSlotModal onClose={unlockDisclosure.onClose} slotToUnlock={slotToUnlock} />
          </AppModal>
        )}

        {showMainBoostsModal && (
          <AppModal onClose={() => {}} isOpen={boostDisclosure.isOpen}>
            <LandAddSlotModal
              onClose={boostDisclosure.onClose}
              selectedBoost={selectedBoost}
              selectedImg={selectedBoostImg}
            />
          </AppModal>
        )}
      </Stack>
    </VStack>
  )
}

export { LandMgt }
