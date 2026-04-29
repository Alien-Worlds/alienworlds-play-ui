import { FC } from 'react'

import { Box, Spinner } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'

interface LoadingSpinnerProps {
  inline?: boolean
}

export const LoadingSpinner: FC<LoadingSpinnerProps> = ({ inline }) => {
  return (
    <Box
      width="100%"
      h={inline === true ? 'fit-content' : '100vh'}
      justifyContent="center"
      alignItems="center"
      display="flex"
    >
      <Spinner
        thickness="4px"
        speed="0.65s"
        emptyColor={Colors.DI_SERRIA}
        color={Colors.INDIGO}
        size="xl"
      />
    </Box>
  )
}
