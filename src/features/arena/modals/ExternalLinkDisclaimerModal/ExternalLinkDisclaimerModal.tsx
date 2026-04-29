import { Button, BUTTON_SIZE } from '@alien-worlds/uikit'
import {
  Flex,
  Image,
  Modal,
  ModalBody,
  ModalContent,
  ModalOverlay,
  ModalFooter,
  Text,
  useBreakpointValue,
  ModalCloseButton,
} from '@chakra-ui/react'
import AlienWorldsLogo from 'assets/images/alienworlds-db-logo_full_color.svg'
import ArenaPortalWarningBg from 'assets/images/arena-portal/disclaimer_bg.jpg'
import ScrollContainer from 'react-indiana-drag-scroll'
import { Colors } from 'shared/util/colors'
import { useAppState, useActions } from 'store'

const ExternalLinkDisclaimerModal = () => {
  const {
    modal: { secondaryModals },
  } = useAppState()

  const {
    modal: { setSecondaryModalActive },
  } = useActions()

  const handleClose = () => {
    setSecondaryModalActive({ modalName: 'ExternalLinkDisclaimerModal', value: false })
  }

  const handleConfirm = () => {
    if (typeof secondaryModals.onConfirm === 'function') {
      secondaryModals.onConfirm()
    }
    handleClose()
  }
  const currentBreakpointButtonSize: keyof typeof BUTTON_SIZE = useBreakpointValue({
    base: 'sm',
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'lg',
    '2xl': 'lg',
  })
  return (
    <Modal
      size="full"
      autoFocus={false}
      blockScrollOnMount
      preserveScrollBarGap
      onClose={handleClose}
      isOpen={secondaryModals.ExternalLinkDisclaimerModal}
    >
      <ModalOverlay
        backgroundSize="cover"
        backgroundPosition="center"
        backgroundAttachment="fixed"
        backgroundImage={ArenaPortalWarningBg}
      />
      <ModalContent
        minH="initial"
        alignSelf="center"
        borderRadius="35px"
        background={Colors.ARENA_DISCLAIMER_BG_GRADIENT}
        maxWidth={{ base: '100vw', md: '70vw', xl: '40vw' }}
      >
        <ModalCloseButton />
        <ModalBody fontFamily="tlm">
          <Flex w="100%" alignItems="center" justifyContent="center">
            <Image
              my={6}
              w="225px"
              alignSelf="center"
              paddingBlock="15px"
              src={AlienWorldsLogo}
              alt="Alien Worlds Logo"
            />
          </Flex>
          <Text
            w="100"
            mb="30px"
            fontSize={30}
            fontFamily="orb"
            fontWeight={400}
            textAlign="center"
            color={Colors.SNOW_WHITE}
          >
            You are now leaving the Alien Worlds Metaverse website.
          </Text>
          <Flex
            overflowY="auto"
            direction="column"
            textAlign="center"
            maxH={{ base: '30vh', md: '35vh' }}
            paddingInline={{ base: '5px', md: '40px' }}
          >
            <ScrollContainer
              hideScrollbars={false}
              className="scroll-container"
              style={{ paddingInline: '10px' }}
            >
              <Text color={Colors.SNOW_WHITE} fontSize={18} paddingBottom={3} fontWeight={400}>
                Alien Worlds offers links to other third party websites that may be of interest to
                website visitors to the Alien Worlds Metaverse. When you click on these links you
                will leave the Alien Worlds Metaverse website and will be redirected to another
                third party website. These websites are not under the control of Alien Worlds.
              </Text>

              <Text color={Colors.SNOW_WHITE} fontSize={18} paddingBlock={3} fontWeight={400}>
                Alien Worlds is not responsible for the content of linked third party websites.
                Alien Worlds is not an agent for these third parties nor guarantees their services
                or products. Alien Worlds makes no representation or warranty regarding the accuracy
                of the information contained in the linked sites.
              </Text>

              <Text color={Colors.SNOW_WHITE} fontSize={18} paddingBlock={3} fontWeight={400}>
                Please be aware that the terms and conditions and security and privacy policies on
                these sites may be different than Alien Worlds’ policies, so please read third party
                terms and conditions and privacy and security policies closely. When you use a third
                party site, you will be subject to its terms and conditions and no longer be
                protected by Alien Worlds’ terms and conditions, security practices or privacy
                policies.
              </Text>

              <Text color={Colors.SNOW_WHITE} fontSize={18} paddingBlock={3} fontWeight={400}>
                If you have any questions or concerns about the products and services offered on
                linked third party websites, please contact the relevant third party directly.
              </Text>

              <Text color={Colors.SNOW_WHITE} fontSize={18} paddingBlock={3} fontWeight={400}>
                By clicking on the GO TO SITE button below, you acknowledge the above statement and
                will be taken to the linked site. If you want to remain on Alien Worlds' site,
                select the STAY HERE button.
              </Text>
            </ScrollContainer>
          </Flex>
        </ModalBody>
        <ModalFooter justifyContent="center">
          <Flex direction="column" gap={4} width="100%" pb={12} alignItems="center">
            <Button
              width="100%"
              maxWidth="300px"
              fontSize={20}
              variant="warning"
              onClick={handleConfirm}
              size={currentBreakpointButtonSize}
            >
              Go to Site
            </Button>
            <Button
              width="100%"
              maxWidth="300px"
              fontSize={20}
              variant="tertiary"
              onClick={handleClose}
              size={currentBreakpointButtonSize}
            >
              Stay Here
            </Button>
          </Flex>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export { ExternalLinkDisclaimerModal }
