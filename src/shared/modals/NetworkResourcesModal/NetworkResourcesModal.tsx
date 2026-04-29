// import { getYeomenText } from 'util/yeomen'

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
  Flex,
  Link,
  useBreakpointValue,
  VStack,
  CircularProgress,
  CircularProgressLabel,
} from '@chakra-ui/react'
import { css, Global } from '@emotion/react'
import { Colors } from 'shared/util/colors'
import { useAppState, useActions } from 'store'

const NetworkResourcesModal = () => {
  const {
    modal: { secondaryModals },
    wax: { resources },
  } = useAppState()

  const {
    modal: { setSecondaryModalActive },
  } = useActions()

  const handleClose = () => {
    setSecondaryModalActive({ modalName: 'NetworkResourcesModal', value: false })
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
  const currentCircularProgressSize = useBreakpointValue({
    base: '75px',
    lg: '100px',
  })
  return (
    <Modal isOpen={secondaryModals.NetworkResourcesModal} onClose={() => handleClose()}>
      <Global
        styles={css`
          #missions-layout,
          #missions-header {
            filter: blur(3px);
          }
        `}
      />
      <ModalOverlay
        backgroundColor="rgba(30,30,30,.9)"
        _after={{
          content: "''",
          display: 'block',
          top: 0,
          left: 0,
          width: 'full',
          height: 'full',
          zIndex: 0,
          background:
            'radial-gradient(ellipse at center, rgba(51,51,51,.8) 0%,rgba(33,33,33,0) 100%)',
        }}
      />
      <ModalContent
        maxWidth={{ base: '90%', md: '70%', xl: '40%' }}
        overflow="hidden"
        letterSpacing="2px"
        background="transparent"
        _after={{
          content: "''",
          width: '100%',
          height: '100%',
          position: 'absolute',
          boxShadow: 'inset 0 0 200px rgb(33 33 33 / 90%)',
          zIndex: 0,
          background: 'linear-gradient(45deg, #120E49 0%,#000000 67%,#000000 67%,#7C153C 100%)',
          filter: 'blur(70px)',
          opacity: 0.9,
        }}
        padding={0}
      >
        <ModalCloseButton top={-10} fontSize={20} right={{ base: 0, md: -10 }} />
        <ModalHeader backgroundColor="transparent" zIndex={1}>
          <Flex flexDirection="row" justifyContent="center" width="100%" pt={8}>
            <Text
              mr="12px"
              color="white"
              fontSize={{ base: 'x-large', lg: 'xx-large' }}
              fontFamily="Orbitron"
            >
              Network
            </Text>
            <Text
              color="#457d93"
              fontSize={{ base: 'x-large', lg: 'xx-large' }}
              fontFamily="Orbitron"
            >
              Resources
            </Text>
          </Flex>
        </ModalHeader>
        <ModalBody
          fontFamily="tlm"
          color={Colors.SNOW_WHITE}
          backgroundColor="transparent"
          zIndex={1}
        >
          <Flex width="100%" justifyContent="center" alignItems="center">
            <VStack maxWidth="100%" gap={4}>
              <Flex gap={4}>
                <Text
                  fontSize={{ base: 'sm', lg: 'md' }}
                  color="white"
                  fontWeight="500"
                  fontFamily="Orbitron"
                >
                  Need resources?
                </Text>
                <Link href="https://wallet.wax.io/" target="_blank" display="inline-flex">
                  <Text
                    textUnderlineOffset="3px"
                    textDecoration="underline"
                    color="white"
                    fontWeight="500"
                    fontSize={{ base: 'sm', lg: 'md' }}
                    fontFamily="Orbitron"
                  >
                    Buy and stake&#160;
                  </Text>
                  <Text
                    textUnderlineOffset="3px"
                    textDecoration="underline"
                    color="#d9a555"
                    fontWeight="500"
                    fontSize={{ base: 'sm', lg: 'md' }}
                    fontFamily="Orbitron"
                  >
                    WAXP
                  </Text>
                </Link>
              </Flex>
              <Flex width="100%" textAlign="center" alignItems="center">
                <Text color="white" fontWeight="500" fontSize="small" fontFamily="Orbitron">
                  Stake CPU and NET to vote and earn rewards. RAM is used for storing data on the
                  blockchain.
                </Text>
              </Flex>

              <Flex display="inline-flex" width="100%" justifyContent="center">
                <VStack width="33%">
                  <CircularProgress
                    value={Math.round(resources.percCPU)}
                    color="#0ed4a8"
                    thickness="15px"
                    size={currentCircularProgressSize}
                    trackColor="#0ed4a81a"
                  >
                    <CircularProgressLabel>
                      {Math.round(resources.percCPU) > 1 ? Math.round(resources.percCPU) : '<1'}%
                    </CircularProgressLabel>
                  </CircularProgress>
                  <VStack>
                    <Text color="white" fontWeight="600" fontSize="x-large" fontFamily="Orbitron">
                      CPU
                    </Text>
                    <VStack>
                      <Text color="white" fontWeight="400" fontSize="x-small" fontFamily="Orbitron">
                        {resources.usedCPU && (resources.usedCPU / 1000).toFixed(2)
                          ? (resources.usedCPU / 1000).toFixed(2)
                          : 0}{' '}
                        ms /{' '}
                        {resources.totalCPU && (resources.totalCPU / 1000).toFixed(2)
                          ? (resources.totalCPU / 1000).toFixed(2)
                          : 0}{' '}
                        ms
                      </Text>
                      <Text color="white" fontWeight="600" fontSize="small" fontFamily="Orbitron">
                        Total Staked:
                      </Text>
                      <Text color="white" fontWeight="400" fontSize="small" fontFamily="Orbitron">
                        {resources.stakedCPU && resources.stakedCPU.toFixed(3)
                          ? resources.stakedCPU.toFixed(3)
                          : 0}{' '}
                        WAX
                      </Text>
                    </VStack>
                  </VStack>
                </VStack>

                <VStack width="33%">
                  <CircularProgress
                    value={Math.round(resources.percNET)}
                    color="#d9a555"
                    thickness="15px"
                    size={currentCircularProgressSize}
                    trackColor="#d9a5551a"
                  >
                    <CircularProgressLabel>
                      {Math.round(resources.percNET) > 1 ? Math.round(resources.percNET) : '<1'}%
                    </CircularProgressLabel>
                  </CircularProgress>
                  <VStack>
                    <Text color="white" fontWeight="600" fontSize="x-large" fontFamily="Orbitron">
                      NET
                    </Text>
                    <VStack>
                      <Text color="white" fontWeight="400" fontSize="x-small" fontFamily="Orbitron">
                        {resources.usedNET && (resources.usedNET / 1000).toFixed(1)
                          ? (resources.usedNET / 1000).toFixed(1)
                          : 0}{' '}
                        KB /{' '}
                        {resources.totalNET && resources.totalNET / 1000000
                          ? (resources.totalNET / 1000000).toFixed(1)
                          : 0}{' '}
                        MB
                      </Text>
                      <Text color="white" fontWeight="600" fontSize="small" fontFamily="Orbitron">
                        Total Staked:
                      </Text>
                      <Text color="white" fontWeight="400" fontSize="small" fontFamily="Orbitron">
                        {resources.stakedNET && resources.stakedNET.toFixed(3)
                          ? resources.stakedNET.toFixed(3)
                          : 0}{' '}
                        WAX
                      </Text>
                    </VStack>
                  </VStack>
                </VStack>

                <VStack width="33%">
                  <CircularProgress
                    value={Math.round(resources.percRAM)}
                    color="#ff3b52"
                    thickness="15px"
                    size={currentCircularProgressSize}
                    trackColor="#ff3b521a"
                  >
                    <CircularProgressLabel>
                      {Math.round(resources.percRAM) > 1 ? Math.round(resources.percRAM) : '<1'}%
                    </CircularProgressLabel>
                  </CircularProgress>
                  <VStack>
                    <Text color="white" fontWeight="600" fontSize="x-large" fontFamily="Orbitron">
                      RAM
                    </Text>
                    <VStack>
                      <Text color="white" fontWeight="400" fontSize="x-small" fontFamily="Orbitron">
                        {resources.usedRAM && resources.usedRAM.toFixed(1)
                          ? (resources.usedRAM / 1000).toFixed(1)
                          : 0}{' '}
                        KB /{' '}
                        {resources.totalRAM && Math.trunc(resources.totalRAM)
                          ? Math.trunc(resources.totalRAM / 1000)
                          : 0}{' '}
                        KB
                      </Text>
                    </VStack>
                  </VStack>
                </VStack>
              </Flex>

              {/* <Flex width="100%" justifyContent="center">
                <Box textAlign="center">
                  <Text
                    fontWeight={400}
                    fontSize={16}
                    color="#dadada"
                    fontFamily="Orbitron"
                    marginTop="20px"
                  >
                    {getYeomenText()}
                  </Text>
                </Box>
              </Flex> */}
              <Flex
                width="100%"
                textAlign="justify"
                justifyContent="center"
                alignContent="center"
                p="20px"
                pt={0}
              >
                <Text
                  color="white"
                  fontWeight="500"
                  fontSize="small"
                  fontFamily="Orbitron"
                  justifyContent="center"
                  flexWrap="wrap"
                >
                  * CPU, NET and RAM are required to perform certain functions on the WAX
                  Blockchain. If you need these resources, you can stake your WAXP Tokens to receive
                  them. Please note there is a 72 hour unstaking period.
                </Text>
              </Flex>
            </VStack>
          </Flex>
        </ModalBody>
        <ModalFooter justifyContent="center" backgroundColor="transparent" zIndex={1} pb={8}>
          <Flex direction="column" gap={4} width={{ base: 'full', md: '60%' }}>
            <Button variant="negative" onClick={() => handleConfirm()} size={currentButtonSize}>
              Close
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export { NetworkResourcesModal }
