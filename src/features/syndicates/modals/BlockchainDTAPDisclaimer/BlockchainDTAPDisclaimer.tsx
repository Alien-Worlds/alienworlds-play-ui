import { Button, BUTTON_SIZE } from '@alien-worlds/uikit'
import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  ModalFooter,
  Box,
  Flex,
  Link,
  useBreakpointValue,
} from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'
import { useAppState, useActions } from 'store'

const BlockchainDTAPDisclaimer = () => {
  const {
    modal: { secondaryModals },
  } = useAppState()

  const {
    modal: { setSecondaryModalActive },
  } = useActions()

  const handleClose = () => {
    setSecondaryModalActive({
      modalName: 'BlockchainDTAPDisclaimerModal',
      value: false,
    })
  }

  const handleConfirm = () => {
    if (typeof secondaryModals.onConfirm === 'function') {
      secondaryModals.onConfirm()
    }
    handleClose()
  }
  const currentButtonSize: keyof typeof BUTTON_SIZE = useBreakpointValue({
    base: 'sm',
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'md',
    '2xl': 'md',
  })
  return (
    <Modal isOpen={secondaryModals.BlockchainDTAPDisclaimerModal} onClose={() => handleClose()}>
      <ModalOverlay bg={Colors.BLACK_ALPHA_80} />
      <ModalContent
        bg={Colors.MODAL_BACKGROUND_COLOR}
        maxWidth="lg"
        padding={4}
        borderStyle="solid"
        borderWidth={4}
        sx={{
          borderImageSlice: 1,
          borderImageSource: Colors.MODAL_BORDER_COLOR,
        }}
      >
        <ModalCloseButton top={-10} fontSize={20} right={{ base: 0, md: -10 }} />
        <ModalHeader
          fontSize={{ base: '3xl', md: '5xl' }}
          fontFamily="orb"
          fontWeight={400}
          textAlign="center"
        >
          Warning
        </ModalHeader>
        <ModalBody fontFamily="tlm" color={Colors.SNOW_WHITE}>
          <Flex gap={4} direction="column" textAlign="center">
            <Box>
              <Text as="span" color={Colors.RADICAL_RED}>
                Are you sure?
              </Text>
              <Text as="span">
                &nbsp;You’re assigning a share of your planets mining rewards to a designated
                account. This decision can be revised later, but its impact starts immediately after
                this MSIG proposal has been executed
              </Text>
            </Box>

            <Text>
              Please note you do not have to submit extra context here and that we do not suggest or
              recommend that you submit any information more than necessary for the proposal.
            </Text>
          </Flex>
        </ModalBody>
        <ModalFooter justifyContent="center">
          <Flex direction="column" gap={4} width={{ base: 'full', md: '60%' }}>
            <Button variant="negative" onClick={() => handleConfirm()} size={currentButtonSize}>
              Accept
            </Button>
            <Link
              href={`${config.AlienWorldsUrl}/privacy-policy`}
              target="_blank"
              rel="noopener"
              width="full"
            >
              <Button variant="info" size={currentButtonSize} width="full">
                Privacy Policy
              </Button>
            </Link>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export { BlockchainDTAPDisclaimer }
