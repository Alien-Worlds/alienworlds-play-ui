import { VFC } from 'react'

import { Divider, Flex } from '@chakra-ui/react'
import { TokensBalances } from 'features/profile/components/TokenBalances/TokenBalances'
import { WalletsBalances } from 'features/profile/components/WalletsBalances/WalletsBalances'
import { Colors } from 'shared/util/colors'

export const ProfileBalances: VFC = () => {
  return (
    <Flex
      pt={6}
      pb={9}
      w="100%"
      h="100%"
      flexWrap="wrap"
      borderRadius="25px"
      justifyContent="center"
      background={Colors.BLACK_SOLID_90}
      direction={{ base: 'column', '2xl': 'row' }}
    >
      <WalletsBalances />
      <Divider
        h="auto"
        border="1px solid"
        orientation="vertical"
        borderColor={Colors.SNOW_WHITE}
        display={{ base: 'none', '2xl': 'initial' }}
      />
      <TokensBalances />
    </Flex>
  )
}
