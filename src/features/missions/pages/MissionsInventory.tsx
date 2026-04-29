import { VFC, useEffect, useState } from 'react'

import { InfoIcon2 } from '@alien-worlds/icons'
import {
  Box,
  Flex,
  Icon,
  Image,
  RangeSlider,
  RangeSliderFilledTrack,
  RangeSliderTrack,
  Spinner,
  Text,
  Tooltip,
  VStack,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { map } from 'lodash'
import _groupBy from 'lodash/groupBy'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'
import { PinataNft } from 'store/missions/types'

const containerAnimation = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const imageAnimation = {
  hidden: { opacity: 0, translateY: -50, rotateY: '45deg', scale: 1.1 },
  show: {
    opacity: 1,
    translateY: 0,
    rotateY: '0deg',
    scale: 1,
    transition: { duration: 0.7 },
  },
}

const MotionFlex = motion(Flex)
const MotionBox = motion(Box)
const MotionImage = motion(Image)

export const DetailsOnHover: VFC<{ asset: PinataNft }> = ({ asset }) => {
  const series = asset?.attributes?.find((attr) => attr.trait_type === 'Series')
  const cardId = asset?.attributes?.find((attr) => attr.trait_type === 'CardNumber')
  const craftingKey = asset?.attributes?.find((attr) => attr.trait_type === 'EquivPartType')
  const basePower = asset?.attributes?.find((attr) => attr.trait_type === 'BasePower')
  const boostPower = asset?.attributes?.find((attr) => attr.trait_type === 'BoostPower')
  return (
    <MotionBox
      position="absolute"
      inset={0}
      backgroundColor="blackAlpha.800"
      opacity={0}
      borderRadius={16}
      zIndex={5}
      whileHover={{ opacity: 1 }}
      whileTap={{ opacity: 1 }}
    >
      <VStack px="16%" py="25%" spacing={4} alignItems="stretch" fontSize="sm" fontWeight={500}>
        {series !== undefined && (
          <Flex alignItems="center" fontFamily="Titillium Web">
            <Text>Series</Text>
            <Text
              ml="auto"
              letterSpacing="0.1em"
              textTransform="uppercase"
              fontFamily="Orbitron"
              textAlign="right"
            >
              {series.value}
            </Text>
          </Flex>
        )}
        {cardId !== undefined && (
          <Flex alignItems="center" fontFamily="Titillium Web">
            <Text>Card ID</Text>
            <Text
              ml="auto"
              letterSpacing="0.1em"
              textTransform="uppercase"
              fontFamily="Orbitron"
              textAlign="right"
            >
              {cardId.value}
            </Text>
          </Flex>
        )}
        {craftingKey !== undefined && (
          <Tooltip label="An Alien Worlds NFT Crafting Key can potentially have a wide range of uses which will be implemented over time. Examples of planned functionality include combining different NFTs to make new ones, keys giving access to new functionality or being helpful in completing quests.">
            <Flex alignItems="center" fontFamily="Titillium Web">
              <Flex alignItems="center" justifyContent="center">
                <Text>Crafting Key</Text>
                <Icon as={InfoIcon2} ml={1} boxSize="14px" />
              </Flex>
              <Text
                ml="auto"
                letterSpacing="0.1em"
                textTransform="uppercase"
                fontFamily="Orbitron"
                textAlign="right"
              >
                {craftingKey.value}
              </Text>
            </Flex>
          </Tooltip>
        )}
        {basePower !== undefined && (
          <Tooltip label="Future iterations of Missions will allow users to send BNB and/or NFTs with the spacecrafts. The Base Power of NFTs will affect the power of the spacecrafts sent.">
            <Flex alignItems="center" fontFamily="Titillium Web">
              <Flex alignItems="center" justifyContent="center">
                <Text>Base Power</Text>
                <Icon as={InfoIcon2} ml={1} boxSize="14px" />{' '}
              </Flex>
              <Text
                ml="auto"
                letterSpacing="0.1em"
                textTransform="uppercase"
                fontFamily="Orbitron"
                textAlign="right"
              >
                {basePower.value}
              </Text>
            </Flex>
          </Tooltip>
        )}
        {boostPower !== undefined && (
          <Tooltip label="Future iterations of Missions will allow users to send BNB and/or NFTs with the spacecrafts. The Boost Power of NFTs will affect the power of the spacecrafts sent.">
            <Flex alignItems="center" fontFamily="Titillium Web">
              <Flex alignItems="center" justifyContent="center">
                <Text>Boost Power</Text>
                <Icon as={InfoIcon2} ml={1} boxSize="14px" />{' '}
              </Flex>
              <Text
                ml="auto"
                letterSpacing="0.1em"
                textTransform="uppercase"
                fontFamily="Orbitron"
                textAlign="right"
              >
                {boostPower.value}
              </Text>
            </Flex>
          </Tooltip>
        )}
      </VStack>
    </MotionBox>
  )
}

const MissionsInventory: VFC = () => {
  const {
    main: { showMissionsInventoryPage },
  } = useActions()
  const {
    web3: { userWallet, totalMissionsNfts, loadedMissionsNfts, loadingProgressMissionsNfts },
    missions: { nfts, templatePinatas },
  } = useAppState()

  const [grouped, setGrouped] = useState<any>([])
  const [loadingMessage, setLoadingMessage] = useState<string>(null)

  useEffect(() => {
    showMissionsInventoryPage()
  }, [])

  useEffect(() => {
    const grp = userWallet ? _groupBy(nfts, 'name') : _groupBy(templatePinatas, 'name')
    setGrouped(grp)
  }, [nfts, templatePinatas, userWallet])

  useEffect(() => {
    let msg: string

    if (userWallet) {
      if (nfts?.length > 0) {
        msg = `Loading ${loadedMissionsNfts}/${totalMissionsNfts} Missions NFTs, please wait...`
      } else {
        msg = `No Mission NFTs available yet.`
      }
      setLoadingMessage(msg)
    } else {
      msg = `Loading Missions NFTs, please wait...`
      setLoadingMessage(msg)
    }
  }, [userWallet])

  return (
    <motion.div
      initial={{ translateY: -100, opacity: 0 }}
      animate={{ translateY: 0, opacity: 1 }}
      exit={{ translateY: 100, opacity: 0, transition: { duration: 0.2 } }}
      transition={{ duration: 0.5 }}
    >
      <MotionFlex
        variants={containerAnimation}
        initial="hidden"
        animate="show"
        sx={{ gap: '60px' }}
        w="full"
        flexWrap="wrap"
        justify={{ base: 'center' }}
        px={{ base: 2, sm: 12 }}
        mb={24}
        mt={12}
        position="relative"
      >
        {Object.entries(grouped)?.length > 0 ? (
          <>
            {map(Object.entries(grouped), (entry: any, index) => (
              <Box sx={{ perspective: '500px' }} key={index}>
                <Flex direction="column" justify="center" align="center">
                  <Box position="relative" w={{ base: '240px', lg: '300px' }}>
                    <MotionImage
                      variants={imageAnimation}
                      key={`nft-reward-${index}`}
                      src={entry[1][0].image}
                      alt="NFT prize"
                      fallbackSrc="/images/alienworlds-missions-nft_placeholder.png"
                      w="full"
                      zIndex={1}
                      position="relative"
                      pointerEvents="none"
                    />
                    <DetailsOnHover asset={entry[1][0]} />
                  </Box>

                  <Text
                    fontFamily="Orbitron"
                    mt={2}
                    fontSize="xs"
                    fontWeight="bold"
                    color="#f0b90a"
                  >
                    #{entry[1].length} NFT{entry[1].length > 1 ? 's' : ''} of this kind
                  </Text>
                </Flex>
              </Box>
            ))}
          </>
        ) : (
          <Flex
            w="400px"
            h={{ base: '0px', md: '175px' }}
            direction="column"
            justify="center"
            align="center"
          >
            <RangeSlider
              h={5}
              min={0}
              max={100}
              color={Colors.BUTTERCUP}
              value={[loadingProgressMissionsNfts]}
            >
              <RangeSliderTrack height="15px">
                <RangeSliderFilledTrack bg={Colors.RUCKSACK_TAN} />
              </RangeSliderTrack>
            </RangeSlider>
            <Flex justify="center" align="center">
              <Text
                mt={5}
                mr={2}
                fontSize={14}
                fontWeight={500}
                fontFamily="orb"
                color={Colors.BUTTERCUP}
              >
                {loadingMessage}
              </Text>
              {nfts?.length > 0 && <Spinner size="sm" color={Colors.BUTTERCUP} mt={4} />}
            </Flex>
          </Flex>
        )}
      </MotionFlex>
    </motion.div>
  )
}

export { MissionsInventory }
