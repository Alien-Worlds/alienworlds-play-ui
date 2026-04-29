import { VFC } from 'react'

import { TriliumIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Box, Center, Flex, Text } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { formatNumber } from 'shared/util/numbers'
import { useActions, useAppState } from 'store'

const slotPrices = {
  1: 0,
  2: 160,
  3: 260,
  4: 420,
  5: 680,
  6: 1100,
  7: 1800,
  8: 2800,
  9: 4600,
  10: 7400,
  11: 12000,
  12: 18000,
  13: 30000,
  14: 50000,
  15: 80000,
}

export const LandUnlockSlotModal: VFC<{ onClose: () => void; slotToUnlock: number }> = ({
  onClose,
  slotToUnlock,
}) => {
  const {
    wax: { managingLandId },
  } = useAppState()

  const {
    wax: { unlockSlot, loadManagingLandDetailsAndBoostsWithDelay },
  } = useActions()

  const slotPrice: number = slotPrices[slotToUnlock]

  const unlockBoostSlot = async () => {
    const isSuccess = await unlockSlot({ landId: managingLandId, cost: slotPrice })

    if (isSuccess) {
      loadManagingLandDetailsAndBoostsWithDelay()
      onClose()
    }
  }

  return (
    <Center minH="80vh" id="missions-claim-rewards">
      <Flex direction="column" align="center" color="white" textAlign="center" w="full">
        <Text fontSize="24px" fontFamily="tlm" fontWeight={600} mb="10px">
          Unlock
        </Text>
        <Flex
          mb={5}
          pt={1}
          bg="white"
          height="104px"
          width="104px"
          borderRadius="50%"
          flexDirection="column"
          gap={2}
          justifyContent="center"
        >
          <Text color="black" fontSize="24px" fontWeight={600} fontFamily="tlm" lineHeight="20px">
            slot
          </Text>
          <Text
            fontFamily="tlm"
            fontSize="45px"
            fontWeight={600}
            textTransform="uppercase"
            color="black"
            lineHeight="35px"
          >
            {slotToUnlock}
          </Text>
        </Flex>

        <Flex align="center" flexWrap="wrap" sx={{ gap: '25px' }} justify="center">
          <Flex align="center">
            <Box w="40px" fill={Colors.DI_SERRIA} mr={4}>
              <TriliumIcon w="44px" h="44px" />
            </Box>
            <Text fontSize="54px" fontFamily="Orbitron" fontWeight={400}>
              {formatNumber(slotPrice)}
            </Text>
          </Flex>
        </Flex>

        <Flex sx={{ gap: '25px' }} mt={12} flexDirection={{ base: 'column-reverse', md: 'row' }}>
          <Button variant="tertiary" onClick={onClose} size="md" fontSize={16}>
            Cancel
          </Button>
          <Button
            variant="negative"
            size="md"
            width="100%"
            fontSize={16}
            onClick={() => {
              unlockBoostSlot()
            }}
          >
            Unlock Slot {slotToUnlock}
          </Button>
        </Flex>
      </Flex>
    </Center>
  )
}
