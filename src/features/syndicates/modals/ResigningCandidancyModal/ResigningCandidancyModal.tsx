import { CandiateIcon } from '@alien-worlds/icons'
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
  useBreakpointValue,
  Flex,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'

const AnimatedBox = motion(Box)

const ResigningCandidancyModal = () => {
  const iconSize = useBreakpointValue({
    base: '70px',
    sm: '70px',
    md: '100px',
    lg: '133px',
    xl: '133px',
    '2xl': '133px',
  })

  const {
    modal: { primaryModals },
  } = useAppState()

  const {
    modal: { setPrimaryModalActive },
  } = useActions()

  const handleClose = () => {
    setPrimaryModalActive({ modalName: 'ResigningCustodianModal', value: false })
  }
  const handleSubmit = () => {}
  const currentBreakpointButtonSize: keyof typeof BUTTON_SIZE = useBreakpointValue({
    base: 'sm',
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'lg',
    '2xl': 'lg',
  })
  return (
    <Modal size="full" isOpen={primaryModals.ResigningCustodianModal} onClose={() => handleClose()}>
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
              h={{ base: 'auto', lg: 'calc(100vh)' }}
              alignItems="center"
              display="flex"
              justifyContent="center"
              maxW="container.xl"
              paddingTop={{ base: '100px', lg: 0 }}
            >
              <VStack gap={8} textAlign="center">
                <Box
                  borderRadius="100%"
                  borderWidth={{ base: 5, md: 8 }}
                  borderColor={Colors.SNOW_WHITE}
                  padding={{ base: 3, md: 6 }}
                >
                  <CandiateIcon w={iconSize} h={iconSize} style={{ marginTop: 2 }} />
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
                  Resign Custodianship
                </Text>

                <Text
                  fontFamily="Titillium Web"
                  fontSize={{
                    base: 15,
                    lg: 20,
                  }}
                  fontWeight={400}
                  color={Colors.SNOW_WHITE}
                  maxW={422}
                >
                  You are currently an Active Custodian, resigning your position will bar you from
                  becoming a custodian for 1 Week.
                </Text>
                <Text
                  fontFamily="Titillium Web"
                  fontSize={{
                    base: 15,
                    lg: 20,
                  }}
                  fontWeight={400}
                  color={Colors.SNOW_WHITE}
                  maxW={422}
                >
                  A Snap Election will occur upon your resignation.
                </Text>
                <Flex
                  flexDirection={{ base: 'column-reverse', md: 'row' }}
                  gap={4}
                  justifyItems="center"
                >
                  <Button
                    size={currentBreakpointButtonSize}
                    variant="info"
                    onClick={() => handleClose()}
                  >
                    Cancel
                  </Button>

                  <Button
                    size={currentBreakpointButtonSize}
                    variant="alert"
                    onClick={() => {
                      handleClose()
                      handleSubmit()
                    }}
                  >
                    Yes, Resign my Custodianship
                  </Button>
                </Flex>
              </VStack>
            </Container>
          </AnimatedBox>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export { ResigningCandidancyModal }
