import { catchError, pipe } from 'overmind'

import { Context } from '..'
import { Constants } from '../../shared/util/constants'
import { PagePath } from '../main/types'

export const showArenaPortalPage = pipe(
  ({ actions }: Context) => {
    actions.main.toggleMainDrawer(false)
    actions.wax.collectEvent({
      name: Constants.GA_PAGE_VISIT,
      fields: { location: PagePath.ArenaPortal },
    })
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)
