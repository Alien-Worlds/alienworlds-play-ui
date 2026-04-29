import { Box, Container, Flex } from '@chakra-ui/react'
import { Header } from 'features/profile/components/Header/Header'
import { Outlet } from 'react-router'
import { useAppState } from 'store'

const ProfileLayout = () => {
  const {
    wax: { isDemoUser },
  } = useAppState()

  return (
    <Container maxW="100%" alignItems="start" p={{ base: 0, md: 2 }} pt={{ base: 0, md: -2 }}>
      <Box justifyContent="start">
        <Flex
          m={0}
          p={0}
          w="100%"
          alignItems="start"
          flexDirection="column"
          mt={{ base: '-10px', md: isDemoUser ? '0px' : '-10px' }}
        >
          <Box w="100%" p={0} m={0}>
            <Header />
          </Box>

          <Box w="100%" p={0} m={0}>
            <Outlet />
          </Box>
        </Flex>
      </Box>
    </Container>
  )
}

export default ProfileLayout
