import { ArrowCurvedDownIcon, ArrowCurvedUpIcon, TriliumIcon } from '@alien-worlds/icons'
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
  HStack,
  Flex,
  useBreakpointValue,
} from '@chakra-ui/react'
import { PlanetImage } from 'features/mining/components/PlanetLand/Components/PlanetImage'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { motion } from 'framer-motion'
import { useDaoDetails } from 'graphql/hooks/useDaoDetails'
import { DaoDetailsResponse } from 'graphql/types'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'
import { v4 as uuidv4 } from 'uuid'
const AnimatedBox = motion(Box)

const NotEnoughTokensGenericModal = () => {
  const {
    wax: { selectedDacId },
    modal: { secondaryModals },
  } = useAppState()

  const {
    modal: { setSecondaryModalActive },
  } = useActions()

  const handleClose = () => {
    setSecondaryModalActive({ modalName: 'NotEnoughTokensGenericModal', value: false })
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
  const { daoDetails, loading }: { daoDetails: DaoDetailsResponse; loading: boolean } =
    useDaoDetails(selectedDacId)

  if (loading) return <LoadingSpinner />
  if (selectedDacId)
    return (
      <Modal
        size="full"
        isOpen={secondaryModals.NotEnoughTokensGenericModal}
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
                h="calc(100vh)"
                alignItems="center"
                display="flex"
                justifyContent="center"
                maxW="container.xl"
              >
                <VStack gap={4}>
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
                  <Flex
                    rowGap={6}
                    columnGap={2}
                    flexDirection={{ base: 'column', lg: 'row' }}
                    alignItems="center"
                  >
                    <HStack position="relative" marginBottom={{ base: '50px', lg: '0px' }}>
                      <TriliumIcon style={{ width: 82, height: 82, color: Colors.DI_SERRIA }} />
                      <ArrowCurvedUpIcon
                        style={{
                          position: 'absolute',
                          top: 80,
                          height: 48,
                          width: 48,
                        }}
                      />
                      <ArrowCurvedDownIcon
                        style={{
                          position: 'absolute',
                          top: 0,
                          right: 65,
                          height: 48,
                          width: 48,
                        }}
                      />

                      <Box position="relative" left="-35px" top="50px">
                        <PlanetImage
                          w="82px"
                          h="82px"
                          dacId={selectedDacId}
                          key={uuidv4()}
                          titleDisplay="none"
                        />
                      </Box>
                    </HStack>
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
                      paddingTop={{ base: '0px', lg: '50px' }}
                    >
                      In order for you to engage with the {daoDetails.title} Syndicate, you will
                      need to stake your{' '}
                      <span
                        style={{
                          fontFamily: 'Orbitron',
                          fontSize: '20px',
                          fontWeight: 400,
                          color: Colors.DI_SERRIA,
                          position: 'relative',
                          top: '3px',
                        }}
                      >
                        TLM
                      </span>{' '}
                      into {daoDetails.title}.
                    </Text>
                  </Flex>

                  <Flex
                    flexDirection={{ base: 'column-reverse', md: 'row' }}
                    gap={4}
                    justifyItems="center"
                    paddingTop={{ base: '0px', lg: '60px' }}
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
                      variant="primary"
                      onClick={() => {
                        handleSubmit()
                        handleClose()
                      }}
                    >
                      Stake my TLM
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

export { NotEnoughTokensGenericModal }
