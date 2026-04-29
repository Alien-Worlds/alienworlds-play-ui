import { VFC } from 'react'

import { Button, Center, Text, VStack } from '@chakra-ui/react'
import { useActions, useAppState } from 'store'

const ErrorOverlay: VFC = () => {
  const {
    missions: { errorMessage },
  } = useAppState()

  const {
    missions: { clearErrorMessage },
  } = useActions()

  return (
    <Center
      id="missions-error-overlay"
      minH="100vh"
      minW="100vw"
      position="fixed"
      backgroundColor="blackAlpha.800"
      zIndex={10002}
      top={0}
      left={0}
    >
      <VStack spacing={12}>
        <Text
          fontFamily="Titillium Web"
          fontSize="3xl"
          fontWeight={700}
          color="#ff3b52"
          mb={2}
          textAlign="center"
          maxW="600px"
        >
          {errorMessage}
        </Text>
        <Button
          onClick={() => {
            clearErrorMessage()
          }}
          size="md"
          borderColor="#e0e0e0"
          color="#e0e0e0"
          letterSpacing="2px"
          variant="outline"
          fontFamily="Orbitron"
          fontWeight="thin"
          px={4}
          py={1}
          borderRadius={10}
          borderWidth="2px"
          fontSize="24px"
          backgroundColor="transparent"
          transition="all 0.3s ease-out 0s"
          _hover={{
            backgroundColor: '#e0e0e0',
            color: 'blackAlpha.800',
            transform: 'scale(0.92)',
          }}
          _active={{ backgroundColor: '#e0e0e0', color: 'blackAlpha.800' }}
        >
          OK
        </Button>
      </VStack>
    </Center>
  )
}

export { ErrorOverlay }
