import { Box, AspectRatio } from '@chakra-ui/react'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { toLower } from 'lodash'
import { Colors } from 'shared/util/colors'
import { PlanetLandIcon } from 'shared/util/icons'

export const LandIndicator = ({ landAsset, size }: { landAsset: IAsset; size?: string }) => {
  return (
    <Box
      right="12px"
      bottom="5px"
      position="relative"
      fill={Colors.BLACK_ALPHA_80}
      backgroundColor={Colors.BLACK_SOLID_90}
    >
      <AspectRatio ratio={1} w="full" minW="full" borderRadius="full">
        <div
          className={`${toLower(landAsset?.data?.rarity) || ''} ${
            toLower(landAsset?.data?.shine) || 'stone'
          }`}
          style={{ overflow: 'initial' }}
        >
          <div className="cardwrap">
            <div className="cardinner">
              <div
                className="cardtokentopbar"
                style={{ backgroundColor: 'transparent', height: 60, width: 60 }}
              >
                <div
                  className="raritywrap"
                  style={{
                    height: size,
                    width: size,
                    marginLeft: 2,
                    marginTop: 1,
                  }}
                >
                  <div className="rarityring" style={{ top: 0, left: 0 }} />
                  <div className="rarityringinner" style={{ top: 0, left: 0 }} />
                </div>
                <Box
                  w="42px"
                  h="42px"
                  ml="6px"
                  mt="5px"
                  borderRadius="full"
                  bg={Colors.MINE_SHAFT}
                />
                <PlanetLandIcon
                  landName={landAsset?.name}
                  style={{
                    mx: 0,
                    width: '50px',
                    height: '50px',
                    marginTop: '-47px',
                    marginLeft: '2px',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </AspectRatio>
    </Box>
  )
}
