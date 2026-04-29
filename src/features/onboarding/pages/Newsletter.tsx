import { VFC, useEffect } from 'react'

import { Flex, Image } from '@chakra-ui/react'
import { OnboardingNewsletterSubscription } from 'features/onboarding/components/OnboardingNewsletterSubscription'
import { useNavigate } from 'react-router-dom'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'
import { PagePath } from 'store/main/types'

const Newsletter: VFC = () => {
  const {
    main: { showOnboardingPage, storeOnboardingNewsletterWasShown },
  } = useActions()
  const {
    missions: { newsletterWasShown },
  } = useAppState()

  const navigate = useNavigate()

  const onClose = async () => {
    try {
      storeOnboardingNewsletterWasShown(true)
    } finally {
      navigate(PagePath.Onboarding)
    }
  }

  const onSubscribe = async () => {
    try {
      storeOnboardingNewsletterWasShown(true)
    } finally {
      navigate(PagePath.Onboarding)
    }
  }

  useEffect(() => {
    if (newsletterWasShown) {
      showOnboardingPage()
    }
  }, [])

  return (
    <Flex
      flexDirection="column"
      w="full"
      h="100vh"
      m={0}
      backgroundImage="/images/bg/bg-newsletter.jpg"
      backgroundAttachment="fixed"
      backgroundPosition="center"
      backgroundSize="cover"
    >
      <Flex
        p={{ base: 4, md: 16 }}
        flexDirection="column"
        mx="auto"
        textAlign="center"
        position="relative"
        alignItems="center"
        justifyContent="center"
        flexGrow={1}
        w="100%"
        maxWidth={{
          base: 'fit-content',
          sm: 'xl',
          md: '2xl',
        }}
        color={Colors.MID_ALTO}
      >
        <Flex
          flexDirection="column"
          alignItems="center"
          justifyContent="space-between"
          px={8}
          py={8}
          w="auto"
          mx="auto"
          fontFamily="Titillium Web"
          maxWidth={{
            base: 'fit-content',
            lg: '600px',
          }}
          minWidth={{
            base: 'fit-content',
            lg: 'full',
          }}
          height="max-content"
          maxHeight="fit-content"
          background={Colors.BLACK_ALPHA_80}
          borderRadius="36px"
          flex="1 1 auto"
        >
          <OnboardingNewsletterSubscription onClose={onClose} onSubscribe={onSubscribe} />
        </Flex>
      </Flex>
      <Flex m={0} p={0}>
        <Image
          src="/images/bg/newsletter-form/newsletter-footer-overlay.png"
          w="full"
          maxW={{
            md: '3xl',
          }}
          my={0}
          mx="auto"
          objectFit="cover"
        />
      </Flex>
    </Flex>
  )
}

export { Newsletter }
