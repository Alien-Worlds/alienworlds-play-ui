import { LogoutIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Flex } from '@chakra-ui/react'
import { useModalStore } from 'shared/store/modalStore'
import { clearCookies } from 'shared/util/helpers'
import { useActions } from 'store'

export const LogoutButton = () => {
  const {
    main: { logout },
  } = useActions()
  const setPrimaryModalActive = useModalStore((state) => state.setPrimaryModalActive)
  const onClickLogout = () => {
    clearCookies()
    setPrimaryModalActive({ modalName: 'LoadingModal', value: true })

    setTimeout(() => {
      setPrimaryModalActive({ modalName: 'LoadingModal', value: false })
    }, 1500)
    logout()
  }
  return (
    <Flex px="16px" mt={4}>
      <Button
        justifyContent="flex-start"
        fontWeight={600}
        fontSize={18}
        size="lg"
        variant="info"
        isFullWidth
        leftIcon={<LogoutIcon boxSize="24px" />}
        marginBottom={2}
        onClick={() => onClickLogout()}
      >
        Logout
      </Button>
    </Flex>
  )
}
