import { hasUTCDateAlreadyOccurred, openInNewTab } from 'shared/util/helpers'

import { useMemo } from 'react'

import {
  PlayFilledIcon,
  SocialDiscordIcon,
  SocialFacebookIcon,
  SocialInstagramIcon,
  SocialTelegramIcon,
  SocialTwitterIcon,
} from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Flex, HStack, Link, Stack, VStack, Text, Spacer } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { ArenaPortalItemType } from 'features/arena/pages/Arena'
import { get, isEmpty, map, replace } from 'lodash'
import { useActions } from 'store'

type ArenaPortalItemProps = {
  data: ArenaPortalItemType
}

export const ArenaPortalSocialLinkIcons = {
  facebook: <SocialFacebookIcon boxSize={32} />,
  instagram: <SocialInstagramIcon boxSize={32} />,
  twitter: <SocialTwitterIcon boxSize={32} />,
  discord: <SocialDiscordIcon boxSize={32} />,
  telegram: <SocialTelegramIcon boxSize={32} />,
}

const CreatorLink = ({
  name,
  url,
  onClick,
}: {
  name: string
  url?: string
  onClick?: () => void
}) => {
  if (url) {
    return <Link onClick={onClick}>{name}</Link>
  }

  return <Text>{name}</Text>
}

export const ArenaPortalItem = ({ data }: ArenaPortalItemProps) => {
  const {
    modal: { setSecondaryModalActive },
  } = useActions()

  const isItemReleased = useMemo(() => {
    if (!data.releaseDate) {
      return false
    }

    return hasUTCDateAlreadyOccurred(data.releaseDate)
  }, [data.releaseDate])

  const playVideoButtonHandler = () => {
    setSecondaryModalActive({
      modalName: 'VideoPlayerModal',
      value: true,
      onConfirm: () => data.video,
    })
  }

  const playNowButtonHandler = () => {
    setSecondaryModalActive({
      modalName: 'ExternalLinkDisclaimerModal',
      value: true,
      onConfirm: () => openInNewTab(data.url || data.action.url),
    })
  }

  const visitDeveloperHandler = () => {
    setSecondaryModalActive({
      modalName: 'ExternalLinkDisclaimerModal',
      value: true,
      onConfirm: () => openInNewTab(data.creatorUrl),
    })
  }

  return (
    <VStack backgroundColor={Colors.BLACK_SOLID_65} borderRadius="20px 20px 0 0">
      <VStack
        bgImage={`url(${data?.image?.data?.attributes?.url})`}
        bgPosition="center"
        bgRepeat="no-repeat"
        w="full"
        height={60}
        justifyContent="space-between"
        borderRadius="20px 20px 0 0"
        backgroundSize="cover"
        flexShrink={0}
        overflow="hidden"
      >
        <Flex
          w="100%"
          rowGap="40px"
          justifyContent="space-between"
          direction={{ base: 'column', lg: 'column', xl: 'row' }}
        >
          {get(data, 'sashlabel.length') > 0 && (
            <Flex
              p={1}
              h={6}
              mt={6}
              w="35%"
              ml="-10%"
              minW="130px"
              position="relative"
              alignItems="center"
              alignSelf="flex-start"
              bg={Colors.SNOW_WHITE}
              justifyContent="center"
              transform="rotateZ(-45deg)"
              clipPath="inset(-10 0, 100% 0, 50% 100%)"
            >
              <Text
                cursor="default"
                fontFamily="orb"
                fontSize={16}
                fontWeight={500}
                userSelect="none"
                color={Colors.BLACK_NEUTRAL}
              >
                {data.sashlabel}
              </Text>
            </Flex>
          )}
          <HStack alignSelf={{ base: 'center', sm: 'flex-end' }} p={6}>
            {!isEmpty(data.video) && (
              <Button
                size="sm"
                variant="info"
                leftIcon={<PlayFilledIcon boxSize={24} />}
                onClick={playVideoButtonHandler}
              >
                Play Trailer
              </Button>
            )}
          </HStack>
        </Flex>
        <HStack
          w="full"
          justifyContent="space-between"
          py={6}
          px={{ base: 3, sm: 6 }}
          background={Colors.ARENA_PORTAL_ITEM_GRADIENT}
        >
          <HStack justifyContent="space-between" gap={1}>
            {!isEmpty(data.socialLinks) &&
              map(data.socialLinks, (social, index) => (
                <Link href={social.url} target="_blank" rel="noopener" key={index}>
                  {ArenaPortalSocialLinkIcons[social.name]}
                </Link>
              ))}
          </HStack>
          <Flex fontFamily="orb" fontSize={20} fontWeight={500}>
            {!isEmpty(data.version) && replace(data.version, 'V', 'V. ')}
          </Flex>
        </HStack>
      </VStack>
      <VStack p="0 24px 40px 24px" width="full" justifyContent="space-between" height="full">
        <Flex color={Colors.GRAY_CHATEAU} fontSize={14} pt={4}>
          {data.description}
        </Flex>
        <Spacer />
        <VStack alignSelf="flex-start" alignItems="flex-start" pb={4}>
          <Flex fontSize={20} fontFamily="orb">
            {data.title}
          </Flex>
          <Flex color={Colors.GRAY_CHATEAU} fontSize={14} lineHeight={0}>
            <CreatorLink
              name={data.creator}
              url={data.creatorUrl}
              onClick={visitDeveloperHandler}
            />
          </Flex>
        </VStack>

        <Stack w="full" justifyContent="space-between" pb={4} direction={{ base: 'row' }}>
          <VStack alignItems="flex-start" pb={{ base: 4 }} flex="1">
            <Flex fontSize={20} fontFamily="orb" textAlign="right">
              {data.platform}
            </Flex>
            <Flex color={Colors.GRAY_CHATEAU} fontSize={14} lineHeight={0}>
              Platform
            </Flex>
          </VStack>
        </Stack>

        <Flex w="full">
          <Button
            size="lg"
            variant={get(data, 'action.style') || 'primary'}
            isFullWidth
            fontSize={22}
            disabled={!isItemReleased}
            onClick={playNowButtonHandler}
          >
            {isItemReleased ? get(data, 'action.label', '') : 'Coming Soon'}
          </Button>
        </Flex>
      </VStack>
    </VStack>
  )
}
