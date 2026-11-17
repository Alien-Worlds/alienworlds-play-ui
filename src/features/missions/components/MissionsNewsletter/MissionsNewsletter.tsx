import { CheckmarkIcon } from '@alien-worlds/icons'
import { Button, Flex, useDisclosure } from '@chakra-ui/react'
import { NewsletterSubscribe } from 'features/missions/components/NewsletterSubscribe/NewsletterSubscribe'
import { useBscWalletStore } from 'features/missions/store/bscWalletStore'
import { useMissionsStore } from 'features/missions/store/missionsStore'
import { AppModal } from 'shared/layouts'
import { Colors } from 'shared/util/colors'

const MissionsNewsletter = () => {
  const userWallet = useBscWalletStore((state) => state.userWallet)
  const subscribedEmail = useMissionsStore((state) => state.subscribedEmail)

  const newsletterSubscribeDisclosure = useDisclosure()

  return (
    <Flex
      h="100%"
      alignItems="center"
      mb={!userWallet ? '-0px' : '20px'}
      justifyContent={{ base: 'center', xl: 'start' }}
    >
      <Button
        variant="unstyled"
        color="white"
        marginBottom={{ base: 0, lg: !userWallet ? '-0px' : '15px' }}
        fontSize="18px"
        onClick={() => {
          newsletterSubscribeDisclosure.onOpen()
        }}
      >
        <Flex align="center" fontSize={{ base: '12px', lg: '18px' }}>
          <Flex
            align="center"
            justify="center"
            w="18px"
            h="18px"
            backgroundColor="transparent"
            borderColor={Colors.SNOW_WHITE}
            borderWidth="2px"
            borderRadius="3px"
            mr={2}
          >
            {subscribedEmail && <CheckmarkIcon color={Colors.SNOW_WHITE} boxSize={14} />}
          </Flex>
          NEWS, UPDATES AND MORE!
        </Flex>
      </Button>
      <AppModal
        onClose={newsletterSubscribeDisclosure.onClose}
        isOpen={newsletterSubscribeDisclosure.isOpen}
      >
        <NewsletterSubscribe onClose={newsletterSubscribeDisclosure.onClose} />
      </AppModal>

      {/* <AppModal
        onClose={newsletterUnsubscibeDisclosure.onClose}
        isOpen={newsletterUnsubscibeDisclosure.isOpen}
      >
        <NewsletterUnsubscribe onClose={newsletterUnsubscibeDisclosure.onClose} />
      </AppModal> */}
    </Flex>
  )
}

export { MissionsNewsletter }
