import { useEffect, VFC } from 'react'

import { WaxIcon } from '@alien-worlds/icons'
import { Box, Flex, HStack, VStack, Text } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'

export const PlanetaryCustodianBudget: VFC = () => {
  const {
    wax: { selectedDacInfo, selectedDacId },
  } = useAppState()
  const {
    wax: { getDAOInfo },
  } = useActions()

  useEffect(() => {
    getDAOInfo(selectedDacId)
  }, [selectedDacInfo, selectedDacId])

  return (
    <HStack pl={2} w="100%" display="flex" alignItems="flex-start" justifyContent="start">
      <Box position="relative">
        <WaxIcon
          style={{
            top: 42,
            bottom: 0,
            zIndex: 3,
            right: 10,
            width: 45,
            height: 45,
            color: Colors.NAVY_BLUE,
          }}
        />
      </Box>
      <VStack alignItems="start">
        <Flex
          h="35px"
          mb="-5px"
          mt="0px"
          alignItems="baseline"
          flexDirection="column"
          justifyContent="flex-start"
        >
          <Text fontSize={20} fontFamily="orb" lineHeight="1.33">
            {selectedDacInfo?.custodianBudget}
          </Text>
          <Text fontFamily="tlm" fontSize={12} fontWeight={600} color={Colors.NAVY_BLUE}>
            Custodian Budget
          </Text>
        </Flex>
      </VStack>
    </HStack>
  )
}
