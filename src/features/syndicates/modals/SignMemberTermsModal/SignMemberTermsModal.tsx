import React from 'react'

import { Container, Modal, ModalContent, ModalBody, ModalCloseButton, Box } from '@chakra-ui/react'
import { PlanetMemberTerms } from 'features/syndicates/pages/PlanetMemberTerms'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'

const SignMemberTermsModal = () => {
  const {
    wax: { selectedDacId },
    modal: { secondaryModals },
  } = useAppState()

  const {
    modal: { setSecondaryModalActive },
  } = useActions()

  const handleClose = () => {
    setSecondaryModalActive({ modalName: 'SignMemberTermsModal', value: false })
  }

  if (selectedDacId)
    return (
      <Modal
        size="full"
        isOpen={secondaryModals.SignMemberTermsModal}
        onClose={() => handleClose()}
      >
        <ModalContent background={Colors.BLACK_SOLID_90}>
          <ModalCloseButton
            marginTop={{ base: 0, lg: 90 }}
            marginRight={{ base: 0, lg: 10 }}
            zIndex={2000}
          />
          <ModalBody>
            <Container
              h="auto"
              alignItems="center"
              display="flex"
              justifyContent="center"
              paddingTop={24}
            >
              <Box h="calc(85vh)" overflowY="scroll" paddingBottom={{ base: 24, lg: 0 }}>
                <PlanetMemberTerms isModal />
              </Box>
            </Container>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  return null
}

export { SignMemberTermsModal }
