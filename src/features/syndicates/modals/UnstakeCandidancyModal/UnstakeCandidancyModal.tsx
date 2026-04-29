import React from 'react'

import { UnstakeCandidancyIcon } from '@alien-worlds/icons'
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
  Icon,
  useBreakpointValue,
  Flex,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { capitalize } from 'lodash'
import { Colors } from 'shared/util/colors'
import { convertPlanetIdToName } from 'shared/util/helpers'
import { useActions, useAppState } from 'store'

import { Constants } from '../../../../shared/util/constants'

const AnimatedBox = motion(Box)

const UnstakeCandidancyModal = () => {
  const {
    wax: { selectedDacId },
    modal: { primaryModals },
  } = useAppState()

  const {
    modal: { setPrimaryModalActive },
  } = useActions()

  const handleClose = () => {
    setPrimaryModalActive({ modalName: 'UnstakeCandidancyModal', value: false })
  }
  const handleSubmit = () => {}

  const iconSize = useBreakpointValue({
    base: '70px',
    md: '100px',
    lg: '133px',
  })
  const currentBreakpointButtonSize: keyof typeof BUTTON_SIZE = useBreakpointValue({
    base: 'xs',
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'lg',
    '2xl': 'lg',
  })
  return (
    <Modal size="full" isOpen={primaryModals.UnstakeCandidancyModal} onClose={() => handleClose()}>
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
              <VStack gap={8}>
                <UnstakeCandidancyIcon
                  style={{ width: iconSize, height: iconSize, marginRight: 2, marginTop: 10 }}
                />

                <Text
                  fontFamily="Orbitron"
                  color={Colors.RADICAL_RED}
                  fontSize={{
                    base: 24,
                    lg: 48,
                  }}
                  fontWeight={400}
                >
                  Unstake your candidacy
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
                  <span
                    style={{
                      fontFamily: 'Titillium Web',
                      fontWeight: 400,
                      color: Colors.RADICAL_RED,

                      position: 'relative',
                    }}
                  >
                    {' '}
                    Unstaking
                  </span>{' '}
                  your {Constants.DAC_CANDIDACY_STAKE_AMOUNT} TLM in{' '}
                  {capitalize(convertPlanetIdToName(selectedDacId))}
                  will take{' '}
                  <span
                    style={{
                      fontFamily: 'Titillium Web',
                      fontWeight: 400,
                      color: Colors.RADICAL_RED,

                      position: 'relative',
                    }}
                  >
                    {' '}
                    48 hours
                  </span>{' '}
                  to receive your TLM.
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
                    leftIcon={<Icon as={UnstakeCandidancyIcon}></Icon>}
                    variant="alert"
                    onClick={() => {
                      handleClose()
                      handleSubmit()
                    }}
                  >
                    Yes, Unstake my Candidacy
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

export { UnstakeCandidancyModal }
