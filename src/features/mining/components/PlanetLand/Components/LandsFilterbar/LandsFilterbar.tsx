import { VFC } from 'react'

import { Box, Flex } from '@chakra-ui/react'
import { motion } from 'framer-motion'

import { LandsFilterbarFields } from '../LandsFilterbarFields/LandsFilterbarFields'
import { LandsFilterbarSwitches } from '../LandsFilterbarSwitches/LandsFilterbarSwitches'

const MotionBox = motion(Box)

const LandsFilterbar: VFC = () => {
  return (
    <MotionBox
      width="full"
      zIndex={1299}
      marginTop={-50}
      position="relative"
      initial="closed"
      animate="open"
      variants={{
        open: { y: 0 },
        closed: { y: -50 },
      }}
    >
      <Flex
        direction={{ base: 'column' }}
        w="full"
        mt="50px"
        gap="30px"
        p={{
          base: 0,
        }}
      >
        <LandsFilterbarFields />
        <LandsFilterbarSwitches />
      </Flex>
    </MotionBox>
  )
}

export { LandsFilterbar }
