import { useEffect, useState, VFC } from 'react'

import { DiscordIcon, TelegramIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Flex, Image, Link, Text, Box, IconButton } from '@chakra-ui/react'
import { delay } from 'lodash'
import { useNavigate } from 'react-router'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'
import { PagePath } from 'store/main/types'

import { config } from '../../../shared/util/config'
import { Constants } from '../../../shared/util/constants'

const socialButtonsProps = {
  width: '120px',
  height: '60px',
  backgroundColor: Colors.DARK_GRAY,
  color: Colors.SNOW_WHITE,
  transitionProperty: 'color',
  transitionDuration: '.5s',
  transitionTimingFunction: 'ease-in-out',
  _hover: {
    color: Colors.SNOW_WHITE,
    backgroundColor: Colors.SNOW_WHITE_ALPHA_50,
  },
  borderRadius: 8,
}

const SignUp: VFC = () => {
  const {
    wax: { isLoggedIn },
  } = useAppState()

  const {
    wax: { collectEvent },
    main: { signUp, storeOnboardingNewsletterWasShown, logout },
  } = useActions()

  const navigate = useNavigate()

  const [isSigningUp, setIsSigningUp] = useState(false)

  useEffect(() => {
    if (isLoggedIn) {
      //delay(() => navigate(PagePath.Onboarding), 1000)
    }
  }, [isLoggedIn])

  const doSignUp = () => {
    signUp()
    storeOnboardingNewsletterWasShown(false)
    setIsSigningUp(true)
    collectEvent({ name: Constants.GA_AW_ONBOARDING_SIGNUP })

    delay(() => navigate(PagePath.Home), 5000)
  }

  return (
    <Flex
      p={{ base: 4, md: 16 }}
      flexDirection="column"
      mx="auto"
      textAlign="center"
      alignItems="center"
      justifyContent="center"
      flexGrow={1}
      w="full"
      maxWidth="2xl"
      h="fit-content"
      color={Colors.MID_ALTO}
    >
      <Flex
        flexDirection="column"
        flexGrow={1}
        alignItems="center"
        justifyContent="space-between"
        mx="auto"
        fontFamily="Titillium Web"
        w="full"
        maxWidth="full"
        maxHeight="2xl"
        minWidth={{ base: 'fit-content', lg: 'max-content' }}
        minHeight="max-content"
        background={Colors.BLACK_NEUTRAL_80}
        flex="1 1 auto"
        borderRadius={{
          base: 18,
          md: 36,
        }}
        pt={16}
      >
        <Image
          src="/images/alienworlds-db-logo_full_color.svg"
          alt="Alien Worlds Logo"
          w="full"
          maxW={{
            base: '50%',
            md: '2xs',
          }}
          mb={10}
        />
        <Flex w="full" justifyContent="center" alignItems="center" mb={0}>
          <Text color={Colors.SNOW_WHITE} fontSize="18px" w="sm" lineHeight="28px" mb={5}>
            Welcome to Alien Worlds <br />
            Firstly, press “Start” and create an account through our partner “Cloud Wallet”, where
            you will also be able to create your crypto wallet on WAX blockchain
          </Text>
        </Flex>
        <Button onClick={doSignUp} size="md" disabled={isSigningUp} variant="primary">
          Start Now
        </Button>
        <Flex alignItems="center" w="80%" gap={2} ml="auto" mr="auto" mt={6} mb={4}>
          <Box
            flex="1 1 auto"
            pt="auto"
            pb="auto"
            w="full"
            height="1px"
            background={Colors.GRADIENT_BLACK_TO_WHITE}
          />
          <Text flex="1 0 fit-content" fontSize="12px">
            join community
          </Text>
          <Box
            flex="1 1 auto"
            pt="auto"
            pb="auto"
            w="full"
            height="1px"
            background={Colors.GRADIENT_BLACK_TO_WHITE}
            transform="matrix(-1, 0, 0, 1, 0, 0)"
          />
        </Flex>
        <Flex m={0} alignItems="center" justify="center" flexWrap="wrap" gap={8}>
          <Link href={config.DiscordUrl} target="_blank">
            <IconButton
              aria-label="Discord"
              icon={<DiscordIcon boxSize="30px" />}
              {...socialButtonsProps}
            />
          </Link>
          <Link href={config.TelegramUrl} target="_blank">
            <IconButton
              aria-label="Telegram"
              icon={<TelegramIcon boxSize="30px" />}
              {...socialButtonsProps}
            />
          </Link>
        </Flex>
        <Text fontWeight="700" fontSize="18px" lineHeight="36px" mb={12} mt={12}>
          Already have an account?{' '}
          <Link color={Colors.SHINY_GOLD} onClick={logout}>
            Log in
          </Link>
        </Text>
      </Flex>
    </Flex>
  )
}

export { SignUp }
