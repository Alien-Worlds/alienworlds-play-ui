import { FC, CSSProperties } from 'react'

import { Dropdown, DropdownProps } from '@alien-worlds/uikit'
import { Box, Flex, Text } from '@chakra-ui/react'

import { LAYOUT_BREAKPOINT } from '../../../features/leaderboard/types/leaderboardTypes'

export interface LeaderboardDropdownProps extends DropdownProps {
  label: string
}

export const WrappedDropdown: FC<LeaderboardDropdownProps> = ({ label, ...rest }) => {
  // from Figma
  const dropdownLabelStyle: CSSProperties = {
    fontFamily: 'Titillium Web',
    fontSize: '14px',
    fontWeight: 400,
    lineHeight: '21px',
    letterSpacing: '0.09em',
    textAlign: 'left',
    whiteSpace: 'nowrap',
    minWidth: '60px',
  }

  return (
    <Flex
      w="full"
      flexGrow="1"
      direction="row"
      position="relative"
      justifyContent="flex-start"
      alignItems="center"
      wrap={{ base: 'wrap', [LAYOUT_BREAKPOINT]: 'nowrap' }}
      minWidth={{
        base: '100%',
        [LAYOUT_BREAKPOINT]: '320px',
      }}
      gap={4}
      padding={1}
    >
      <Text style={dropdownLabelStyle}>{label}</Text>
      <Box flexGrow="1" w="full" m={0}>
        <Dropdown variant="simple" size="md" {...rest} />
      </Box>
    </Flex>
  )
}
