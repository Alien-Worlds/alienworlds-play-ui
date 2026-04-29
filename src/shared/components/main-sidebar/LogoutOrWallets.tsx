import { LogoutOldIcon } from '@alien-worlds/icons'
import { Flex, Text, Image, Box } from '@chakra-ui/react'
import walletsLine from 'assets/images/walletsLine.png'
import { WalletsManager } from 'shared/components/main-sidebar/WalletsManager'
import { Colors } from 'shared/util/colors'
import { clearCookies } from 'shared/util/helpers'
import { useAppState, useActions } from 'store'

const LogoutOrWallets = () => {
  const {
    main: { logout },
    modal: { setPrimaryModalActive },
  } = useActions()
  const {
    wax: { isDemoUser },
    main: { isCompactSidebar },
  } = useAppState()

  const onClickLogout = () => {
    clearCookies()
    setPrimaryModalActive({ modalName: 'LoadingModal', value: true })

    setTimeout(() => {
      setPrimaryModalActive({ modalName: 'LoadingModal', value: false })
    }, 1500)
    logout()
  }

  return (
    <Flex
      gap={6}
      alignItems="center"
      flexDirection="column"
      justifyContent="center"
      mb={isCompactSidebar ? 0 : 2}
    >
      <Flex
        gap={2}
        cursor="pointer"
        alignItems="center"
        color={Colors.ALTO}
        justifyContent="center"
        onClick={onClickLogout}
        my={isCompactSidebar ? 1 : 2}
        _hover={{
          transform: 'scale(1.1)',
          transition: 'transform 0.3s ease',
        }}
      >
        <LogoutOldIcon boxSize={24} />
        {!isCompactSidebar && (
          <Text fontSize="md" fontWeight="bold">
            Logout
          </Text>
        )}
      </Flex>
      {!isDemoUser && (
        <Box>
          {!isCompactSidebar && <Image src={walletsLine} w="100%" />}
          <WalletsManager />
        </Box>
      )}
    </Flex>
  )
}

export { LogoutOrWallets }
