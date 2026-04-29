import { VFC } from 'react'

import { Box, Button, Center, Flex, Text } from '@chakra-ui/react'
import { motion } from 'framer-motion'

const MotionButton = motion(Button)

const NewsletterUnsubscribe: VFC<{ onClose: () => void }> = ({ onClose }) => {
  return (
    <Center minH="80vh">
      <Flex direction="column" align="center" color="white" textAlign="center" w="full">
        <Text as="h3" fontSize="20px" fontWeight="bold" letterSpacing="5px" mb={8}>
          Do you wish to Unsuscribe from Missions News & Updates?
        </Text>
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
            Cancel
          </MotionButton>
          <Box w={4} />
          <MotionButton
            size="lg"
            mb={4}
            whileHover={{ scale: 0.92 }}
            whileTap={{ scale: 0.9 }}
            borderColor="#e0e0e0"
            color="blackAlpha.800"
            variant="outline"
            fontFamily="Orbitron"
            fontWeight={400}
            letterSpacing="5px"
            fontSize={{ base: '16px', md: '20px' }}
            px={4}
            py={2}
            borderRadius={10}
            borderWidth="2px"
            backgroundColor="#e0e0e0"
            _hover={{ backgroundColor: 'transparent', color: '#e0e0e0' }}
            _active={{
              backgroundColor: 'transparent',
              color: '#e0e0e0',
            }}
          >
            Yes, Remove Me
          </MotionButton>
        </Flex>
      </Flex>
    </Center>
  )
}

export { NewsletterUnsubscribe }
