import { IContext } from 'overmind'
import { namespaced } from 'overmind/config'
import { createActionsHook, createEffectsHook, createStateHook } from 'overmind-react'

import * as atomic from './atomic'
import * as main from './main'
import * as wax from './wax'

export const config = namespaced({
  main,
  atomic,
  wax,
})

export type Context = IContext<typeof config>

export const useAppState = createStateHook<Context>()
export const useActions = createActionsHook<Context>()
export const useEffects = createEffectsHook<Context>()
