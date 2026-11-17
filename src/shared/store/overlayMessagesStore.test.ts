import { getInitialOverlayMessagesState, useOverlayMessagesStore } from './overlayMessagesStore'

const state = () => useOverlayMessagesStore.getState()

beforeEach(() => {
  useOverlayMessagesStore.setState(getInitialOverlayMessagesState())
})

describe('useOverlayMessagesStore', () => {
  it('starts with no messages', () => {
    expect(state()).toMatchObject({ loadingMessage: null, infoMessage: null, errorMessage: null })
  })

  it('sets and clears each message', () => {
    state().setLoadingMessage('Onboarding in progress!')
    state().setInfoMessage('Your Mission reward has been claimed.')
    state().setErrorMessage('User denied transaction')
    expect(state()).toMatchObject({
      loadingMessage: 'Onboarding in progress!',
      infoMessage: 'Your Mission reward has been claimed.',
      errorMessage: 'User denied transaction',
    })

    state().setLoadingMessage(null)
    state().clearInfoMessage()
    state().clearErrorMessage()
    expect(state()).toMatchObject({ loadingMessage: null, infoMessage: null, errorMessage: null })
  })
})
