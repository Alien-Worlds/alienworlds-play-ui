import { useEffect } from 'react'

import { DiscordIcon2, TelegramIcon2 } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Box, Flex, Image, Link, Text } from '@chakra-ui/react'
import { useNavigate, useRouteError } from 'react-router-dom'
import { useTimeoutFn } from 'react-use'
import { config } from 'shared/util/config'
import { useActions } from 'store'
import { PagePath } from 'store/main/types'

import { Constants } from '../util/constants'

const ErrorFallback = () => {
  const {
    wax: { collectEvent },
  } = useActions()

  const error = useRouteError()
  const errorJSON = JSON.stringify(error, Object.getOwnPropertyNames(error))

  // we have to collect analytics here before the redirect
  // because onError of ErrorBoundary triggers later than FallbackComponent renders
  const extraFields = {
    description: errorJSON || 'Unknown Internal Error',
  }
  collectEvent({ name: Constants.GA_AW_ERROR, fields: extraFields })

  // having an independent fallback UI instead of whole app rendering the error page route
  // and using onError of ErrorBoundary for logging would be a cleaner solution
  // don't redirect to error page in development mode to show the error
  if (!config.IsDevelopment) {
    window.location.href = PagePath.Error
  }
  return null
}

const ErrorPage = () => {
  const {
    main: { showErrorPage },
  } = useActions()
  const navigate = useNavigate()

  const redirectToHome = () => {
    navigate(PagePath.Home)
  }

  useEffect(() => {
    showErrorPage()
  }, [])

  const [, cancel] = useTimeoutFn(redirectToHome, 5000)

  return (
    <Flex
      p={{ base: 4, md: 16 }}
      flexDirection="column"
      mx="auto"
      textAlign="center"
      position="relative"
      alignItems="center"
      justifyContent="center"
      flexGrow={1}
      w="full"
      color="#e0e0e0"
    >
      <Flex
        flexDirection="column"
        flexGrow={1}
        alignItems="center"
        justifyContent="center"
        w="full"
        mx="auto"
        fontFamily="Titillium Web"
      >
        <Image
          src="/images/alienworlds-db-logo_full_color.svg"
          alt="Alien Worlds Logo"
          w="full"
          maxW="250px"
          mb={{ base: 12, md: 20 }}
        />
        <Button
          variant="primary"
          size="md"
          onClick={() => {
            cancel()
            redirectToHome()
          }}
        >
          Reload Game
        </Button>
        <Text mt={1}>Something went wrong. Game will reload shortly...</Text>
      </Flex>

      <Flex color="white" mt={8} alignItems="center" justify="center" flexWrap="wrap">
        <Text mt={4}>Join the community</Text>
        <Flex ml={8} alignItems="center" justify="center" flexWrap="wrap">
          <Box marginBottom={10} marginTop={10}>
            <Link href={config.TelegramUrl} target="_blank" rel="noopener">
              <Button
                variant="dark"
                size="md"
                fontFamily="Titillium Web"
                color="white"
                isFullWidth
                justifyContent="flex-start"
                fontSize={18}
                leftIcon={<TelegramIcon2 boxSize={29} />}
              >
                Telegram
              </Button>
            </Link>
          </Box>
          <Box marginBottom={10} marginTop={10}>
            <Link href={config.DiscordUrl} target="_blank" rel="noopener">
              <Button
                variant="dark"
                size="md"
                fontFamily="Titillium Web"
                color="white"
                justifyContent="flex-start"
                fontSize={18}
                leftIcon={<DiscordIcon2 boxSize={29} />}
              >
                Discord
              </Button>
            </Link>
          </Box>
        </Flex>
      </Flex>
    </Flex>
  )
}

export { ErrorPage, ErrorFallback }
