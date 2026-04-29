import { DiscordIcon, TelegramIcon } from '@alien-worlds/icons'
import {
  Flex,
  Modal,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Box,
  Image,
  Text,
  Link,
  IconButton,
  ModalOverlay,
} from '@chakra-ui/react'
import alienWorldsLogo from 'assets/images/alienworlds-db-logo_full_color.svg'
import { WalletsButtons } from 'features/onboarding/components/WalletButtons'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'
import { socialButtonsProps } from 'shared/util/helpers'
import { useActions, useAppState } from 'store'

export const LoginModal = () => {
  const {
    modal: { setPrimaryModalActive },
  } = useActions()
  const {
    modal: { primaryModals },
  } = useAppState()

  const handleClose = () => {
    setPrimaryModalActive({ modalName: 'LoginModal', value: false })
  }

  return (
    <Modal
      isCentered
      preserveScrollBarGap
      onClose={() => handleClose()}
      isOpen={primaryModals.LoginModal}
    >
      <ModalOverlay backdropFilter="blur(5px)" />
      <ModalContent
        minW={{ base: '300px', md: '450px', lg: '600px' }}
        maxH="645px"
        borderRadius="36px"
        background={Colors.BLACK_ALPHA_80}
        justifyContent="center"
        alignItems="center"
      >
        <ModalCloseButton mt={2} mr={2} size="25px" zIndex={2000} />
        <ModalBody>
          <Flex direction="column" alignItems="center" justifyContent="center">
            <Flex
              flexDirection="column"
              alignItems="center"
              padding={{ base: 6, md: 8, lg: 12 }}
              gap={{ base: 2, lg: 4 }}
            >
              <Image
                w={{ base: '140px', md: '180px', lg: '200px', xl: '223px' }}
                h={{ base: '45px', md: '55px', lg: '88px' }}
                src={alienWorldsLogo}
                alt="Alien Worlds Logo"
              />
              <Flex w="full" justifyContent="center" alignItems="center" mb={0}>
                <Text
                  color={Colors.SNOW_WHITE}
                  fontSize={{ base: '16px', md: '18px' }}
                  lineHeight="54px"
                >
                  Select your Sign In Wallet
                </Text>
              </Flex>
              <WalletsButtons />
              <Flex alignItems="center" w="80%" gap={2} ml="auto" mr="auto">
                <Box
                  w="full"
                  py="auto"
                  height="1px"
                  flex="1 1 auto"
                  background={Colors.GRADIENT_BLACK_TO_WHITE}
                />
                <Text flex="1 0 fit-content" fontSize="12px">
                  join community
                </Text>
                <Box
                  w="full"
                  py="auto"
                  height="1px"
                  flex="1 1 auto"
                  background={Colors.GRADIENT_BLACK_TO_WHITE}
                  transform="matrix(-1, 0, 0, 1, 0, 0)"
                />
              </Flex>
              <Flex m={0} alignItems="center" justify="center" flexWrap="wrap" gap={8}>
                <Link href={config.DiscordUrl} target="_blank">
                  <IconButton
                    aria-label="Discord"
                    icon={<DiscordIcon boxSize="30px" />}
                    {...socialButtonsProps}
                  />
                </Link>
                <Link href={config.TelegramUrl} target="_blank">
                  <IconButton
                    aria-label="Telegram"
                    icon={<TelegramIcon boxSize="30px" />}
                    {...socialButtonsProps}
                  />
                </Link>
              </Flex>
              <Text
                fontWeight="700"
                fontSize={{ base: '16px', md: '18px' }}
                lineHeight="36px"
                mb={4}
                mt={4}
              >
                Don’t have an account?{' '}
                <Text
                  cursor="pointer"
                  as="span"
                  color={Colors.DI_SERRIA}
                  onClick={() => {
                    setTimeout(() => {
                      setPrimaryModalActive({ modalName: 'LoginModal', value: false })
                    }, 50)
                    setPrimaryModalActive({ modalName: 'SignUpModal', value: true })
                  }}
                >
                  Sign Up
                </Text>
              </Text>
            </Flex>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
