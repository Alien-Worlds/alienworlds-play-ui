import { useEffect, useState } from 'react'

import { Container } from '@chakra-ui/react'
import { ErrorOverlay } from 'features/missions/components/ErrorOverlay/ErrorOverlay'
import { InfoOverlay } from 'features/missions/components/InfoOverlay/InfoOverlay'
import { LoadingTransactionOverlay } from 'features/missions/components/LoadingTransactionOverlay/LoadingTransactionOverlay'
import { MissionsHeader } from 'features/missions/components/MissionsHeader'
import { useLocation } from 'react-router-dom'
import { isMissionsRelatedPage } from 'shared/util/router'
import { useAppState } from 'store'

import { Constants } from '../util/constants'

const MainContainer = ({ children }) => {
  const {
    wax: { isDemoUser },
    missions: { loadingMessage, infoMessage, errorMessage },
  } = useAppState()

  const { pathname } = useLocation()

  const [isMissionsPage, setIsMissionsPage] = useState(false)

  useEffect(() => {
    setIsMissionsPage(isMissionsRelatedPage(pathname))
  }, [pathname])

  if (isMissionsPage) {
    return (
      <>
        <Container
          maxW="full"
          top={{
            base: isDemoUser ? '220px' : 0,
            sm: isDemoUser ? '70px' : 0,
            md: isDemoUser ? 12 : 0,
          }}
          position="relative"
          py={{
            base: isDemoUser ? 2 : '35px',
            sm: isDemoUser ? 5 : '35px',
            md: isDemoUser ? 4 : 2,
            xl: isDemoUser ? 2 : 2,
          }}
          px={{
            base: 0,
            sm: 0,
            md: 4,
          }}
        >
          <MissionsHeader />
          {children}
        </Container>
        {loadingMessage && <LoadingTransactionOverlay />}
        {errorMessage && <ErrorOverlay />}
        {infoMessage && <InfoOverlay />}
      </>
    )
  }
  const demoTopbarHeight = `${Constants.DEMO_TOPBAR_HEIGHT + 12}px`
  const demoTopbarHeightMobile = `${Constants.DEMO_TOPBAR_HEIGHT_MOBILE.toString()}px`

  return (
    <Container
      maxW="full"
      top={{
        base: isDemoUser ? demoTopbarHeightMobile : 0,
        sm: isDemoUser ? demoTopbarHeight : 0,
      }}
      position="relative"
      py={{
        base: isDemoUser ? 4 : 6,
        xl: isDemoUser ? 2 : 6,
      }}
      px={0}
    >
      {children}
    </Container>
  )
}

export default MainContainer
