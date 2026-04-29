import { FC } from 'react'

import { Button } from '@alien-worlds/uikit'
import {
  Box,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  Text,
  Image,
} from '@chakra-ui/react'
import { NftZoomModalProps } from 'features/outpost/types/nftOutpostTypes'
import { motion } from 'framer-motion'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'
import { formatUserPointsWithDecimal } from 'shared/util/helpers'
import { useAppState } from 'store'

const AnimatedBox = motion(Box)

const NftZoomModal: FC<NftZoomModalProps> = ({
  isOpen,
  pointsRequired,
  userPointsRequired,
  onClose,
  redeemAction,
  src,
  hideSubtitle,
}) => {
  const {
    wax: { isDemoUser },
  } = useAppState()
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" preserveScrollBarGap>
      <ModalContent position="relative" bg={Colors.BLACK_SOLID_95}>
        <ModalBody alignSelf="center" justifyContent="center" alignItems="center" display="flex">
          <Flex direction="column" w="fit-content" alignItems="flex-end">
            <ModalCloseButton
              size="lg"
              mr="-30px"
              zIndex={2000}
              position="initial"
              onClick={() => onClose()}
            />
            <Image maxH="65vh" src={`${config.IpfsApiUrl}/${src}`} />
            {!hideSubtitle && (
              <AnimatedBox
                width="100%"
                initial={{ y: -50, opacity: 0 }}
                animate={{
                  y: 0,
                  opacity: 1,
                  transition: {
                    duration: 0.3,
                    delay: 0.1,
                  },
                }}
                exit={{ y: 50, opacity: 0, transition: { duration: 0.15 } }}
                transform="scale(0.5)"
                transformOrigin="left top"
              >
                <Flex flexDirection="column">
                  <Text
                    fontSize={14}
                    fontWeight="semibold"
                    color={Colors.DARK_YELLOW}
                    textAlign="center"
                    fontFamily="tlm"
                    mt={4}
                  >
                    {userPointsRequired ? 'Experience' : 'Shards'}
                  </Text>
                  <Text fontSize="3xl" textAlign="center" fontFamily="orb">
                    {pointsRequired && formatUserPointsWithDecimal(pointsRequired)}
                    {userPointsRequired && formatUserPointsWithDecimal(userPointsRequired)}
                  </Text>

                  {!isDemoUser && redeemAction && (
                    <Flex justifyContent="center" marginBlock="20px">
                      <Button size="lg" fontSize={20} variant="negative" onClick={redeemAction}>
                        Fuse Shards
                      </Button>
                    </Flex>
                  )}
                </Flex>
              </AnimatedBox>
            )}
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export { NftZoomModal }
