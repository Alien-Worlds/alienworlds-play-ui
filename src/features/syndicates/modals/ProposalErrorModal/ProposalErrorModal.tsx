import React from 'react'

import { ProposalsIcon } from '@alien-worlds/icons'
import { Button, BUTTON_SIZE } from '@alien-worlds/uikit'
import {
  Container,
  Text,
  VStack,
  Modal,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Box,
  HStack,
  UnorderedList,
  ListItem,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'

const AnimatedBox = motion(Box)

const ProposalErrorModal = () => {
  const iconSize = useBreakpointValue({
    base: '20px',
    sm: '20px',
    md: '20px',
    lg: '33px',
    xl: '33px',
    '2xl': '33px',
  })

  const iconContainerSize = useBreakpointValue({
    base: '30px',
    sm: '30px',
    md: '30px',
    lg: '48px',
    xl: '48px',
    '2xl': '48px',
  })

  const {
    modal: { primaryModals },
  } = useAppState()

  const {
    modal: { setPrimaryModalActive },
  } = useActions()

  const handleClose = () => {
    setPrimaryModalActive({ modalName: 'ProposalErrorModal', value: false })
  }
  const currentBreakpointButtonSize: keyof typeof BUTTON_SIZE = useBreakpointValue({
    base: 'sm',
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'lg',
    '2xl': 'lg',
  })
  return (
    <Modal size="full" isOpen={primaryModals.ProposalErrorModal} onClose={() => handleClose()}>
      <ModalContent background={Colors.BLACK_SOLID_90}>
        <ModalCloseButton
          marginTop={{ base: 0, lg: 90 }}
          marginRight={{ base: 0, lg: 10 }}
          zIndex={2000}
        />
        <ModalBody>
          <AnimatedBox
            initial={{ opacity: 0, y: -255 }}
            animate={{ opacity: 1, y: -40 }}
            transition={{
              duration: 0.5,
              delay: 0.1,
              ease: [0, 0.71, 0.2, 1.01],
            }}
          >
            <Container
              h="calc(100vh)"
              alignItems="center"
              display="flex"
              justifyContent="center"
              maxW="container.xl"
            >
              <VStack gap={6} alignItems="center">
                <HStack gap={6}>
                  <Box
                    borderRadius="100%"
                    backgroundColor={Colors.RADICAL_RED}
                    style={{
                      width: iconContainerSize,
                      height: iconContainerSize,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <ProposalsIcon style={{ width: iconSize, height: iconSize }} />
                  </Box>
                  <Text
                    fontFamily="Orbitron"
                    color={Colors.RADICAL_RED}
                    fontSize={{
                      base: 24,
                      lg: 48,
                    }}
                    fontWeight={400}
                  >
                    Try again!
                  </Text>
                </HStack>
                <VStack
                  fontSize={{
                    base: 15,
                    lg: 20,
                  }}
                >
                  <Text
                    fontFamily="Titillium Web"
                    fontWeight={400}
                    color={Colors.SNOW_WHITE}
                    maxW={422}
                    textAlign="center"
                  >
                    There was an error with your proposal. Please fix:
                  </Text>
                  <UnorderedList style={{ columnCount: 2, justifyContent: 'center' }}>
                    <ListItem>Title</ListItem>
                    <ListItem>To</ListItem>
                    <ListItem>From</ListItem>
                    <ListItem>Quantity</ListItem>
                  </UnorderedList>
                </VStack>

                <HStack gap={4}>
                  <Button
                    size={currentBreakpointButtonSize}
                    variant="info"
                    onClick={() => handleClose()}
                  >
                    Return
                  </Button>
                </HStack>
              </VStack>
            </Container>
          </AnimatedBox>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export { ProposalErrorModal }
