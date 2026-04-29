import { CanceledIcon, CheckIcon2, ProposalsIcon } from '@alien-worlds/icons'
import { Button, BUTTON_SIZE } from '@alien-worlds/uikit'
import { useApolloClient } from '@apollo/client'
import {
  Text,
  VStack,
  Modal,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Box,
  Grid,
  GridItem,
  HStack,
  Icon,
  useBreakpointValue,
  Flex,
} from '@chakra-ui/react'
import { ProposalStateButton } from 'features/syndicates/utils/GovernanceHelper'
import { motion } from 'framer-motion'
import { MSIGS_QUERY } from 'graphql/queries/msigs'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'

const AnimatedBox = motion(Box)

const CancelProposalModal = () => {
  const {
    wax: { selectedDacId, dacCustodianProposalPayload, walletId },
    modal: { primaryModals },
  } = useAppState()
  const {
    wax: { tryCancelProposal },
    modal: { setPrimaryModalActive },
  } = useActions()
  const client = useApolloClient()
  const handleClose = () => {
    setPrimaryModalActive({ modalName: 'CancelProposalModal', value: false })
  }
  const handleSubmit = async () => {
    await tryCancelProposal({
      canceler: walletId,
      dac_id: selectedDacId,
      proposal_name: dacCustodianProposalPayload.proposalTitle,
    })

    await client.refetchQueries({ include: [MSIGS_QUERY] })
  }

  const iconSize = useBreakpointValue({
    base: '20px',
    sm: '20px',
    md: '20px',
    lg: '33px',
    xl: '33px',
    '2xl': '33px',
  })

  const iconContainerSize = useBreakpointValue({
    base: '30px',
    sm: '30px',
    md: '30px',
    lg: '48px',
    xl: '48px',
    '2xl': '48px',
  })
  const currentBreakpointButtonSize: keyof typeof BUTTON_SIZE = useBreakpointValue({
    base: 'sm',
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'lg',
    '2xl': 'lg',
  })

  if (!primaryModals.CancelProposalModal) return null

  if (selectedDacId && dacCustodianProposalPayload)
    return (
      <Modal size="full" isOpen={primaryModals.CancelProposalModal} onClose={() => handleClose()}>
        <ModalContent background={Colors.BLACK_SOLID_90}>
          <ModalCloseButton
            marginTop={{ base: 0, lg: 90 }}
            marginRight={{ base: 0, lg: 10 }}
            zIndex={2000}
          />
          <ModalBody>
            <AnimatedBox
              initial={{ opacity: 0, y: -255 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: 0.1,
                ease: [0, 0.71, 0.2, 1.01],
              }}
            >
              <Box display="flex" paddingY={{ base: 10, lg: 90 }}>
                <VStack width="100%" gap={{ base: 4, lg: 6 }}>
                  <Flex flexDirection="column">
                    <Flex
                      flexDirection={{ base: 'column', lg: 'row' }}
                      gap={{ base: 4, lg: 6 }}
                      alignItems="center"
                    >
                      <Box
                        borderRadius="100%"
                        backgroundColor={Colors.RADICAL_RED}
                        style={{
                          width: iconContainerSize,
                          height: iconContainerSize,
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}
                      >
                        <ProposalsIcon style={{ width: iconSize, height: iconSize }} />
                      </Box>
                      <Text
                        fontFamily="Orbitron"
                        color={Colors.SNOW_WHITE}
                        fontSize={{
                          base: 24,
                          lg: 48,
                        }}
                        fontWeight={400}
                      >
                        Cancel Proposal
                      </Text>
                    </Flex>
                    <Box>
                      <Text
                        fontFamily="Titillium Web "
                        fontWeight={600}
                        fontSize={{
                          base: 16,
                          lg: 20,
                        }}
                        textAlign="center"
                        color={Colors.OSLO_GRAY}
                      >
                        unique TX(?) {dacCustodianProposalPayload.uniqueID}
                      </Text>
                    </Box>
                  </Flex>

                  <Grid
                    gridTemplateColumns={['100% ', '100% ', '100% ', '100%', '50% 50%', '50% 50%']}
                    width={['100%', '100%', '100%', '50%', '50%']}
                    gap={4}
                    marginTop={{
                      base: 4,
                      lg: 24,
                    }}
                  >
                    <GridItem
                      justifySelf={[
                        'flex-start',
                        'flex-start',
                        'flex-start',
                        'flex-start',
                        'center',
                        'center',
                      ]}
                    >
                      <Text
                        fontFamily="Titillium Web"
                        fontSize={{
                          base: 20,
                          lg: 24,
                        }}
                        fontWeight={400}
                      >
                        {dacCustodianProposalPayload.proposalTitle}
                      </Text>
                      <HStack>
                        <Text
                          fontFamily="Titillium Web"
                          fontSize={{
                            base: 16,
                            lg: 20,
                          }}
                          fontWeight={700}
                          color={Colors.ENERGY_YELLOW}
                        >
                          {dacCustodianProposalPayload.statusCount}
                        </Text>
                        <CheckIcon2
                          style={{ width: 26, height: 26 }}
                          color={Colors.ENERGY_YELLOW}
                        />
                        <ProposalStateButton
                          proposalStatus={dacCustodianProposalPayload.proposalStatus}
                        />
                      </HStack>
                      <Box display="flex" style={{ marginTop: 20 }}>
                        <Text
                          fontFamily="tlm"
                          fontSize={{
                            base: 12,
                            lg: 16,
                          }}
                          fontWeight={600}
                          color={Colors.LOBLOLLY}
                        >
                          From
                        </Text>
                      </Box>
                      <Box display="flex">
                        <Text
                          fontFamily="tlm"
                          fontSize={{
                            base: 16,
                            lg: 20,
                          }}
                          fontWeight={700}
                          color={Colors.DI_SERRIA}
                        >
                          {dacCustodianProposalPayload.from}
                        </Text>
                      </Box>
                      <Box display="flex" style={{ marginTop: 20 }}>
                        <Text
                          fontFamily="tlm"
                          fontSize={{
                            base: 12,
                            lg: 16,
                          }}
                          fontWeight={600}
                          color={Colors.LOBLOLLY}
                        >
                          To
                        </Text>
                      </Box>
                      <Box display="flex">
                        <Text
                          fontFamily="tlm"
                          fontSize={{
                            base: 16,
                            lg: 20,
                          }}
                          fontWeight={700}
                          color={Colors.DI_SERRIA}
                        >
                          {dacCustodianProposalPayload.to}
                        </Text>
                      </Box>
                      <Box display="flex" style={{ marginTop: 20 }}>
                        <Text
                          fontFamily="tlm"
                          fontSize={{
                            base: 12,
                            lg: 16,
                          }}
                          fontWeight={600}
                          color={Colors.LOBLOLLY}
                        >
                          Item
                        </Text>
                      </Box>
                      <Box display="flex">
                        <Text
                          fontFamily="tlm"
                          fontSize={{
                            base: 16,
                            lg: 20,
                          }}
                          fontWeight={700}
                          color={Colors.SNOW_WHITE}
                        >
                          {dacCustodianProposalPayload.item}
                        </Text>
                      </Box>
                    </GridItem>

                    <GridItem>
                      <Text
                        fontFamily="Titillium Web"
                        fontSize={{
                          base: 12,
                          lg: 16,
                        }}
                        fontWeight={600}
                        color={Colors.GRAY_CHATEAU}
                      >
                        Description
                      </Text>
                      <Text
                        fontFamily="Titillium Web"
                        fontSize={{
                          base: 14,
                          lg: 18,
                        }}
                        fontWeight={400}
                        color={Colors.SNOW_WHITE}
                      >
                        {dacCustodianProposalPayload.description}
                      </Text>
                      <Box style={{ marginTop: 20 }}>
                        <Text
                          fontFamily="Titillium Web"
                          fontSize={{
                            base: 14,
                            lg: 16,
                          }}
                          fontWeight={600}
                          color={Colors.GRAY_CHATEAU}
                        >
                          Memo
                        </Text>
                        <Text
                          fontFamily="Titillium Web"
                          fontSize={{
                            base: 14,
                            lg: 18,
                          }}
                          fontWeight={400}
                          color={Colors.SNOW_WHITE}
                        >
                          {dacCustodianProposalPayload.memo}
                        </Text>
                      </Box>
                    </GridItem>
                  </Grid>

                  <Flex
                    flexDirection={{ base: 'column-reverse', md: 'row' }}
                    gap={4}
                    justifyItems="center"
                    justifyContent="center"
                    width="100%"
                    mt={4}
                  >
                    <Button
                      size={currentBreakpointButtonSize}
                      variant="info"
                      onClick={() => handleClose()}
                    >
                      Return
                    </Button>
                    <Button
                      size={currentBreakpointButtonSize}
                      variant="alert"
                      leftIcon={<Icon as={CanceledIcon} />}
                      onClick={() => {
                        handleClose()
                        handleSubmit()
                      }}
                    >
                      Cancel Proposal
                    </Button>
                  </Flex>
                </VStack>
              </Box>
            </AnimatedBox>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  return null
}

export { CancelProposalModal }
