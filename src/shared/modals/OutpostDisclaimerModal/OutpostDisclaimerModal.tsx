import { ExperienceIcon, ShardsIcon, NFTPointsIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Flex, Modal, ModalBody, ModalContent, ModalCloseButton, Text, Box } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { useAppState, useActions } from 'store'

const RELEASE_NOTES_URL =
  'http://alienworlds.io/blogs/embracing-the-power-of-shards-introducing-the-new-nft-outpost'

const OutpostDisclaimerModal = () => {
  const {
    modal: { setPrimaryModalActive },
  } = useActions()
  const {
    modal: { primaryModals },
  } = useAppState()

  const handleClose = () => {
    setPrimaryModalActive({ modalName: 'OutpostDisclaimerModal', value: false })

    localStorage.setItem('alienworlds-outpost-disclaimer', 'true')
  }

  return (
    <Modal isOpen={primaryModals.OutpostDisclaimerModal} onClose={() => handleClose()} size="full">
      <ModalContent position="relative" bg={Colors.BLACK_SOLID_95}>
        <ModalCloseButton onClick={() => handleClose()} zIndex={2000} />
        <ModalBody
          alignSelf="center"
          alignItems="center"
          justifyContent="center"
          pt={{ base: '10%', md: '4%' }}
          w={{ base: '75%', md: '50%' }}
        >
          <Flex direction="column" gap="30px" alignItems="center" justifyContent="center">
            <Text fontSize="30px" color={Colors.SNOW_WHITE} fontFamily="orb" textAlign="center">
              Welcome to <br />
              Alien Worlds v2.7
            </Text>
            <Text
              fontSize="20px"
              fontFamily="tlm"
              textAlign="center"
              color={Colors.SNOW_WHITE}
              w={{ base: '100%', md: '85%' }}
            >
              We made improvements to the explorer experience. NFT Points, a byproduct from minings
              and other Alien Worlds activities has been renamed to "Shards":
            </Text>

            <Flex gap="20px">
              <Flex direction="column" w="100px" alignItems="center">
                <NFTPointsIcon boxSize={55} color={Colors.DI_SERRIA} />
                <Text color={Colors.SNOW_WHITE} fontFamily="tlm" fontSize={18} fontWeight={400}>
                  NFT Points
                </Text>
              </Flex>
              <Text
                mt="7px"
                w="50px"
                fontSize="24px"
                fontFamily="tlm"
                fontWeight={400}
                textAlign="center"
                color={Colors.SNOW_WHITE}
              >
                =
              </Text>
              <Flex direction="column" w="100px" alignItems="center">
                <ShardsIcon boxSize={40} style={{ marginTop: '7px' }} color={Colors.SNOW_WHITE} />
                <Text
                  color={Colors.SNOW_WHITE}
                  fontFamily="tlm"
                  fontSize={18}
                  fontWeight={400}
                  mt="7px"
                >
                  Shards
                </Text>
              </Flex>
            </Flex>

            <Text fontSize="20px" color={Colors.SNOW_WHITE} fontFamily="tlm">
              Additionally, User Points is now appropiately renamed to "Experience" or "EXP":
            </Text>
            <Flex w="100%" gap="10px" justifyContent="center">
              <ExperienceIcon boxSize={40} color={Colors.SNOW_WHITE} />
              <Text
                color={Colors.SNOW_WHITE}
                fontFamily="tlm"
                fontSize="18px"
                fontWeight={400}
                mt="5px"
              >
                Experience
              </Text>
            </Flex>
            <Text fontSize="20px" color={Colors.SNOW_WHITE} fontFamily="tlm">
              To get an NFT in the Outpost, explorers will "Fuse" their "Shards" to acquire it:
            </Text>
            <Flex minW="230px" maxW="230px" h="70px">
              <Box position="absolute" minW="230px" h="65px" maxW="230px" zIndex={10} />
              <Button
                marginLeft={2}
                marginTop={1}
                size="lg"
                minWidth="215px"
                maxWidth="215px"
                fontSize={18}
                variant="negative"
                position="absolute"
                leftIcon={<ShardsIcon color={Colors.SNOW_WHITE} boxSize={30} />}
              >
                Fuse Shards
              </Button>
            </Flex>
            <Text fontSize="20px" color={Colors.SNOW_WHITE} fontFamily="tlm">
              The use of Shards will begin to grow between Alien Worlds and its communities.
            </Text>
            <Button
              size="lg"
              variant="info"
              fontSize={18}
              onClick={() => window.open(RELEASE_NOTES_URL, '_blank')}
            >
              Read the Release Notes
            </Button>
            <Button
              size="lg"
              variant="dark"
              color={Colors.MID_GRAY}
              fontSize={14}
              onClick={() => handleClose()}
            >
              Click to Close
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export { OutpostDisclaimerModal }
