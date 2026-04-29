import { useEffect, useState } from 'react'

import {
  Container,
  Modal,
  ModalContent,
  ModalBody,
  Spinner,
  ModalOverlay,
  ModalCloseButton,
} from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'

export const LoadingModal = () => {
  const {
    modal: { setPrimaryModalActive },
  } = useActions()
  const {
    modal: { primaryModals },
  } = useAppState()

  const [showCloseButton, setShowCloseButton] = useState(false)

  const handleClose = () => {
    setPrimaryModalActive({ modalName: 'LoadingModal', value: false })
  }

  useEffect(() => {
    setTimeout(() => {
      setShowCloseButton(true)
    }, 5000)
  })

  return (
    <Modal
      size="full"
      motionPreset="none"
      preserveScrollBarGap
      onClose={() => handleClose()}
      isOpen={primaryModals.LoadingModal}
    >
      <ModalOverlay backdropFilter="blur(1px)" />
      <ModalContent background={Colors.BLACK_ALPHA_50} justifyContent="center">
        {showCloseButton && (
          <ModalCloseButton
            size="xl"
            marginTop={{ base: 0, lg: 90 }}
            marginRight={{ base: 0, lg: 10 }}
            zIndex={2000}
          />
        )}
        <ModalBody>
          <Container h="98vh" w="100vw" alignItems="center" display="flex" justifyContent="center">
            <Spinner size="xl" />
          </Container>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
