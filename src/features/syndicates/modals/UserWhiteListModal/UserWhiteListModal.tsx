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
  Image,
} from '@chakra-ui/react'
import AlienWorldsLogo from 'assets/images/alienworlds-db-logo_full_color.svg'
import { motion } from 'framer-motion'
import { Colors } from 'shared/util/colors'
import { openInNewTab } from 'shared/util/helpers'
import { useAppState, useActions } from 'store'
const AnimatedBox = motion(Box)

const UserWhiteListModal = () => {
  const {
    modal: { secondaryModals },
  } = useAppState()

  const {
    modal: { setSecondaryModalActive },
  } = useActions()

  const handleClose = () => {
    setSecondaryModalActive({ modalName: 'UserWhiteListModal', value: false })
  }
  const handleSubmit = () => {
    openInNewTab('https://verifyme.alienworlds.io/')
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
    <Modal size="full" isOpen={secondaryModals.UserWhiteListModal} onClose={() => handleClose()}>
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
              maxW="100%"
              paddingTop={{ base: '100px', lg: 0 }}
            >
              <VStack gap={8} textAlign="center">
                <Flex w="100%" alignItems="center" justifyContent="center">
                  <Image
                    my={6}
                    w="225px"
                    alignSelf="center"
                    paddingBlock="15px"
                    src={AlienWorldsLogo}
                    alt="Alien Worlds Logo"
                  />
                </Flex>

                <Text
                  fontFamily="Orbitron"
                  fontSize={{
                    base: 24,
                    lg: 48,
                  }}
                  fontWeight={400}
                >
                  You have to Verify to be able to vote
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
                  Get Verified to become a Union Candidate.
                </Text>

                <Flex
                  flexDirection={{ base: 'column-reverse', md: 'row' }}
                  gap={4}
                  justifyItems="center"
                >
                  <Button
                    size={currentBreakpointButtonSize}
                    variant="tertiary"
                    onClick={() => handleClose()}
                  >
                    Cancel
                  </Button>
                  <Button
                    size={currentBreakpointButtonSize}
                    variant="warning"
                    onClick={() => {
                      handleSubmit()
                      handleClose()
                    }}
                  >
                    Verify Me
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

export { UserWhiteListModal }
