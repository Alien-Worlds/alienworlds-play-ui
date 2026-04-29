import React, { useEffect, useState } from 'react'

import { Button, BUTTON_SIZE, PlaceRing } from '@alien-worlds/uikit'
import {
  Container,
  Text,
  VStack,
  Modal,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Box,
  Flex,
  useBreakpointValue,
} from '@chakra-ui/react'
import { MemberTermsStatusBadge } from 'features/syndicates/components/MemberTermsStatusBadge/MemberTermsStatusBadge'
import { motion } from 'framer-motion'
import { find } from 'lodash'
import { Colors } from 'shared/util/colors'
import { fallbackAvatarSrc } from 'shared/util/helpers'
import { useActions, useAppState } from 'store'
import { PlanetCandidateType } from 'store/wax/types'

const AnimatedBox = motion(Box)

const WithDrawCandidancyModal = () => {
  const {
    wax: { walletId, selectedDacCandidates, generatedCandidancyProposal },
    modal: { primaryModals },
  } = useAppState()

  const {
    wax: { withdrawCandidate },
    modal: { setPrimaryModalActive },
  } = useActions()

  const [candidate, setCandidate] = useState<PlanetCandidateType>(null)

  const handleClose = () => {
    setPrimaryModalActive({ modalName: 'WithDrawCandidancyModal', value: false })
  }
  const handleSubmit = () => {
    withdrawCandidate(generatedCandidancyProposal)
  }
  useEffect(() => {
    const candidateProfile = find(
      selectedDacCandidates,
      (candidate) => candidate.account === walletId
    )

    if (candidateProfile) {
      setCandidate(candidateProfile)
    }
  }, [walletId, selectedDacCandidates])
  const currentBreakpointButtonSize: keyof typeof BUTTON_SIZE = useBreakpointValue({
    base: 'sm',
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'lg',
    '2xl': 'lg',
  })
  return (
    <Modal size="full" isOpen={primaryModals.WithDrawCandidancyModal} onClose={() => handleClose()}>
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
              maxW="container.xl"
              paddingTop={{ base: '100px', lg: 0 }}
            >
              <VStack gap={6}>
                <MemberTermsStatusBadge
                  isTermsSigned={candidate?.hasSignedCurrentDaoTerms}
                  positionOffset={3}
                >
                  <PlaceRing
                    variant="placeA"
                    src={candidate?.image}
                    radius={8.5}
                    fallbackSrc={fallbackAvatarSrc}
                  />
                </MemberTermsStatusBadge>

                <Text
                  fontFamily="Orbitron"
                  color={Colors.RADICAL_RED}
                  fontSize={{
                    base: 24,
                    lg: 48,
                  }}
                  fontWeight={400}
                >
                  Withdraw Candidacy
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
                  You are about to{' '}
                  <span
                    style={{
                      fontFamily: 'Titillium Web',
                      fontWeight: 400,
                      color: Colors.RADICAL_RED,
                    }}
                  >
                    Withdraw
                  </span>{' '}
                  from the Candidacy Race. Your Votes and Vote Power will remain until your
                  supporters choose to change their vote.
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
                    variant="alert"
                    onClick={() => {
                      handleClose()
                      handleSubmit()
                    }}
                  >
                    Yes, Withdraw my Candidacy
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

export { WithDrawCandidancyModal }
