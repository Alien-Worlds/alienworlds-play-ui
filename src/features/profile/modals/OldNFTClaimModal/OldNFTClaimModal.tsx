import React, { useEffect, useState, useCallback, useMemo } from 'react'

import { ShardsIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Flex,
  Text,
  ModalOverlay,
  HStack,
  chakra,
} from '@chakra-ui/react'
import outpostNFTPointsMappings from 'assets/data/outpostNFTPointsMappings.json'
import { map, replace, toNumber } from 'lodash'
import { Colors } from 'shared/util/colors'
import { formatUserPointsWithDecimal } from 'shared/util/helpers'
import { useActions, useAppState } from 'store'
import { OutpostNFTPointsClaim } from 'store/wax/types'

const OldNFTClaimModal = React.memo(() => {
  const {
    wax: { nftsToClaimTemplates },
    modal: { secondaryModals },
  } = useAppState()

  const {
    wax: { claimNftPts },
    modal: { setSecondaryModalActive },
  } = useActions()

  const [totalPoints, setTotalPoints] = useState('')

  const handleClose = useCallback(() => {
    setSecondaryModalActive({ modalName: 'OldNFTClaimModal', value: false })
  }, [setSecondaryModalActive])

  const handleSubmit = useCallback(() => {
    claimNftPts()
    setSecondaryModalActive({ modalName: 'OldNFTClaimModal', value: false })
  }, [claimNftPts, setSecondaryModalActive])

  useEffect(() => {
    let total: number = 0
    map(outpostNFTPointsMappings, (mapping: OutpostNFTPointsClaim) => {
      for (let i = 0; i < nftsToClaimTemplates.length; i += 1) {
        if (toNumber(nftsToClaimTemplates[i]) === toNumber(mapping.templateId)) {
          total += toNumber(replace(mapping.points10x, ',', ''))
        }
      }
    })
    setTotalPoints(formatUserPointsWithDecimal(total * 1.3))
  }, [nftsToClaimTemplates])

  return useMemo(() => {
    return (
      <Modal size="xl" isOpen={secondaryModals.OldNFTClaimModal} isCentered onClose={handleClose}>
        <ModalOverlay bg={Colors.BLACK_ALPHA_40} backdropFilter="blur(10px) " />
        <ModalContent
          border={`3px solid ${Colors.DI_SERRIA}`}
          bg={Colors.OUTPOST_CLAIMNFTS_BG_GRADIENT}
        >
          <ModalCloseButton
            zIndex={2000}
            size="lg"
            mt={{ base: 0, md: '-50px' }}
            mr={{ base: 0, md: '-50px' }}
          />
          <ModalBody>
            <Flex
              padding={12}
              justifyItems="center"
              alignItems="center"
              alignContent="center"
              justifyContent="center"
              textAlign="center"
              direction="column"
              gap={4}
              maxW="100%"
            >
              <Text fontFamily="orb" fontSize="48" color={Colors.SNOW_WHITE}>
                Hello Explorer!
              </Text>
              <HStack gap={4}>
                <ShardsIcon boxSize="42px" color={Colors.DI_SERRIA} />
                <Flex gap={0} direction="column" justifyContent="center" alignItems="center">
                  <Text color={Colors.DI_SERRIA} fontSize="18px" fontWeight="bold">
                    Shards
                  </Text>
                  <Text fontSize="30px" fontFamily="orb">
                    {totalPoints}
                  </Text>
                </Flex>
              </HStack>
              <Text fontSize="18px">
                You have{' '}
                <chakra.span style={{ color: Colors.DI_SERRIA, fontWeight: 'bold' }}>
                  {nftsToClaimTemplates.length} NFT claims
                </chakra.span>{' '}
                that are no longer available. Convert them to
                <chakra.span style={{ color: Colors.DI_SERRIA, fontWeight: 'bold' }}>
                  {' '}
                  {totalPoints} Shards
                </chakra.span>{' '}
                to be used <br /> in the NFT Outpost.
              </Text>
              <Text fontSize="18px">
                Sorry for the inconvenience, we have added a <br />
                <chakra.span style={{ color: Colors.DI_SERRIA, fontWeight: 'bold' }}>
                  30% Bonus
                </chakra.span>{' '}
                to the converted Shards.
              </Text>
              <Button fontSize={20} variant="primary" size="lg" isFullWidth onClick={handleSubmit}>
                Get Shards
              </Button>
            </Flex>
          </ModalBody>
        </ModalContent>
      </Modal>
    )

    return null
  }, [secondaryModals, handleClose, totalPoints, nftsToClaimTemplates.length, handleSubmit])
})

export { OldNFTClaimModal }
