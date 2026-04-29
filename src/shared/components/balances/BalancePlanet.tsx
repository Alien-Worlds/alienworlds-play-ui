import { useEffect, useState } from 'react'

import { Avatar, Box, Flex, Text } from '@chakra-ui/react'
import { config } from 'shared/util/config'

const BalancePlanet = ({ planet, unstaked }: { planet: any; unstaked: any }) => {
  const [quantity, setQuantity] = useState<number>(0)

  useEffect(() => {
    if (unstaked && unstaked.length > 0) {
      unstaked.forEach((u) => {
        if (u.planet_name === planet.planet_name) {
          setQuantity(u.planet.quantity)
        }
      })
    }
  }, [unstaked])

  return (
    <Flex alignItems="flex-start" color="#ff3b52">
      <Box w="50px" position="relative" fill="#d9a555">
        <Avatar
          w="47px"
          borderColor="white"
          borderWidth="2px"
          top={-1}
          position="absolute"
          src={
            planet?.metadata_parsed?.img
              ? `${config.IpfsApiUrl}/${planet?.metadata_parsed?.img}`
              : ''
          }
        />
      </Box>
      <Flex direction="column" ml="8px">
        <Text fontSize="2xl" lineHeight={1} fontFamily="Orbitron" color="#08a3dd">
          {quantity} {planet?.dac_symbol.split('4,')[1]}
        </Text>
        <Text
          fontFamily="Titillium Web"
          fontWeight="bold"
          fontSize="sm"
          color="#989898"
          letterSpacing="0.1em"
        >
          {planet?.title}
        </Text>
      </Flex>
    </Flex>
  )
}

export { BalancePlanet }
