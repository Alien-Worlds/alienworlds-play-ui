import { useEffect } from 'react'

import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { Outlet, useLocation } from 'react-router-dom'
import { useActivePath } from 'shared/hooks/useRouter'
import { BackgroundLayer } from 'shared/layouts'
import { SessionManager } from 'shared/layouts/SessionManager'
import { isMissionsRelatedPage } from 'shared/util/router'
import { useActions, useAppState } from 'store'
import { PagePath } from 'store/main/types'

export const MainLayout = () => {
  const {
    wax: { isAuthenticating },
  } = useAppState()

  const {
    main: { tryAutoLogin, setIsFocusedWindow },
  } = useActions()
  const { pathname } = useLocation()
  const isLoginRelatedPages = useActivePath([PagePath.Home, PagePath.SignUp])
  const isMissionsPage = isMissionsRelatedPage(pathname)
  let counter = 0

  useEffect(() => {
    // counter to avoid triggering AutoLogin multiple times while MainLayout updates
    if (counter > 0) return

    counter = 1
    tryAutoLogin()
    const handleFocus = () => {
      setIsFocusedWindow(true)
    }
    const handleBlur = () => {
      setIsFocusedWindow(false)
    }
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)

    return () => {
      window.removeEventListener('focus', handleFocus)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  return (
    <>
      <BackgroundLayer />
      <SessionManager />
      {/* Only load Children when authentication is done */}
      {/* FALSE mean the authentication process is done, whether fail or success */}
      {/* The initial value of isAuthenticating is null to identify it as 'not started' */}
      {/* this way is used to allow protected pages gets the auth states before render */}
      {(isAuthenticating === false || isLoginRelatedPages || isMissionsPage) && <Outlet />}
      {isAuthenticating && !isLoginRelatedPages && !isMissionsPage && <LoadingSpinner />}
    </>
  )
}
