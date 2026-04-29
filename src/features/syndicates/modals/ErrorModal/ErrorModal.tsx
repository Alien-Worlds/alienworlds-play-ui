import React from 'react'

import { InfoIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import {
  Container,
  Text,
  VStack,
  Modal,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  HStack,
} from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'

const ERROR_TEMPLATES = {
  CANDIDATE_CANNOT_UNSTAKE:
    'Cannot Unstake because you are registered as a Candidate, use Withdraw Candidacy to unregister',
}

const ErrorModal = () => {
  const {
    modal: { secondaryModals, errorType },
  } = useAppState()
  const {
    modal: { setSecondaryModalActive },
  } = useActions()

  const handleClose = () => {
    setSecondaryModalActive({ modalName: 'ErrorModal', value: false })
  }

  return (
    <Modal isOpen={secondaryModals.ErrorModal} onClose={() => handleClose()}>
      <ModalContent
        background={Colors.BLACK_SOLID_90}
        border="0.2px"
        borderColor={Colors.SNOW_WHITE}
        borderStyle="solid"
        justifyContent="center"
        top="20%"
      >
        <ModalCloseButton zIndex={2000} />
        <ModalBody>
          <Container alignItems="center" display="flex" justifyContent="center" maxW="100%">
            <VStack gap={6} alignItems="center">
              <HStack gap={6}>
                <InfoIcon boxSize="33px" color={Colors.RADICAL_RED} />
                <Text
                  fontFamily="Orbitron"
                  color={Colors.RADICAL_RED}
                  fontSize={48}
                  fontWeight={400}
                >
                  Error!
                </Text>
              </HStack>
              <VStack>
                <Text
                  fontFamily="Titillium Web"
                  fontSize="20px"
                  fontWeight={400}
                  color={Colors.SNOW_WHITE}
                  maxW={422}
                >
                  {ERROR_TEMPLATES[errorType]}
                </Text>
              </VStack>

              <HStack gap={4}>
                <Button size="lg" variant="info" onClick={() => handleClose()}>
                  Return
                </Button>
              </HStack>
            </VStack>
          </Container>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export { ErrorModal }
