import { VFC } from 'react'

import { UpdateProfileIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Center, Spinner, Text, VStack } from '@chakra-ui/react'
import { css, Global } from '@emotion/react'
import { useActions, useAppState } from 'store'

const LoadingTransactionOverlay: VFC = () => {
  const {
    wax: { showOnboardingRetry },
    missions: { loadingMessage },
  } = useAppState()
  const {
    wax: { executeOnboarding },
  } = useActions()

  return (
    <Center
      id="missions-loadingtx-overlay"
      top={0}
      left={0}
      minH="100vh"
      minW="100vw"
      position="fixed"
      backgroundColor="blackAlpha.800"
      zIndex={10001}
    >
      <Global
        styles={css`
          .chakra-modal__content-container,
          #missions-layout,
          #missions-header,
          #missions-error-overlay,
          #missions-info-overlay,
          #missions-wrong-chain-overlay,
          #missions-claim-rewards,
          #missions-join-mission {
            filter: blur(3px);
          }
        `}
      />
      <VStack spacing={12}>
        <VStack spacing={4}>
          <Text fontFamily="Titillium Web" fontSize="3xl" fontWeight={700} textAlign="center">
            {loadingMessage || 'Executing transaction on the chain...'}
          </Text>
          <Text
            fontFamily="Titillium Web"
            fontSize="xl"
            fontWeight={700}
            color="whiteAlpha.500"
            textAlign="center"
          >
            This process may take over a minute, please be patient...
          </Text>
          {showOnboardingRetry && (
            <Button
              size="md"
              fontSize={18}
              variant="info"
              marginBlock="10px"
              rightIcon={<UpdateProfileIcon boxSize={24} />}
              fontFamily="Titillium Web"
              onClick={() => executeOnboarding()}
            >
              Try again
            </Button>
          )}
        </VStack>

        <Spinner size="lg" />
      </VStack>
    </Center>
  )
}

export { LoadingTransactionOverlay }
