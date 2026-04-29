import { Dropdown } from '@alien-worlds/uikit'
import { Text, Flex } from '@chakra-ui/react'
import { ReverseSortingFilter } from 'features/leaderboard/components/ReverseSortingFilter'
import {
  LAYOUT_BREAKPOINT,
  LeaderboardSortByOptions,
} from 'features/leaderboard/types/leaderboardTypes'
import { Colors } from 'shared/util/colors'
import { useScreenSize } from 'shared/util/hooks'

export const LeaderboardHeader = ({
  setSort,
  setIsSortReversed,
}: {
  sort: string
  setSort: (value: string) => void
  setIsSortReversed: (reversed: boolean) => void
}) => {
  const { isMobile } = useScreenSize()

  return (
    <Flex
      position="relative"
      direction={{ base: 'column', [LAYOUT_BREAKPOINT]: 'row' }}
      w={{ base: 'full' }}
      justifyContent={{ base: 'flex-start', md: 'space-between' }}
      alignItems={{ base: 'center' }}
      gap={{ base: 5, [LAYOUT_BREAKPOINT]: 4 }}
      mb={{ base: '10px', xl: 0 }}
    >
      <Text
        as="h2"
        pt="10px"
        fontFamily="orb"
        display={{ base: 'none', md: 'initial' }}
        fontSize={{ base: '24px', md: '3xl' }}
        color="white"
        fontWeight="normal"
      >
        Mining Leaderboard
      </Text>

      <Flex order={{ base: 1, [LAYOUT_BREAKPOINT]: 3 }} flexDirection="row" gap={3} w="100%">
        <Flex
          gap={3}
          width={{ base: '100%', md: 'fit-content' }}
          direction={{ base: 'column', md: 'row' }}
        >
          <Text minW="50px" color={Colors.SNOW_WHITE} my="auto">
            Sort by
          </Text>
          <Dropdown
            defaultValue={LeaderboardSortByOptions[0]}
            options={LeaderboardSortByOptions}
            variant="simple"
            onChange={(props: any) => setSort(props.value)}
            size="md"
            styles={{
              container: () => ({
                width: isMobile ? '100%' : '175px',
                cursor: 'pointer',
                textAlign: 'start',
              }),
              dropdownIndicator: () => ({ right: 0, cursor: 'pointer' }),
              input: () => ({ cursor: 'pointer' }),
              menu: () => ({ width: '100%', cursor: 'pointer', textAlign: 'center' }),
              option: () => ({ cursor: 'pointer' }),
            }}
          />
        </Flex>

        <ReverseSortingFilter onToggle={(reversed) => setIsSortReversed(reversed)} />
      </Flex>
    </Flex>
  )
}
