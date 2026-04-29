import { ProfitsIcon } from '@alien-worlds/icons'
import { Avatar, Center, Flex, Text, Tooltip } from '@chakra-ui/react'
import { toLower, isUndefined } from 'lodash'
import {
  RingPositionHelper,
  RingPositions,
} from 'shared/components/RingPositionHelper/RingPositionHelper'
import { Colors } from 'shared/util/colors'
import { getNftImage } from 'shared/util/nft'

const LandCommissionInfo: any = ({ land, boxSize }) => {
  if (!land) return <></>

  return (
    <Flex justify="center" w="fit-content" zIndex={2020}>
      <Center
        boxSize={boxSize || '50px'}
        borderRadius="full"
        bg={Colors.RARITY_COLORS[toLower(land?.data?.rarity)]}
        justifyContent="center"
        alignItems="center"
        p={{ base: '10%' }}
      >
        <Flex
          boxSize="full"
          borderRadius="full"
          bg={Colors.DARK_GRAY}
          mx="auto"
          justifyContent="center"
          alignItems="center"
        >
          <Tooltip
            label="Commission subtracted from your mining reward, to be paid to the land owner"
            fontSize="md"
          >
            <Text
              fontFamily="Orbitron"
              fontSize="xx-small"
              fontWeight="bold"
              align="center"
              lineHeight="shorter"
              m="auto"
              pt="8px"
              display="flex"
              alignItems="center"
              flexDirection="column"
            >
              {land.mutable_data.commission / 100 || 0}%
              <ProfitsIcon boxSize={18} width={18} style={{ bottom: 0 }} fill={Colors.SNOW_WHITE} />
            </Text>
          </Tooltip>
        </Flex>
      </Center>
    </Flex>
  )
}

const LandImage: any = ({ land, onClick, interactive, ringPosition, w, h, ...props }) => {
  return (
    <Flex
      w="full"
      key={land?.name}
      onClick={onClick}
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      role="group"
      zIndex={1790}
      position="relative"
      {...(onClick && { as: 'button', onClick, cursor: 'pointer' })}
      {...props}
    >
      <RingPositionHelper
        posXY={!isUndefined(ringPosition) ? ringPosition : RingPositions.BOTTOM_CENTER}
        zIndex={2010}
        {...(ringPosition === RingPositions.BOTTOM_CENTER
          ? { offsetBottom: -2 }
          : { offsetTop: -2 })}
      >
        <LandCommissionInfo land={land} boxSize={12} />
      </RingPositionHelper>
      <Center
        position="relative"
        bg={`${Colors.RARITY_INNER_GRADIENTS[toLower(land?.data?.rarity)]} padding-box,${
          Colors.RARITY_OUTER_GRADIENTS[toLower(land?.data?.rarity)]
        } border-box;`}
        borderWidth={6}
        borderStyle="solid"
        borderColor={Colors.TRANSPARENT}
        p={0.5}
        borderRadius="full"
        {...(interactive && {
          _groupHover: {
            bg: Colors.CARIBBEAN_GREEN,
            backgroundColor: Colors.CARIBBEAN_GREEN,
          },
        })}
      >
        <Avatar
          display="block"
          w={w}
          h={h}
          borderColor={Colors.TRANSPARENT}
          borderWidth="0"
          position="relative"
          src={getNftImage(land)}
          zIndex={2000}
        />
      </Center>
    </Flex>
  )
}

export { LandImage }
