import React, { useEffect, useState } from 'react'

import { Button, BUTTON_SIZE, PlaceRing } from '@alien-worlds/uikit'
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
  Divider,
  Container,
  Flex,
  Center,
  useBreakpointValue,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { DAO_DETAILS_QUERY } from 'graphql/queries'
import { DAO_WALLET_DETAILS_QUERY } from 'graphql/queries/daoWalletDetails'
import { Candidate } from 'graphql/types'
import { filter, map } from 'lodash'
import { Colors } from 'shared/util/colors'
import { fallbackAvatarSrc, getDacPlaceRingVariantByPlace, pluralize } from 'shared/util/helpers'
import { useScreenSize } from 'shared/util/hooks'
import { formatNumber } from 'shared/util/numbers'
import { useActions, useAppState } from 'store'
import { RequestState } from 'store/wax/types'

const AnimatedBox = motion(Box)

interface CandidateCardProps {
  candidate: Candidate
}

const SignVoteModal = () => {
  const {
    modal: { setPrimaryModalActive },
    wax: { resetActionProgressState, tryVotingCandidates },
  } = useActions()
  const client = useApolloClient()
  const {
    modal: { primaryModals },
    wax: { selectedDacId, votedCandidatesList, actionProgressState, isDemoUser },
  } = useAppState()

  const handleSubmit = async () => {
    const candidatesToSubmit = filter(votedCandidatesList, (candidate) => {
      return candidate.isVoted || candidate.isVoteAdded
    })

    await tryVotingCandidates({
      dacId: selectedDacId,
      newVotes: map(candidatesToSubmit, 'candidate_name'),
    })

    await client.refetchQueries({ include: [DAO_DETAILS_QUERY, DAO_WALLET_DETAILS_QUERY] })
  }
  const handleClose = () => {
    setPrimaryModalActive({ modalName: 'SignVoteModal', value: false })
  }
  const { isDesktop } = useScreenSize()

  useEffect(() => {
    if (actionProgressState === RequestState.Succeeded) {
      handleClose()
      resetActionProgressState()
    }
  }, [actionProgressState])

  const [candidatesToShow, setCandidatesToShow] = useState<Candidate[]>([])

  useEffect(() => {
    const votesAddedCandidates = filter(votedCandidatesList, (candidate) => candidate.isVoteAdded)
    const votesSignedCandidates = filter(votedCandidatesList, (candidate) => candidate.isVoted)
    // show new votes first, then currently voted and signed, then unvoted if present
    const affectedCandidatesToShow = [...votesAddedCandidates, ...votesSignedCandidates]
    setCandidatesToShow(affectedCandidatesToShow)
  }, [votedCandidatesList])

  const CandidateCard = ({ candidate }: CandidateCardProps) => {
    return (
      <Flex flexDirection="column" flex="0 0 300px" gap={5} minW={300}>
        <VStack alignItems="center">
          <Text
            fontFamily="Orbitron"
            textAlign="left"
            fontSize={23}
            color={Colors.SNOW_WHITE}
            mb="-10px"
          >
            {candidate.flagged ? 'flagged' : candidate.profile.givenName}
          </Text>
          <Text fontFamily="tlm" textAlign="left" fontSize={20} color={Colors.DI_SERRIA}>
            {candidate.candidate_name}
          </Text>
        </VStack>
        <Box justifyContent="center" display="flex" mt="-30px">
          <PlaceRing
            radius={10}
            isOrnament
            fallbackSrc={fallbackAvatarSrc}
            rankText={(candidate.rankIndex + 1).toString()}
            variant={getDacPlaceRingVariantByPlace(candidate.rankIndex + 1)}
            src={candidate.flagged ? fallbackAvatarSrc : candidate.profile.image}
          />
        </Box>

        <Grid gridTemplateColumns="50% 50%" width="100%">
          <GridItem justifyContent="flex-start">
            <VStack gap={0}>
              <Text fontFamily="Titillium Web" fontSize={17} color={Colors.GRAY_CHATEAU}>
                Total Votes
              </Text>
              <Text
                fontFamily="Orbitron"
                fontSize={28}
                color={Colors.SNOW_WHITE}
                style={{ marginTop: 0 }}
              >
                {candidate.number_voters || 0}
              </Text>
            </VStack>
          </GridItem>
          <GridItem justifyContent="flex-end">
            <VStack>
              <Text fontFamily="Titillium Web" fontSize={17} color={Colors.GRAY_CHATEAU}>
                Vote Decay
              </Text>
              <Text
                fontFamily="Orbitron"
                fontSize={28}
                color={Colors.CORN}
                style={{ marginTop: 0 }}
              >
                {candidate.voteDecay}
                <span
                  style={{
                    fontSize: 17,
                    fontWeight: 700,
                    fontFamily: 'Titillium Web',
                    position: 'relative',
                    top: -8,
                  }}
                >
                  {pluralize(candidate.voteDecay, 'Day')}
                </span>
              </Text>
            </VStack>
          </GridItem>
        </Grid>
        <VStack justifySelf="baseline">
          <Text fontFamily="Titillium Web" fontSize={17} color={Colors.GRAY_CHATEAU}>
            Voting Power
          </Text>
          <Text
            fontFamily="Orbitron"
            fontSize={28}
            color={Colors.CARIBBEAN_GREEN}
            style={{ marginTop: 0 }}
          >
            {formatNumber(candidate.total_vote_power, 0, 0)}
          </Text>
        </VStack>
      </Flex>
    )
  }
  const currentBreakpointButtonSize: keyof typeof BUTTON_SIZE = useBreakpointValue({
    base: 'sm',
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'lg',
    '2xl': 'lg',
  })
  if (selectedDacId)
    return (
      <Modal size="full" isOpen={primaryModals.SignVoteModal} onClose={() => handleClose()}>
        <ModalContent background={Colors.BLACK_SOLID_90}>
          <ModalCloseButton
            marginTop={{ base: 0, lg: 10 }}
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
              {candidatesToShow && candidatesToShow.length > 0 && (
                <Container
                  h={{ base: 'auto', lg: '95vh' }}
                  alignItems="center"
                  display="flex"
                  justifyContent="center"
                  maxW="100%"
                  paddingY={{ base: '50px', lg: 0 }}
                >
                  <VStack gap={6}>
                    <Text
                      fontFamily="Orbitron"
                      fontSize={{
                        base: 24,
                        lg: 48,
                      }}
                      maxW="510px"
                      textAlign="center"
                      fontWeight={400}
                    >
                      Ready to put your vote in?
                    </Text>
                    <Flex
                      flexDirection={{ base: 'column', lg: 'row' }}
                      gap={5}
                      alignItems="stretch"
                      justifyContent="space-around"
                    >
                      {/* Show only the first 2, follows prev implementation */}
                      <CandidateCard candidate={candidatesToShow[0]} />
                      {candidatesToShow.length > 1 && (
                        <Divider
                          orientation={isDesktop ? 'vertical' : 'horizontal'}
                          background={Colors.DOVE_GRAY}
                          height="auto"
                        />
                      )}
                      {candidatesToShow.length > 1 && (
                        <CandidateCard candidate={candidatesToShow[1]} />
                      )}
                    </Flex>

                    <Center>
                      <Text
                        fontFamily="Titillium Web"
                        fontSize={20}
                        color={Colors.SNOW_WHITE}
                        textAlign="center"
                      >
                        {candidatesToShow.length === 2
                          ? 'Your Vote Power will influence these Candidates, equally.'
                          : 'Your Vote Power will only influence this Candidate.'}
                      </Text>
                    </Center>
                    <Flex
                      flexDirection={{ base: 'column-reverse', md: 'row' }}
                      gap={{
                        base: 5,
                        md: 4,
                      }}
                      justifyItems="center"
                      justifyContent="center"
                      w="full"
                    >
                      <Button
                        isDisabled={actionProgressState === RequestState.InProgress}
                        size={currentBreakpointButtonSize}
                        variant="info"
                        onClick={() => handleClose()}
                      >
                        Cancel
                      </Button>

                      <Button
                        isDisabled={actionProgressState === RequestState.InProgress}
                        size={currentBreakpointButtonSize}
                        variant="warning"
                        onClick={() => {
                          if (isDemoUser) {
                            handleClose()
                            setPrimaryModalActive({ modalName: 'LoginModal', value: true })
                          } else {
                            handleClose()
                            handleSubmit()
                          }
                        }}
                      >
                        Yes, Vote
                      </Button>
                    </Flex>
                  </VStack>
                </Container>
              )}
              {((candidatesToShow && candidatesToShow.length === 0) || !candidatesToShow) && (
                <Box>
                  <Text fontFamily="tlm" fontSize={24} fontWeight={600} color={Colors.RADICAL_RED}>
                    Something went wrong!
                  </Text>
                </Box>
              )}
            </AnimatedBox>
          </ModalBody>
        </ModalContent>
      </Modal>
    )
  return null
}

export { SignVoteModal }
