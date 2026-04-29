import { useEffect, useState } from 'react'

import { DiscordIcon, TelegramIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Flex, Image, Link, Text, Box, IconButton, Spinner } from '@chakra-ui/react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'
import { useActions, useAppState } from 'store'
import { PagePath } from 'store/main/types'

import { Constants } from '../../../../shared/util/constants'

const socialButtonsProps = {
  width: '120px',
  height: '60px',
  backgroundColor: Colors.DARK_GRAY,
  color: Colors.MID_GRAY,
  transitionProperty: 'color',
  transitionDuration: '.5s',
  transitionTimingFunction: 'ease-in-out',
  _hover: {
    color: Colors.SNOW_WHITE,
  },
  borderRadius: 8,
}

export const LoginPrompt = () => {
  const {
    main: { tryAutoLogin, login },
  } = useActions()
  const {
    wax: { isAuthenticating },
  } = useAppState()

  const navigate = useNavigate()
  const { pathname } = useLocation()
  const isHomePage = pathname === PagePath.Home
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isLogging, setIsLogging] = useState<boolean>(false)

  useEffect(() => {
    setIsLoading(isAuthenticating)
  }, [isAuthenticating])

  return (
    <>
      {isLogging ? (
        <Spinner size="xl" />
      ) : (
        <Flex
          flexDirection="column"
          flexGrow={1}
          alignItems="center"
          justifyContent="space-between"
          mx="auto"
          fontFamily="Titillium Web"
          w={{ base: 'full', sm: '400px', md: '550px' }}
          maxWidth="full"
          maxHeight="2xl"
          minWidth={{ base: 'fit-content', lg: 'max-content' }}
          minHeight="max-content"
          background={isHomePage ? Colors.BLACK_NEUTRAL_80 : Colors.COD_GRAY}
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
            <Text color={Colors.SNOW_WHITE} fontSize="18px" lineHeight="54px">
              {isHomePage ? 'Great to have you Back!' : 'Please login to your account'}
            </Text>
          </Flex>
          <Button
            onClick={async () => {
              if (isHomePage) {
                tryAutoLogin()
              } else {
                setIsLogging(true)
                await login()
                setTimeout(() => {
                  setIsLogging(false)
                }, Constants.DEMO_LOGIN_DURATION)
              }
            }}
            size="md"
            isLoading={isLoading}
            variant="primary"
          >
            {isHomePage ? 'Start Now' : 'Login'}
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
            Don’t have an account?{' '}
            <Text
              cursor="pointer"
              as="span"
              color={Colors.SHINY_GOLD}
              onClick={() => navigate(PagePath.SignUp)}
            >
              Sign Up
            </Text>
          </Text>
        </Flex>
      )}
    </>
  )
}
