import { useEffect, VFC } from 'react'

import { Flex } from '@chakra-ui/react'
import { LoginPrompt } from 'features/onboarding/components/LoginPrompt'
import { Colors } from 'shared/util/colors'
import { useActions } from 'store'

const Home: VFC = () => {
  const {
    main: { showHomePage },
  } = useActions()

  useEffect(() => {
    showHomePage()
  }, [])

  return (
    <Flex
      p={{ base: 4, md: 16 }}
      flexDirection="column"
      mx="auto"
      textAlign="center"
      alignItems="center"
      justifyContent="center"
      flexGrow={1}
      w="full"
      maxWidth="2xl"
      h="fit-content"
      color={Colors.MID_ALTO}
    >
      <LoginPrompt />
    </Flex>
  )
}

export { Home }
