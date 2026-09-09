import { act, renderHook } from '@testing-library/react'
import { ErrorTypes } from 'features/syndicates/types/governanceTypes'

import { useModalStore } from './modalStore'

const initialState = useModalStore.getState()

describe('useModalStore', () => {
  afterEach(() => {
    act(() => {
      useModalStore.setState(initialState, true)
    })
  })

  it('starts with every modal closed and inactive', () => {
    const { result } = renderHook(() => useModalStore())

    expect(result.current.isModalActive).toBe(false)
    expect(result.current.errorType).toBeNull()
    expect(result.current.primaryModals.LoginModal).toBe(false)
    expect(result.current.secondaryModals.VideoPlayerModal).toBe(false)
  })

  it('opens a secondary modal and marks isModalActive true', () => {
    const { result } = renderHook(() => useModalStore())
    const onConfirm = jest.fn()

    act(() => {
      result.current.setSecondaryModalActive({
        modalName: 'VideoPlayerModal',
        value: true,
        onConfirm,
      })
    })

    expect(result.current.secondaryModals.VideoPlayerModal).toBe(true)
    expect(result.current.secondaryModals.onConfirm).toBe(onConfirm)
    expect(result.current.isModalActive).toBe(true)
  })

  it('setSecondaryModalActive closes any other open secondary modal (only one open at a time)', () => {
    const { result } = renderHook(() => useModalStore())

    act(() => {
      result.current.setSecondaryModalActive({ modalName: 'VideoPlayerModal', value: true })
    })
    act(() => {
      result.current.setSecondaryModalActive({
        modalName: 'ExternalLinkDisclaimerModal',
        value: true,
      })
    })

    expect(result.current.secondaryModals.VideoPlayerModal).toBe(false)
    expect(result.current.secondaryModals.ExternalLinkDisclaimerModal).toBe(true)
  })

  it('resetAllSecondaryModals closes every secondary modal and clears callbacks/errorType', () => {
    const { result } = renderHook(() => useModalStore())

    act(() => {
      result.current.setSecondaryModalActive({
        modalName: 'VideoPlayerModal',
        value: true,
        onConfirm: jest.fn(),
        onCancel: jest.fn(),
        errorType: ErrorTypes.CANDIDATE_CANNOT_UNSTAKE,
      })
    })
    act(() => {
      result.current.resetAllSecondaryModals()
    })

    expect(result.current.secondaryModals.VideoPlayerModal).toBe(false)
    expect(result.current.secondaryModals.onConfirm).toBeNull()
    expect(result.current.secondaryModals.onCancel).toBeNull()
    expect(result.current.errorType).toBeNull()
    expect(result.current.isModalActive).toBe(false)
  })

  it('opens a primary modal and marks isModalActive true', () => {
    const { result } = renderHook(() => useModalStore())

    act(() => {
      result.current.setPrimaryModalActive({ modalName: 'LoginModal', value: true })
    })

    expect(result.current.primaryModals.LoginModal).toBe(true)
    expect(result.current.isModalActive).toBe(true)
  })

  it('setPrimaryModalActive closes any other open primary modal (only one open at a time)', () => {
    const { result } = renderHook(() => useModalStore())

    act(() => {
      result.current.setPrimaryModalActive({ modalName: 'LoginModal', value: true })
    })
    act(() => {
      result.current.setPrimaryModalActive({ modalName: 'SignUpModal', value: true })
    })

    expect(result.current.primaryModals.LoginModal).toBe(false)
    expect(result.current.primaryModals.SignUpModal).toBe(true)
  })

  it('resetAllPrimaryModals closes every primary modal (regression test for the ported bug fix)', () => {
    const { result } = renderHook(() => useModalStore())

    act(() => {
      result.current.setPrimaryModalActive({ modalName: 'LoginModal', value: true })
    })
    act(() => {
      result.current.resetAllPrimaryModals()
    })

    expect(result.current.primaryModals.LoginModal).toBe(false)
    expect(result.current.primaryModals.onConfirm).toBeNull()
    expect(result.current.primaryModals.onCancel).toBeNull()
    expect(result.current.errorType).toBeNull()
    expect(result.current.isModalActive).toBe(false)
  })

  it('keeps primary and secondary modals independent of each other', () => {
    const { result } = renderHook(() => useModalStore())

    act(() => {
      result.current.setPrimaryModalActive({ modalName: 'LoginModal', value: true })
    })
    act(() => {
      result.current.setSecondaryModalActive({ modalName: 'VideoPlayerModal', value: true })
    })

    expect(result.current.primaryModals.LoginModal).toBe(true)
    expect(result.current.secondaryModals.VideoPlayerModal).toBe(true)

    act(() => {
      result.current.resetAllSecondaryModals()
    })

    expect(result.current.primaryModals.LoginModal).toBe(true)
    expect(result.current.secondaryModals.VideoPlayerModal).toBe(false)
  })
})
