import { VFC, useEffect, useRef } from 'react'

import { Flex, Link, Text } from '@chakra-ui/react'
import { get } from 'lodash'
import { Colors } from 'shared/util/colors'
import { useActions } from 'store'

import { Constants } from '../../../../shared/util/constants'

const OnboardingNewsletterSubscription: VFC<{ onSubscribe: () => void; onClose: () => void }> = ({
  onClose,
}) => {
  const {
    wax: { collectEvent },
  } = useActions()
  const formContainerRef = useRef<HTMLDivElement>(null)
  const formLoadedRef = useRef(false)

  const onCloseNewsletterSubscription = () => {
    collectEvent({ name: Constants.GA_AW_ONBOARDING_NEWSLETTER_CANCEL })
    onClose()
  }
  useEffect(() => {
    if (!formContainerRef.current) return

    // Check if mootrack is available
    if (!get(window, 'mootrack', [])) return

    // Use MutationObserver to detect if form auto-loads from data-mooform-id
    const observer = new MutationObserver(() => {
      if (formContainerRef.current && formContainerRef.current.children.length > 0) {
        formLoadedRef.current = true
        observer.disconnect()
      }
    })

    observer.observe(formContainerRef.current, { childList: true, subtree: true })

    // Give a short delay to see if auto-load happens, then manually load if needed
    const timeoutId = setTimeout(() => {
      if (!formLoadedRef.current) {
        // @ts-ignore
        window?.mootrack('loadForm', 'd4d2b857-abc8-47d0-aaaf-7c101c2cdcc3')
        formLoadedRef.current = true
      }
      observer.disconnect()
    }, 200)

    return () => {
      clearTimeout(timeoutId)
      observer.disconnect()
    }
  }, [])
  return (
    <Flex
      direction="column"
      color={Colors.SNOW_WHITE}
      justifyContent="space-between"
      w="full"
      maxW={{
        base: 'fit-content',
        lg: '2xl',
      }}
      m="auto"
      height="full"
      maxHeight={{ base: 'full', md: '2xl' }}
      px={{
        base: 'auto',
        sm: 10,
        md: 12,
      }}
    >
      <Text fontSize="3xl" fontWeight="normal" fontFamily="orb" color={Colors.DARK_YELLOW}>
        Unlock the Secrets of Trilium
      </Text>
      <Text
        fontSize="2xl"
        fontWeight="bold"
        fontFamily="tlm"
        color={Colors.SNOW_WHITE}
        lineHeight="short"
        mt={4}
      >
        Sign up to be the first to hear about new games and updates before they materialize
      </Text>

      <Flex m={0} p={0} w="full" justifyContent="center" direction="column">
        <div ref={formContainerRef} data-mooform-id="d4d2b857-abc8-47d0-aaaf-7c101c2cdcc3"></div>
      </Flex>

      <Link onClick={onCloseNewsletterSubscription} color={Colors.MID_GRAY} mx="auto">
        Maybe later...
      </Link>
    </Flex>
  )
}

export { OnboardingNewsletterSubscription }
