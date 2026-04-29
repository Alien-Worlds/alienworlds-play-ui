import { useEffect, VFC } from 'react'

import { Box, Button, Center, chakra, Flex, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { get } from 'lodash'
import { config } from 'shared/util/config'

const MotionButton = motion(Button)

const NewsletterSubscribe: VFC<{ onClose: () => void }> = ({ onClose }) => {
  useEffect(() => {
    if (get(window, 'mootrack', [])) {
      // @ts-ignore
      window?.mootrack('loadForm', '9f818ce4-04d1-4f2e-bace-692f1608af91')
    }
  }, [])

  return (
    <Center minH="80vh">
      <Flex direction="column" align="center" color="white" textAlign="center" w="full">
        <Flex alignItems="center" width="100%" justifyContent="center" alignContent="center">
          <div data-mooform-id="9f818ce4-04d1-4f2e-bace-692f1608af91"></div>
        </Flex>

        <Flex flexWrap="wrap" justify="center" mt={4}>
          <MotionButton
            mb={4}
            size="lg"
            whileHover={{ scale: 0.92 }}
            whileTap={{ scale: 0.9 }}
            borderColor="#e0e0e0"
            color="#e0e0e0"
            letterSpacing="2px"
            variant="outline"
            fontFamily="Orbitron"
            fontWeight="thin"
            px={4}
            py={1}
            borderRadius={10}
            borderWidth="2px"
            fontSize="14px"
            backgroundColor="transparent"
            _hover={{ backgroundColor: '#e0e0e0', color: 'blackAlpha.800' }}
            _active={{ backgroundColor: '#e0e0e0', color: 'blackAlpha.800' }}
            onClick={onClose}
          >
            CLOSE
          </MotionButton>
          <Box w={4} />
        </Flex>
        <Text fontSize="14px" lineHeight="18px" maxW="400px">
          After signing up for our newsletter, you will also receive occasional marketing updates,
          special offers, news or other related information from Alien Worlds or our partners
          regarding the Planet B Missions. We will not sell or distribute your email address to any
          third party at any time. View our{' '}
          <chakra.a
            href={`${config.AlienWorldsUrl}/privacy-policy`}
            color="#d9a555"
            target="_blank"
          >
            privacy policy.
          </chakra.a>
        </Text>
      </Flex>
    </Center>
  )
}

export { NewsletterSubscribe }
