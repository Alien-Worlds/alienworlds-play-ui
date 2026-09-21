import { catchError, pipe } from 'overmind'
import { useModalStore } from 'shared/store/modalStore'

import { Context } from '..'
import { Constants } from '../../shared/util/constants'
import { PagePath } from '../main/types'

export const showArenaPortalPage = pipe(
  ({ actions }: Context) => {
    useModalStore.getState().toggleMainDrawer(false)
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: { location: PagePath.ArenaPortal },
    })
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)
