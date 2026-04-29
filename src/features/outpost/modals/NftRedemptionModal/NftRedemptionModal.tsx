import { FC } from 'react'

import { ShardsIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import {
  Box,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalOverlay,
  Text,
} from '@chakra-ui/react'
import { NftRedemptionModalProps } from 'features/outpost/types/nftOutpostTypes'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { useWalletDetails } from 'graphql/hooks/useWalletDetails'
import { WalletDetailsResponse } from 'graphql/types'
import { get } from 'lodash'
import { Colors } from 'shared/util/colors'
import { formatUserPointsWithDecimal } from 'shared/util/helpers'
import { useActions, useAppState } from 'store'

const NftRedemptionModal: FC<NftRedemptionModalProps> = ({
  isOpen,
  pointsRequired,
  nftCardModal,
  onClose,
  redeemAction,
}) => {
  const {
    modal: { setPrimaryModalActive },
  } = useActions()
  const {
    wax: { isDemoUser, walletId },
  } = useAppState()

  const { walletDetails, loading }: { walletDetails: WalletDetailsResponse; loading: boolean } =
    useWalletDetails(walletId)

  if (loading) {
    return <LoadingSpinner />
  }
  const isRedeemAvailable =
    get(walletDetails, 'userpoints_details.redeemable_points', 0) - pointsRequired >= 0
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <ModalOverlay />
      <ModalContent position="relative" bg={Colors.BLACK_SOLID_95}>
        <ModalCloseButton
          onClick={() => {
            onClose()
          }}
          zIndex={2000}
        />
        <ModalBody alignSelf="center" pt="10%" pb="15%">
          <Flex direction="column" w="fit-content" gap="25px">
            <Flex
              w="full"
              gap="50px"
              align="center"
              justify="center"
              direction={{ base: 'column', lg: 'row' }}
            >
              <Box>{nftCardModal}</Box>

              <Flex align="center" justify="center" direction="column" gap={4}>
                <Flex direction="column" align="center" justify="center">
                  <Box>
                    <ShardsIcon boxSize={50} color={Colors.MAIN_YELLOW} />
                  </Box>
                  <Text
                    color={Colors.MAIN_YELLOW}
                    fontWeight="semibold"
                    fontSize={14}
                    whiteSpace="nowrap"
                  >
                    Your Current Shards
                  </Text>
                  {/* YOUR SHARDS */}
                  <Flex flexDirection="column" alignItems="flex-start" ml={4}>
                    <Text fontSize="2xl" fontFamily="orb">
                      {formatUserPointsWithDecimal(
                        get(walletDetails, 'userpoints_details.redeemable_points', 0)
                      )}
                    </Text>
                  </Flex>
                </Flex>

                {/* SHARDS NEEDED */}
                <Flex alignItems="center" flexDirection="column">
                  <ShardsIcon color={Colors.SECONDARY_GREEN} boxSize={50} />
                  <Flex flexDirection="column" alignItems="flex-start" ml={4}>
                    <Text
                      color={Colors.SECONDARY_GREEN}
                      fontWeight="semibold"
                      fontSize={14}
                      whiteSpace="nowrap"
                    >
                      Shards Needed
                    </Text>
                  </Flex>
                  <Text fontSize="2xl" fontFamily="orb">
                    {formatUserPointsWithDecimal(pointsRequired)}
                  </Text>
                </Flex>

                {/* SHARDS AFTER FUSION */}
                <Flex flexDirection="column" alignItems="center">
                  <ShardsIcon color={Colors.RADICAL_RED} boxSize={50} />

                  <Text
                    color={Colors.SECONDARY_RED}
                    fontWeight="semibold"
                    fontSize={14}
                    whiteSpace="nowrap"
                  >
                    Shards after Fusion
                  </Text>
                  <Text fontSize="2xl" fontFamily="orb">
                    {formatUserPointsWithDecimal(
                      get(walletDetails, 'userpoints_details.redeemable_points', 0) - pointsRequired
                    )}
                  </Text>
                </Flex>
              </Flex>
            </Flex>
            <Button
              size="lg"
              fontSize={20}
              marginBlock={8}
              variant="negative"
              onClick={() => {
                if (isDemoUser) {
                  setPrimaryModalActive({ modalName: 'LoginModal', value: true })
                } else {
                  redeemAction()
                }
              }}
              disabled={!isRedeemAvailable}
            >
              {isRedeemAvailable ? 'Fuse Shards' : 'Need more Shards'}
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export { NftRedemptionModal }
