import { ErrorTypes } from 'features/syndicates/types/governanceTypes'
import { derived } from 'overmind'
import { getDefaultSecondaryModalState, getDefaultPrimaryModalState } from 'store/modal/helpers'
import { PrimaryModalWithActions, SecondaryModalWithActions } from 'store/modal/types'

export type ModalsState = {
  secondaryModals: SecondaryModalWithActions
  primaryModals: PrimaryModalWithActions
  errorType: ErrorTypes
  isModalActive: boolean
}

export const defaultState: ModalsState = {
  secondaryModals: getDefaultSecondaryModalState(),
  primaryModals: getDefaultPrimaryModalState(),
  errorType: null,
  isModalActive: derived((state: ModalsState) => {
    const isPrimaryModalActive: boolean = Object.values(state.primaryModals).some(
      (value) => value === true
    )
    const isSecondaryModalActive: boolean = Object.values(state.secondaryModals).some(
      (value) => value === true
    )
    return isPrimaryModalActive || isSecondaryModalActive
  }),
}

export const state: ModalsState = {
  ...defaultState,
}
