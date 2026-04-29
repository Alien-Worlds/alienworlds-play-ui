import { Box } from '@chakra-ui/react'
import { MiningTabs } from 'features/mining/components/MiningTabs/MiningTabs'
import { useAppState } from 'store'

export const OptionalMiningTabs = () => {
  const {
    wax: { isOnboarded },
  } = useAppState()

  return (
    <Box w="full" textAlign="start" mb={5}>
      {isOnboarded && <MiningTabs />}
    </Box>
  )
}
