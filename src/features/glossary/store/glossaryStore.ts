import { GlossaryData } from 'features/glossary/data/glossaryData'
import { GlossaryContent, GlossaryDrawerState } from 'features/glossary/types/GlossaryTypes'
import { GlossaryCategoriesOptions } from 'features/glossary/utils/glossaryConst'
import { toastErrorMessage } from 'store/main/actions'
import { getZendeskArticle } from 'store/main/effects'
import { create } from 'zustand'

const searchArticlesById = (glossaryId: number): GlossaryContent[] => {
  const selectedArticles = GlossaryData.filter((article) => article.id === glossaryId)

  if (selectedArticles.length === 0) {
    return []
  }

  const relatedIds = selectedArticles.reduce<Set<number>>((accumulator, article) => {
    article.relatedIds.forEach((id) => {
      if (id !== glossaryId) {
        accumulator.add(id)
      }
    })

    return accumulator
  }, new Set<number>())

  const relatedArticles = GlossaryData.filter((article) => relatedIds.has(article.id))

  const combinedArticles = [...selectedArticles, ...relatedArticles]

  const uniqueArticles = new Map<number, GlossaryContent>()
  combinedArticles.forEach((article) => {
    if (!uniqueArticles.has(article.id)) {
      uniqueArticles.set(article.id, article)
    }
  })

  return Array.from(uniqueArticles.values())
}

const getDefaultGlossaryDrawerState = (): GlossaryDrawerState => ({
  isOpen: false,
  isLoading: false,
  searchKeyword: null,
  contentDetails: null,
  list: null,
  selectedCategory: GlossaryCategoriesOptions[0].value,
})

export interface GlossaryStore {
  glossaryDrawer: GlossaryDrawerState
  openGlossaryDrawer: (glossaryId?: number | null) => void
  closeGlossaryDrawer: () => void
  searchArticlesByKeyword: (searchKeyword: string) => void
  openGlossaryDrawerContentDetails: (articleId: number) => Promise<void>
  resetGlossaryDrawerContentDetails: () => void
  setSelectedCategory: (selectedCategory: string) => void
}

export const useGlossaryStore = create<GlossaryStore>((set, get) => ({
  glossaryDrawer: getDefaultGlossaryDrawerState(),

  openGlossaryDrawer: (glossaryId = null) => {
    const selectedArticles = glossaryId ? searchArticlesById(glossaryId) : null

    set({
      glossaryDrawer: {
        ...get().glossaryDrawer,
        isOpen: true,
        ...(selectedArticles ? { list: selectedArticles } : {}),
      },
    })
  },

  closeGlossaryDrawer: () => {
    set({ glossaryDrawer: getDefaultGlossaryDrawerState() })
  },

  searchArticlesByKeyword: (searchKeyword) => {
    const lowercasedSearchKeyword = searchKeyword.toLowerCase()
    const list = GlossaryData.filter((article) =>
      article.term.toLowerCase().includes(lowercasedSearchKeyword)
    )

    set({ glossaryDrawer: { ...get().glossaryDrawer, searchKeyword, list } })
  },

  openGlossaryDrawerContentDetails: async (articleId) => {
    set({ glossaryDrawer: { ...get().glossaryDrawer, isLoading: true } })

    try {
      const contentDetails = await getZendeskArticle(articleId)
      set({ glossaryDrawer: { ...get().glossaryDrawer, contentDetails, isLoading: false } })
    } catch (error) {
      console.error(error)
      toastErrorMessage(error?.message ?? 'Failed to fetch article.')
      set({ glossaryDrawer: { ...get().glossaryDrawer, isLoading: false } })
    }
  },

  resetGlossaryDrawerContentDetails: () => {
    set({ glossaryDrawer: { ...get().glossaryDrawer, contentDetails: null } })
  },

  setSelectedCategory: (selectedCategory) => {
    set({ glossaryDrawer: { ...get().glossaryDrawer, selectedCategory } })
  },
}))
