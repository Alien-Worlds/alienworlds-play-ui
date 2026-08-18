import { VFC } from 'react'

import { DiscordIcon2, TelegramIcon2 } from '@alien-worlds/icons'
import { Box, Flex, Text, Link } from '@chakra-ui/react'
import SocialBackground from 'assets/images/alienworlds-bg-social.svg'
import { map } from 'lodash'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'
import { useAppState } from 'store'
import { v4 } from 'uuid'

const SocialLinks = [
  {
    name: 'discord',
    url: config.DiscordUrl,
    icon: <DiscordIcon2 boxSize={24} />,
  },
  {
    name: 'telegram',
    url: config.TelegramUrl,
    icon: <TelegramIcon2 boxSize={24} />,
  },
]

const AdditionalLinks = [
  {
    name: 'Planetary DAO Council Policy',
    url: config.CouncilPolicyUrl,
  },
  {
    name: 'User Agreement / Terms of Use',
    url: config.UserAgreementUrl,
  },
]

const Footer: VFC = () => {
  const {
    main: { isCompactSidebar },
  } = useAppState()

  const SocialWrapper = ({ children }) => {
    if (isCompactSidebar)
      return (
        <Flex
          flexDirection="column"
          gap={4}
          alignItems="center"
          bg={Colors.MINE_SHAFT}
          borderRadius={8}
          py={4}
        >
          {children}
        </Flex>
      )

    return (
      <Flex
        bg={`url(${SocialBackground})`}
        height="175px"
        width="250px"
        flexDirection="column"
        justifyContent="center"
        alignItems="flex-start"
        pl={50}
        gap={5}
      >
        {children}
      </Flex>
    )
  }

  return (
    <Flex gap={7} flexDirection="column">
      <SocialWrapper>
        {map(SocialLinks, (social) => (
          <Link
            href={social.url}
            target="_blank"
            rel="noopener"
            _hover={{
              transform: 'scale(1.1)',
              transition: 'transform 0.3s ease',
            }}
            key={v4()}
          >
            <Flex gap={4} alignItems="center">
              <Flex
                bg={Colors.SOCIAL_ICON_GRADIENT}
                width="40px"
                height="33px"
                justifyContent="center"
                alignItems="center"
                borderRadius="4px"
              >
                {social.icon}
              </Flex>

              {!isCompactSidebar && (
                <Text
                  fontFamily="tlm"
                  color={Colors.ALTO}
                  fontSize={16}
                  fontWeight={600}
                  textTransform="uppercase"
                >
                  {social.name}
                </Text>
              )}
            </Flex>
          </Link>
        ))}
      </SocialWrapper>

      {map(AdditionalLinks, (link) => (
        <Box textAlign="center" key={v4()}>
          <Link href={link.url} target="_blank" rel="noopener">
            <Text fontFamily="tlm" color={Colors.ALTO} fontSize={12}>
              {link.name}
            </Text>
          </Link>
        </Box>
      ))}

      <Box textAlign="center">
        <Text fontSize="md" fontWeight={700} color={Colors.DI_SERRIA}>
          ver 5.2.5
        </Text>
      </Box>
    </Flex>
  )
}

export { Footer }
