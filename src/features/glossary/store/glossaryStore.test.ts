import { act, renderHook, waitFor } from '@testing-library/react'

const mockGetZendeskArticle = jest.fn()
jest.mock('store/main/effects', () => ({
  getZendeskArticle: (...args: unknown[]) => mockGetZendeskArticle(...args),
}))

const mockToastErrorMessage = jest.fn()
jest.mock('store/main/actions', () => ({
  toastErrorMessage: (...args: unknown[]) => mockToastErrorMessage(...args),
}))

// eslint-disable-next-line import/first
import { useGlossaryStore } from './glossaryStore'

const initialState = useGlossaryStore.getState()

describe('useGlossaryStore', () => {
  afterEach(() => {
    jest.clearAllMocks()
    act(() => {
      useGlossaryStore.setState(initialState, true)
    })
  })

  it('starts with the drawer closed and no article selected', () => {
    const { result } = renderHook(() => useGlossaryStore())

    expect(result.current.glossaryDrawer.isOpen).toBe(false)
    expect(result.current.glossaryDrawer.contentDetails).toBeNull()
    expect(result.current.glossaryDrawer.list).toBeNull()
    expect(result.current.glossaryDrawer.selectedCategory).toBe('All')
  })

  it('openGlossaryDrawer opens the drawer without changing the list when no id is given', () => {
    const { result } = renderHook(() => useGlossaryStore())

    act(() => {
      result.current.openGlossaryDrawer()
    })

    expect(result.current.glossaryDrawer.isOpen).toBe(true)
    expect(result.current.glossaryDrawer.list).toBeNull()
  })

  it('openGlossaryDrawer(id) opens the drawer and populates the list with the article and its related entries', () => {
    const { result } = renderHook(() => useGlossaryStore())

    act(() => {
      result.current.openGlossaryDrawer(1)
    })

    expect(result.current.glossaryDrawer.isOpen).toBe(true)
    const ids = result.current.glossaryDrawer.list.map((article) => article.id)
    expect(ids).toContain(1)
    expect(ids.length).toBeGreaterThan(1)
  })

  it('closeGlossaryDrawer resets the drawer back to its default state', () => {
    const { result } = renderHook(() => useGlossaryStore())

    act(() => {
      result.current.openGlossaryDrawer(1)
    })
    act(() => {
      result.current.setSelectedCategory('Blockchain')
    })
    act(() => {
      result.current.closeGlossaryDrawer()
    })

    expect(result.current.glossaryDrawer.isOpen).toBe(false)
    expect(result.current.glossaryDrawer.list).toBeNull()
    expect(result.current.glossaryDrawer.selectedCategory).toBe('All')
  })

  it('searchArticlesByKeyword filters articles by term and stores the keyword', () => {
    const { result } = renderHook(() => useGlossaryStore())

    act(() => {
      result.current.searchArticlesByKeyword('trillium')
    })

    expect(result.current.glossaryDrawer.searchKeyword).toBe('trillium')
    expect(result.current.glossaryDrawer.list.length).toBeGreaterThan(0)
    result.current.glossaryDrawer.list.forEach((article) => {
      expect(article.term.toLowerCase()).toContain('trillium')
    })
  })

  it('searchArticlesByKeyword returns an empty list for a keyword that matches nothing', () => {
    const { result } = renderHook(() => useGlossaryStore())

    act(() => {
      result.current.searchArticlesByKeyword('no-such-term-exists')
    })

    expect(result.current.glossaryDrawer.list).toEqual([])
  })

  it('openGlossaryDrawerContentDetails loads the article and clears isLoading', async () => {
    const contentDetails = { id: 1500010131701, title: 'WAX Trillium', description: 'desc' }
    mockGetZendeskArticle.mockResolvedValueOnce(contentDetails)
    const { result } = renderHook(() => useGlossaryStore())

    await act(async () => {
      await result.current.openGlossaryDrawerContentDetails(1500010131701)
    })

    expect(mockGetZendeskArticle).toHaveBeenCalledWith(1500010131701)
    expect(result.current.glossaryDrawer.contentDetails).toEqual(contentDetails)
    expect(result.current.glossaryDrawer.isLoading).toBe(false)
  })

  it('openGlossaryDrawerContentDetails toasts an error and clears isLoading when the fetch fails', async () => {
    mockGetZendeskArticle.mockRejectedValueOnce(new Error('network down'))
    const { result } = renderHook(() => useGlossaryStore())

    await act(async () => {
      await result.current.openGlossaryDrawerContentDetails(123)
    })

    await waitFor(() => {
      expect(mockToastErrorMessage).toHaveBeenCalledWith('network down')
    })
    expect(result.current.glossaryDrawer.isLoading).toBe(false)
  })

  it('resetGlossaryDrawerContentDetails clears the selected article without closing the drawer', () => {
    const { result } = renderHook(() => useGlossaryStore())

    act(() => {
      result.current.openGlossaryDrawer(1)
    })
    act(() => {
      useGlossaryStore.setState({
        glossaryDrawer: {
          ...useGlossaryStore.getState().glossaryDrawer,
          contentDetails: { id: 1, title: 't', description: 'd' },
        },
      })
    })
    act(() => {
      result.current.resetGlossaryDrawerContentDetails()
    })

    expect(result.current.glossaryDrawer.contentDetails).toBeNull()
    expect(result.current.glossaryDrawer.isOpen).toBe(true)
  })

  it('setSelectedCategory updates the selected category', () => {
    const { result } = renderHook(() => useGlossaryStore())

    act(() => {
      result.current.setSelectedCategory('Blockchain')
    })

    expect(result.current.glossaryDrawer.selectedCategory).toBe('Blockchain')
  })
})
