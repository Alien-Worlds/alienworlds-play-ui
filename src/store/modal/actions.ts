import { catchError, pipe } from 'overmind'
import { PrimaryModal, SecondaryModal } from 'store/modal/types'

import { Context } from '..'

export const onInitializeOvermind = async () => {}

export const resetAllSecondaryModals = pipe(
  ({ state }: Context) => {
    Object.keys(state.modal.secondaryModals).forEach((key) => {
      state.modal.secondaryModals[key] = false
    })
    state.modal.secondaryModals.onConfirm = null

    state.modal.secondaryModals.onCancel = null
    state.modal.errorType = null
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)
export const setSecondaryModalActive = pipe(
  (
    { state, actions }: Context,
    { modalName, value, onConfirm = null, onCancel = null, errorType = null }: SecondaryModal
  ) => {
    actions.modal.resetAllSecondaryModals()

    state.modal.secondaryModals[modalName] = value
    state.modal.secondaryModals.onConfirm = onConfirm
    state.modal.secondaryModals.onCancel = onCancel
    state.modal.errorType = errorType
  },

  catchError((_: Context, error) => {
    console.error(error)
  })
)

export const resetAllPrimaryModals = pipe(
  ({ state }: Context) => {
    Object.keys(state.modal.secondaryModals).forEach((key) => {
      state.modal.primaryModals[key] = false
    })
    state.modal.errorType = null
  },
  catchError((_: Context, error) => {
    console.error(error)
  })
)
export const setPrimaryModalActive = pipe(
  (
    { state, actions }: Context,
    { modalName, value, onConfirm = null, onCancel = null, errorType = null }: PrimaryModal
  ) => {
    actions.modal.resetAllPrimaryModals()

    state.modal.primaryModals[modalName] = value
    state.modal.primaryModals.onConfirm = onConfirm
    state.modal.primaryModals.onCancel = onCancel
    state.modal.errorType = errorType
  },

  catchError((_: Context, error) => {
    console.error(error)
  })
)
