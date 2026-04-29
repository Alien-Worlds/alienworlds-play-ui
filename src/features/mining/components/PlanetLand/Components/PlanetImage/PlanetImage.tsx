import React, { useEffect, useState } from 'react'

import {
  AspectRatio,
  Box,
  Center,
  Flex,
  FlexProps,
  Heading,
  HeadingProps,
  Image,
  Text,
  ResponsiveValue,
} from '@chakra-ui/react'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { LandIndicator } from 'features/mining/components/PlanetLand/Components/LandIndicator'
import { useRarityPools } from 'features/mining/hooks/useRarityPools'
import { getPlanetBackground, getPlanetImage, PlanetImageSizes } from 'features/mining/utils/planet'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { usePlanetDetail } from 'graphql/hooks/usePlanetDetail'
import { DaoTreasuryResponse, PlanetDetailsResponse } from 'graphql/types'
import { forEach, split, startCase, toLower } from 'lodash'
import {
  RingPositionHelper,
  RingPositions,
} from 'shared/components/RingPositionHelper/RingPositionHelper'
import { Colors } from 'shared/util/colors'
import { convertPlanetIdToName, DaoIdToNameFinder } from 'shared/util/helpers'
import { PlanetIcon } from 'shared/util/icons'
import { useAppState } from 'store'
import { v4 as uuidv4 } from 'uuid'

interface PlanetImageProps {
  planet?: PlanetDetailsResponse
  dacTreasury?: DaoTreasuryResponse
  interactive?: boolean
  isSelected?: boolean
  hasPlanetIcon?: boolean
  onClick?: () => void
  imageBoxSize?: ResponsiveValue<number>
  titleDisplay?: ResponsiveValue<string>
  titleProps?: HeadingProps
  imageSize?: PlanetImageSizes.SMALL | PlanetImageSizes.LARGE
  showLandIndicator?: boolean
  showHeading?: boolean
  miningRing?: boolean
  land?: IAsset
  isHovered?: boolean
  offsetTop?: number
  showShadowGradient?: boolean
  dacId?: string
  justifyContent?: ResponsiveValue<string>
}

