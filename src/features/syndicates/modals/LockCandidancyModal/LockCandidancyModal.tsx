import { CandiateIcon } from '@alien-worlds/icons'
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
  Link,
  useBreakpointValue,
  Flex,
} from '@chakra-ui/react'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner'
import { motion } from 'framer-motion'
import { useDaoDetails } from 'graphql/hooks/useDaoDetails'
import { useDaoGlobals } from 'graphql/hooks/useDaoGlobals'
import { useWalletDaoDetails } from 'graphql/hooks/useWalletDaoDetails'
import { DAO_DETAILS_QUERY } from 'graphql/queries'
import { DaoDetailsResponse, DaoGlobalsResponse, DaoWalletDetailsResponse } from 'graphql/types'
import { capitalize } from 'lodash'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'
import { convertPlanetIdToName } from 'shared/util/helpers'
import { useActions, useAppState } from 'store'

const AnimatedBox = motion(Box)

const LockCandidancyModal = () => {
  const {
    wax: { selectedDacId, dacCandidacyProposalPayload, walletId },
    modal: { primaryModals },
  } = useAppState()
  const {
    daoDetails,
    loading: loadingDaoDetails,
  }: { daoDetails: DaoDetailsResponse; loading: boolean } = useDaoDetails(selectedDacId)
  const client = useApolloClient()
  const {
    daoGlobals,
    loading: loadingDaoGlobals,
  }: { daoGlobals: DaoGlobalsResponse; loading: boolean } = useDaoGlobals(selectedDacId)
  const { walletDaoDetails }: { walletDaoDetails: DaoWalletDetailsResponse; loading: boolean } =
    useWalletDaoDetails({
      dacId: selectedDacId,
      walletId,
    })

  const {
    wax: { registerNewCandidate },
    modal: { setPrimaryModalActive },
  } = useActions()

  const handleClose = () => {
    setPrimaryModalActive({ modalName: 'LockCandidancyModal', value: false })
  }
  const handleSubmit = async () => {
    await registerNewCandidate({
      candidacyProposal: dacCandidacyProposalPayload,
      selectedDac: daoDetails,
      daoGlobals,
      daoWalletDetails: walletDaoDetails,
    })
    await client.refetchQueries({ include: [DAO_DETAILS_QUERY] })
  }
  const iconSize = useBreakpointValue({
    base: '70px',
    md: '100px',
    lg: '133px',
  })
  const currentBreakpointButtonSize: keyof typeof BUTTON_SIZE = useBreakpointValue({
    base: 'sm',
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'lg',
    '2xl': 'lg',
  })

  if (loadingDaoDetails || loadingDaoGlobals) return <LoadingSpinner />
  const lockupAsset = daoGlobals.lockupasset.quantity
  return (
    <Modal size="full" isOpen={primaryModals.LockCandidancyModal} onClose={() => handleClose()}>
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
            <Flex
              alignItems="center"
              justifyContent="center"
              paddingTop={{ base: '100px', lg: '10%' }}
            >
              <Box>
                <VStack gap={8}>
                  <Box
                    borderRadius="100%"
                    borderWidth={{ base: 5, md: 8 }}
                    borderColor={Colors.SNOW_WHITE}
                    padding={{ base: 3, md: 6 }}
                  >
                    <CandiateIcon
                      style={{ width: iconSize, height: iconSize, marginRight: 2, marginTop: 10 }}
                    />
                  </Box>

                  <Text
                    fontFamily="Titillium Web"
                    fontSize={{
                      base: 24,
                      lg: 48,
                    }}
                    fontWeight={400}
                  >
                    Stake Candidacy
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
                    To finalize your Candidate Registration, it is required to have staked
                    <span
                      style={{
                        fontFamily: 'Orbitron',
                        fontSize: '20px',
                        fontWeight: 400,
                        color: Colors.RADICAL_RED,

                        position: 'relative',
                        top: '3px',
                      }}
                    >
                      {' '}
                      {lockupAsset}
                    </span>{' '}
                    TLM in {capitalize(convertPlanetIdToName(selectedDacId))} as Vote Power.
                  </Text>

                  <Text whiteSpace="pre-line" fontSize={12} maxW={422}>
                    IMPORTANT NOTICE{'\n'}
                    By executing this action, you confirm that you have fully acknowledged and
                    understood the Council Candidate Notice, as available under the following link,
                    and you accept the terms and conditions set out therein as fully binding upon
                    and opposable to you:{' '}
                    <Link
                      href={`${config.IpfsApiUrl}/${config.DaoCandidacyTermsIpfs}`}
                      target="_blank"
                      textDecoration="underline"
                    >
                      Terms and Conditions
                    </Link>
                    {'\n'}
                    If for any reason the foregoing link is inoperable and/or does not lead you to
                    the Council Candidate Notice, or if you do not fully consent to be bound by the
                    Council Candidate Notice, PLEASE REFRAIN FROM EXECUTING THIS ACTION and, if
                    necessary, please contact our support department under{' '}
                    <Link href={config.SupportAlienUrl} target="_blank" textDecoration="underline">
                      Support
                    </Link>
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
                      variant="primary"
                      onClick={() => {
                        handleSubmit()
                        handleClose()
                      }}
                    >
                      Yes, Become Candidate
                    </Button>
                  </Flex>
                </VStack>
              </Box>
            </Flex>
          </AnimatedBox>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export { LockCandidancyModal }
