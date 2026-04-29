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

const BlockchainChangeDaoConfigsDisclaimerModal = () => {
  const {
    modal: { secondaryModals },
  } = useAppState()

  const {
    modal: { setSecondaryModalActive },
  } = useActions()

  const handleClose = () => {
    setSecondaryModalActive({
      modalName: 'BlockchainChangeDaoConfigsDisclaimerModal',
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
    <Modal
      isOpen={secondaryModals.BlockchainChangeDaoConfigsDisclaimerModal}
      onClose={() => handleClose()}
    >
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
          Warning Proposal Config
        </ModalHeader>
        <ModalBody fontFamily="tlm" color={Colors.SNOW_WHITE}>
          <Flex gap={4} direction="column" textAlign="center">
            <Box>
              <Text as="span" color={Colors.RADICAL_RED}>
                Anything you submit here will be publicly visible in perpetuity on the blockchain.
              </Text>
              <Text as="span">
                &nbsp;Be mindful of this when submitting information. If you add any personal or
                otherwise identifying information (e.g. your name or email address, among other),
                you acknowledge and agree that such information will irrevocably become public and
                you irrevocably and unconditionally CONSENT to such disclosure.
              </Text>
            </Box>

            <Text>
              Please note you do not have to submit such information here and that we do not suggest
              or recommend that you submit any such information.
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

export { BlockchainChangeDaoConfigsDisclaimerModal }
