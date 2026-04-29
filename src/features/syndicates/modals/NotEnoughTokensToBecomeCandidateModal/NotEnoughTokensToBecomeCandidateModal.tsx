import { CandiateIcon } from '@alien-worlds/icons'
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
import { useWalletDaoDetails } from 'graphql/hooks/useWalletDaoDetails'
import { DaoWalletDetailsResponse } from 'graphql/types'
import { capitalize, get, head, replace, split, toNumber } from 'lodash'
import { Colors } from 'shared/util/colors'
import { convertPlanetIdToName } from 'shared/util/helpers'
import { formatNumber } from 'shared/util/numbers'
import { useAppState, useActions } from 'store'

import { Constants } from '../../../../shared/util/constants'

const AnimatedBox = motion(Box)

const NotEnoughTokensToBecomeCandidateModal = () => {
  const {
    wax: { selectedDacId, currentDAOInfo, walletId },
    modal: { secondaryModals },
  } = useAppState()

  const {
    modal: { setSecondaryModalActive, setPrimaryModalActive },
  } = useActions()

  const handleClose = () => {
    setSecondaryModalActive({ modalName: 'NotEnoughTokensToBecomeCandidateModal', value: false })
  }

  const {
    walletDaoDetails,
    loading: walletDaoDetailsLoading,
  }: { walletDaoDetails: DaoWalletDetailsResponse; loading: boolean } = useWalletDaoDetails({
    dacId: selectedDacId,
    walletId,
  })
  const planetStakes = toNumber(
    replace(get(walletDaoDetails, 'stake_details.available_tlm_in_dao', '0'), /[^0-9.-]/g, '')
  )
  const userStakedDAOTokens = toNumber(
    replace(get(walletDaoDetails, 'stake_details.staked_amount', '0'), /[^0-9.-]/g, '')
  )
  const isAmountAvailable =
    planetStakes - Constants.DAC_CANDIDACY_STAKE_AMOUNT + userStakedDAOTokens > 0

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
  const handleSubmit = () => {
    if (isAmountAvailable) {
      if (userStakedDAOTokens > 0) {
        setPrimaryModalActive({ modalName: 'AddStakingVotePower', value: true })
      } else {
        setPrimaryModalActive({ modalName: 'StakingVotePower', value: true })
      }
    } else {
      setPrimaryModalActive({ modalName: 'ConvertPlanataryTokenModal', value: true })
    }
  }
  const lockupAsset = parseFloat(head(split(currentDAOInfo?.lockupAsset, ' ')))
  if (walletDaoDetailsLoading) return <LoadingSpinner />
  return (
    <Modal
      size="full"
      isOpen={secondaryModals.NotEnoughTokensToBecomeCandidateModal}
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
              <VStack gap={8} textAlign="center">
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
                  fontFamily="Orbitron"
                  fontSize={{
                    base: 24,
                    lg: 48,
                  }}
                  fontWeight={400}
                >
                  Do you want to become a Candidate?
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
                  You will need
                  <span
                    style={{
                      fontFamily: 'Orbitron',
                      fontSize: '20px',
                      fontWeight: 400,
                      color: Colors.RADICAL_RED,

                      position: 'relative',
                    }}
                  >
                    {' '}
                    {formatNumber(lockupAsset - userStakedDAOTokens, 4, 4)}{' '}
                  </span>{' '}
                  TLM in {capitalize(convertPlanetIdToName(selectedDacId))} to stake, in order to
                  register your candidacy.
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
}

export { NotEnoughTokensToBecomeCandidateModal }
