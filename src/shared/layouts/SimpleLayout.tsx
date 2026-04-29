import { FC } from 'react'

import { Flex } from '@chakra-ui/react'
import { LoadingTransactionOverlay } from 'features/missions/components/LoadingTransactionOverlay'
import { Outlet } from 'react-router-dom'
import { TopBar } from 'shared/components/topbar/TopBar'
import MainContainer from 'shared/layouts/MainContainer'
import { useAppState } from 'store'

import { Constants } from '../util/constants'

interface SimpleLayoutProps {
  withTopBar?: boolean
}

const WithMainContainer: FC = () => (
  <MainContainer>
    <Outlet />
  </MainContainer>
)

const SimpleLayout: FC<SimpleLayoutProps> = ({ withTopBar = false }) => {
  const {
    missions: { loadingMessage },
    wax: { isOnboarded },
  } = useAppState()

  return (
    <>
      {isOnboarded && withTopBar && <TopBar />}
      <Flex
        position="relative"
        flexDirection="column"
        minH="100vh"
        pt={isOnboarded && withTopBar ? Constants.MAIN_TOPBAR_HEIGHT : 0}
      >
        {isOnboarded && withTopBar ? <WithMainContainer /> : <Outlet />}
      </Flex>
      {loadingMessage && <LoadingTransactionOverlay />}
    </>
  )
}

export default SimpleLayout