const PlanetImage: React.FC<PlanetImageProps & FlexProps> = ({
  planet,
  dacTreasury,
  dacId,
  isSelected,
  hasPlanetIcon,
  onClick,
  interactive,
  titleDisplay,
  imageBoxSize,
  titleProps,
  imageSize = PlanetImageSizes.SMALL,
  showLandIndicator,
  showHeading,
  land,
  miningRing,
  isHovered,
  offsetTop,
  showShadowGradient,
  justifyContent = 'center',
  ...props
}) => {
  const {
    wax: { planetSelectedForMining },
  } = useAppState()
  const { planetDetails, loading } = usePlanetDetail(planetSelectedForMining)
  const { data: rarityPools } = useRarityPools(planet?.planet_details?.planet_name)

  const [totalPoolSize, setTotalPoolSize] = useState<number | null>(null)

  useEffect(() => {
    let total = 0

    forEach(rarityPools, (rp) => {
      total += parseInt(split(rp.amount, 'TLM')[0], 10)
    })

    setTotalPoolSize(total)
  }, [rarityPools])
  if (loading) return <LoadingSpinner />

  return (
    <Flex
      position="relative"
      key={uuidv4()}
      onClick={onClick}
      flexDirection="column"
      alignItems="center"
      justifyContent={justifyContent}
      role="group"
      w="full"
      maxW={imageBoxSize}
      {...(onClick && { as: 'button', onClick, cursor: 'pointer' })}
      {...props}
    >
      <Flex w="full" h="auto" p={0} position="relative">
        <Flex
          w="full"
          borderRadius="full"
          {...(miningRing
            ? {
                background:
                  toLower(planetDetails?.planet_details.planet_name) === dacId ||
                  toLower(planetDetails?.planet_details.planet_name) === dacTreasury?.dac_id ||
                  toLower(planetDetails?.planet_details.planet_name) ===
                    toLower(planet?.planet_details.planet_name)
                    ? Colors.MINING_PLANET_GRADIENT
                    : isHovered
                    ? Colors.MINING_PLANET_HOVER_GRADIENT
                    : Colors.TRANSPARENT,
                p: isHovered ? 2 : 4,
                m: isHovered && 2,
              }
            : {})}
          position="relative"
          direction="column"
          alignItems="center"
          justifyContent="flex-start"
        >
          {hasPlanetIcon && (
            <RingPositionHelper
              posXY={RingPositions.TOP_CENTER}
              direction="row"
              zIndex={1500}
              mt={isHovered && '-8px'}
              offsetTop={miningRing ? 0 : offsetTop ?? -6}
            ></RingPositionHelper>
          )}

          {hasPlanetIcon && (
            <Box boxSize={12} position="absolute" zIndex={1500} top={-2}>
              <PlanetIcon
                planetName={
                  startCase(convertPlanetIdToName(dacId)) ||
                  dacTreasury?.dac_id ||
                  planet?.planet_details.planet_name
                }
                style={{
                  width: '100%',
                  height: '100%',
                }}
              />
            </Box>
          )}
          <AspectRatio
            ratio={1}
            zIndex={1}
            w="full"
            p={4}
            borderRadius="full"
            backgroundColor="red.500"
            bg={getPlanetBackground(
              dacId || dacTreasury?.dac_id || planet?.planet_details?.planet_name,
              isSelected
            )}
            boxSizing="border-box"
            position="relative"
            overflow="visible"
          >
            <Center position="relative" w="full" h="full" overflow="visible">
              <Image
                src={getPlanetImage(
                  dacId || dacTreasury?.dac_id || planet?.planet_details.planet_name,
                  imageSize
                )}
                alt={planet?.planet_details?.title}
                borderRadius="full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = '/images/planets/planet-sample.png'
                }}
                padding="4%"
                sx={{
                  objectFit: 'cover !important', // required because of Carousel component overriding objectFit
                }}
              />
              <Flex
                position="absolute"
                borderRadius="full"
                w="full"
                h="full"
                p={0}
                m={0}
                pointerEvents="none"
                background={showShadowGradient && Colors.PLANET_IMAGE_BLACK_SHADOW_GRADIENT}
                zIndex="100"
              ></Flex>
            </Center>
          </AspectRatio>
          {showLandIndicator && land && (
            <Box
              position="absolute"
              bottom="calc(16px + 20px)"
              left="50%"
              transform="translateX(calc(-50% + 12px))"
              zIndex={200}
            >
              <LandIndicator landAsset={land} size="85%" />
            </Box>
          )}
        </Flex>
      </Flex>
      {showHeading && (
        <Flex
          position="absolute"
          left="0"
          zIndex={9}
          w="full"
          justifyContent="center"
          direction="column"
          bottom={{ base: '-25px', lg: '-40px' }}
        >
          <Heading
            as="h4"
            fontFamily="Orbitron"
            textAlign="center"
            letterSpacing="0.1em"
            fontWeight={400}
            color={isSelected ? Colors.SECONDARY_GREEN : 'white'}
            mx={4}
            fontSize="2xl"
            display={titleDisplay}
            {...(interactive && {
              _groupHover: {
                color: Colors.SECONDARY_GREEN,
              },
            })}
            {...titleProps}
          >
            {DaoIdToNameFinder(dacId) || dacTreasury?.dac_id || planet?.planet_details?.title}
          </Heading>

          {totalPoolSize && (
            <>
              <Text
                mb="-5px"
                mt="5px"
                fontSize={16}
                fontFamily="tlm"
                fontWeight={400}
                textAlign="center"
                color={Colors.SILVER}
              >
                Total Pool Size
              </Text>
              <Text fontFamily="orb" fontSize={16} fontWeight={400} textAlign="center">
                {totalPoolSize} TLM
              </Text>
            </>
          )}
        </Flex>
      )}
    </Flex>
  )
}

export { PlanetImage }
