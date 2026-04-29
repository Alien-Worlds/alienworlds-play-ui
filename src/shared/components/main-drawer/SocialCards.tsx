import { DiscordIcon2, TelegramIcon2 } from '@alien-worlds/icons'
import { Flex, HStack } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'

export const SocialCards = () => {
  return (
    <Flex width="100%" mt={4} px="16px">
      <HStack width="100%">
        <Flex
          alignItems="center"
          backgroundColor={Colors.MINE_SHAFT}
          borderRadius="16px"
          width="100%"
          height="64px"
          alignContent="center"
          justifyContent="center"
          onClick={() => window.open(config.DiscordUrl, '_blank')}
        >
          <DiscordIcon2 color={Colors.SNOW_WHITE} />
        </Flex>
        <Flex
          alignItems="center"
          justifyItems="center"
          backgroundColor={Colors.MINE_SHAFT}
          borderRadius="16px"
          width="100%"
          height="64px"
          justifyContent="center"
          onClick={() => window.open(config.TelegramUrl, '_blank')}
        >
          <TelegramIcon2 color={Colors.SNOW_WHITE} />
        </Flex>
      </HStack>
    </Flex>
  )
}
