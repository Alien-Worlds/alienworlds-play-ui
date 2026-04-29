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
import { PlanetImage } from 'features/mining/components/PlanetLand/Components/PlanetImage'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { motion } from 'framer-motion'
import { useDaoDetails } from 'graphql/hooks/useDaoDetails'
import { DaoDetailsResponse } from 'graphql/types'
import { useNavigate } from 'react-router-dom'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'
import { PagePath } from 'store/main/types'

const AnimatedBox = motion(Box)

const NotSignedMemberTermsModal = () => {
  const {
    wax: { selectedDacId },
    modal: { secondaryModals },
  } = useAppState()

  const {
    modal: { setSecondaryModalActive },
  } = useActions()
  const navigate = useNavigate()
  const handleClose = () => {
    setSecondaryModalActive({ modalName: 'NotSignedMemberTermsModal', value: false })
  }
  const handleSubmit = () => {
    setSecondaryModalActive({ modalName: 'NotSignedMemberTermsModal', value: false })

    const memberTermsPage = `${PagePath.GovernanceSelect}/${selectedDacId}/memberTerms`
    navigate(memberTermsPage)
  }
  const planetIconSize = useBreakpointValue({
    base: '100px',
    sm: '100px',
    md: '100px',
    lg: '140px',
    xl: '140px',
    '2xl': '140px',
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
        isOpen={secondaryModals.NotSignedMemberTermsModal}
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
                paddingTop={{ base: '100px', lg: 0 }}
              >
                <VStack gap={4}>
                  <Text
                    fontFamily="Orbitron"
                    fontSize={{
                      base: 24,
                      lg: 48,
                    }}
                    fontWeight={400}
                    textAlign="center"
                  >
                    Welcome Explorer
                  </Text>
                  <Flex
                    rowGap={6}
                    columnGap={10}
                    flexDirection={{ base: 'column', lg: 'row' }}
                    alignItems="center"
                  >
                    <Box>
                      <PlanetImage
                        w={planetIconSize}
                        h={planetIconSize}
                        dacId={selectedDacId}
                        key={selectedDacId}
                        titleDisplay="none"
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
                      textAlign={{
                        base: 'center',
                        lg: 'left',
                      }}
                    >
                      In order for you to engage with the {daoDetails.title} Syndicate, you will
                      need to sign the Member Terms.
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
                      onClick={() => handleClose()}
                    >
                      Cancel
                    </Button>

                    <Button
                      size={currentBreakpointButtonSize}
                      isFullWidth
                      width="max-content"
                      variant="primary"
                      onClick={() => {
                        handleClose()
                        handleSubmit()
                      }}
                    >
                      Go To Member Terms
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

export { NotSignedMemberTermsModal }
