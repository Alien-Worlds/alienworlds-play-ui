import { Box } from '@chakra-ui/react'
import { MiningTabs } from 'features/mining/components/MiningTabs/MiningTabs'
import { useMinerStore } from 'shared/store/minerStore'

export const OptionalMiningTabs = () => {
  const isOnboarded = useMinerStore((state) => state.isOnboarded)

  return (
    <Box w="full" textAlign="start" mb={5}>
      {isOnboarded && <MiningTabs />}
    </Box>
  )
}
