import { FC } from 'react'

import { LightIcon2 } from '@alien-worlds/icons'
import { Flex, Text } from '@chakra-ui/react'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { isNumber } from 'lodash'
import { Colors } from 'shared/util/colors'

export const CardCharge: FC<{ land: IAsset }> = ({ land }) => {
  if (!land) return <></>

  const valueInt = isNumber(land.data.delay) ? land.data?.delay / 10 : 0

  return (
    <Flex h={5} mr={2} marginBottom="10px" alignItems="center" justifyContent="center" gap={1}>
      <LightIcon2 boxSize={20} />

      <Text fontFamily="orb" fontWeight={600} color={Colors.ELECTRIC_BLUE} fontSize="xl">
        {valueInt}
        <Text as="span" fontWeight={400} color={Colors.SNOW_WHITE} fontSize="small" ml={1}>
          x
        </Text>
      </Text>
    </Flex>
  )
}
