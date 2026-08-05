import { IContext } from 'overmind'
import { namespaced } from 'overmind/config'
import { createActionsHook, createEffectsHook, createStateHook } from 'overmind-react'

import * as arena from './arena'
import * as atomic from './atomic'
import * as main from './main'
import * as missions from './missions'
import * as modal from './modal'
import * as wax from './wax'
import * as web3 from './web3'

export const config = namespaced({
  main,
  atomic,
  missions,
  wax,
  web3,
  modal,
  arena,
})

export type Context = IContext<typeof config>

export const useAppState = createStateHook<Context>()
export const useActions = createActionsHook<Context>()
export const useEffects = createEffectsHook<Context>()
