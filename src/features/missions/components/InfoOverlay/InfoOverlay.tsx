import { VFC } from 'react'

import { Button, Center, Text, VStack } from '@chakra-ui/react'
import { css, Global } from '@emotion/react'
import { useActions, useAppState } from 'store'

const InfoOverlay: VFC = () => {
  const {
    missions: { infoMessage },
  } = useAppState()

  const {
    missions: { clearInfoMessage },
  } = useActions()

  return (
    <Center
      id="missions-info-overlay"
      minH="100vh"
      minW="100vw"
      position="fixed"
      backgroundColor="blackAlpha.800"
      zIndex={10003}
      top={0}
      left={0}
    >
      <Global
        styles={css`
          .chakra-modal__content-container
        `}
      />
      <VStack spacing={12}>
        <Text
          fontFamily="Titillium Web"
          fontSize="3xl"
          fontWeight={700}
          color="#0ed4a8"
          mb={2}
          textAlign="center"
          maxW="600px"
        >
          {infoMessage}
        </Text>
        <Button
          onClick={() => clearInfoMessage()}
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

export { InfoOverlay }
