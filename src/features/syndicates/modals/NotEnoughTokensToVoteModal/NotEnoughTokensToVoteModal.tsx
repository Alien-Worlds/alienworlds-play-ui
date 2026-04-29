import React from 'react'

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
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { motion } from 'framer-motion'
import { useDaoDetails } from 'graphql/hooks/useDaoDetails'
import { DaoDetailsResponse } from 'graphql/types'
import { Colors } from 'shared/util/colors'
import { PlanetIcon } from 'shared/util/icons'
import { useActions, useAppState } from 'store'

const AnimatedBox = motion(Box)

const NotEnoughTokensToVoteModal = () => {
  const {
    wax: { selectedDacId },
    modal: { secondaryModals },
  } = useAppState()
  const {
    modal: { setSecondaryModalActive, setPrimaryModalActive },
  } = useActions()

  const handleClose = () => {
    setSecondaryModalActive({ modalName: 'NotEnoughTokensToVoteModal', value: false })
  }
  const handleSubmit = () => {
    setPrimaryModalActive({ modalName: 'ConvertPlanataryTokenModal', value: true })
  }

  const iconSize = useBreakpointValue({
    base: '100px',
    lg: '140px',
  })
  const currentBreakpointButtonSize: keyof typeof BUTTON_SIZE = useBreakpointValue({
    base: 'sm',
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'lg',
    '2xl': 'lg',
  })

  const {
    daoDetails,
    loading: loadingDaoDetails,
  }: { daoDetails: DaoDetailsResponse; loading: boolean } = useDaoDetails(selectedDacId)

  if (loadingDaoDetails) return <LoadingSpinner />
  if (selectedDacId)
    return (
      <Modal
        size="full"
        isOpen={secondaryModals.NotEnoughTokensToVoteModal}
        onClose={() => handleClose()}
      >
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
                <VStack gap={10}>
                  <Text
                    fontFamily="Orbitron"
                    fontSize={{
                      base: 24,
                      lg: 48,
                    }}
                    fontWeight={400}
                  >
                    Welcome Explorer
                  </Text>
                  <Flex gap={5} flexDirection={{ base: 'column', lg: 'row' }} alignItems="center">
                    <Box>
                      <PlanetIcon
                        planetName={daoDetails.title}
                        style={{ width: iconSize, height: iconSize }}
                      />
                    </Box>

                    <Text
                      fontFamily="Titillium Web"
                      fontSize={{
                        base: 15,
                        lg: 20,
                      }}
                      fontWeight={400}
                      color={Colors.SNOW_WHITE}
                      maxW={422}
                      textAlign={{ base: 'center', lg: 'left' }}
                    >
                      To vote for this candidate on the {daoDetails.title} Syndicate, you will need
                      Vote Power. Stake your TLM Tokens to {daoDetails.title} over a period of time
                      to get Vote Power.
                    </Text>
                  </Flex>

                  <Flex
                    flexDirection={{ base: 'column-reverse', md: 'row' }}
                    gap={4}
                    justifyItems="center"
                  >
                    <Button
                      size={currentBreakpointButtonSize}
                      variant="info"
                      fontSize={18}
                      onClick={() => handleClose()}
                    >
                      Cancel
                    </Button>
                    <Button
                      size={currentBreakpointButtonSize}
                      variant="primary"
                      fontSize={18}
                      onClick={() => {
                        handleClose()

                        handleSubmit()
                      }}
                    >
                      Stake your TLM
                    </Button>
                  </Flex>
                </VStack>
              </Container>
            </AnimatedBox>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  return null
}

export { NotEnoughTokensToVoteModal }
