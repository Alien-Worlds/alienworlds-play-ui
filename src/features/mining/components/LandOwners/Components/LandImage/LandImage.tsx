import { FC } from 'react'

import { AspectRatio, Box, Flex, Img } from '@chakra-ui/react'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { getPlanetGradient } from 'features/mining/utils/planet'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { usePlanetDetail } from 'graphql/hooks/usePlanetDetail'
import { last, split, toLower } from 'lodash'
import { config } from 'shared/util/config'
import { useScreenSize } from 'shared/util/hooks'
import { getNftImage } from 'shared/util/nft'

interface LandImageProps {
  landAsset: IAsset
  showPlanetIndicator: boolean
  size?: string
}

const LandImage: FC<LandImageProps> = ({ landAsset, showPlanetIndicator, size }) => {
  const planetName = toLower(last(split(landAsset?.data?.name, ' ')))
  const { planetDetails: landPlanet, loading } = usePlanetDetail(planetName)
  const { isDesktop } = useScreenSize()

  const imageTop = 0
  const imageLeft = 0
  const avatarSmallSize = isDesktop ? '48px' : '64px'
  if (loading) return <LoadingSpinner />
  return (
    <Flex
      key={landAsset?.name}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      role="group"
      width={size || '100%'}
      height={size || '100%'}
    >
      <Box position="relative" w="full" zIndex={0}>
        <AspectRatio
          ratio={1}
          zIndex={-2}
          position="absolute"
          w="100%"
          minW="100%"
          borderRadius="full"
        >
          <></>
        </AspectRatio>
        <AspectRatio ratio={1} zIndex={-1} w="full" minW="full" borderRadius="full">
          <div
            className={`${toLower(landAsset?.data?.rarity) || ''} ${
              toLower(landAsset?.data?.shine) || 'stone'
            }`}
            style={{ overflow: 'initial' }}
          >
            <Box
              className="cardwrap"
              width="100%"
              height="100%"
              position="relative"
              display="flex"
              overflow="visible"
              p={0}
              m={0}
              zIndex={2}
            >
              <Flex
                className="cardinner"
                width="100%"
                height="100%"
                m={0}
                p={0}
                overflow="visible"
                position="relative"
                top={0}
                left={0}
                style={{ position: 'relative' }}
              >
                <Flex
                  className="cardtokenland"
                  position="relative"
                  w="100%"
                  h="100%"
                  overflow="visible"
                  m={0}
                  p={0}
                  style={{
                    backgroundColor: 'transparent',
                    transform: 'none',
                    top: 'initial',
                    left: 'initial',
                  }}
                >
                  <Box
                    className="raritywrap"
                    style={{
                      height: '100%',
                      width: '100%',
                      position: 'absolute',
                      top: 0,
                      display: 'flex',
                    }}
                  >
                    <div
                      className="rarityring"
                      style={{ top: imageTop, left: imageLeft, overflow: 'hidden' }}
                    />
                    <div className="rarityringinner" style={{ top: imageTop, left: imageLeft }} />
                  </Box>

                  {/* LAND IMAGE */}
                  <AspectRatio
                    w="calc(100% - 12px)"
                    h="calc(100% - 12px)"
                    position="relative"
                    m="auto"
                    top={0}
                    left={0}
                  >
                    <Img src={getNftImage(landAsset)} borderRadius="full" />
                  </AspectRatio>

                  {/* PLANET SMALL ICON */}
                  {showPlanetIndicator && (
                    <AspectRatio
                      ratio={1}
                      w={avatarSmallSize}
                      h={avatarSmallSize}
                      bg={getPlanetGradient(toLower(landPlanet?.planet_details.title))}
                      borderRadius="30px"
                      top={`calc(${avatarSmallSize} / -2)`}
                      left={`calc(50% - ${avatarSmallSize}/2)`}
                      zIndex={3}
                      position="absolute"
                    >
                      <Img
                        p={0.5}
                        src={`${config.IpfsApiUrl}/${landPlanet?.planet_details.metadata?.planet_image}`}
                      />
                    </AspectRatio>
                  )}
                </Flex>
              </Flex>
            </Box>
          </div>
        </AspectRatio>
      </Box>
    </Flex>
  )
}

export { LandImage }
