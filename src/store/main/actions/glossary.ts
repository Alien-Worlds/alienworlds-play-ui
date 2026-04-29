import { GlossaryData } from 'features/glossary/data/glossaryData'
import { GlossaryContent } from 'features/glossary/types/GlossaryTypes'
import { GlossaryCategoriesOptions } from 'features/glossary/utils/glossaryConst'
import { catchError, pipe } from 'overmind'
import { Context } from 'store'
import { toastErrorMessage } from 'store/main/actions'

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

const openGlossaryDrawer = pipe(({ state }: Context, glossaryId: number = null) => {
  state.main.glossaryDrawer.isOpen = true

  const selectedArticles = glossaryId ? searchArticlesById(glossaryId) : null

  if (selectedArticles) {
    state.main.glossaryDrawer.list = selectedArticles
  }
})

const closeGlossaryDrawer = pipe(({ actions }: Context) => {
  actions.main.glossary.resetState()
})

const searchArticlesByKeyword = pipe(({ state }: Context, searchKeyword: string) => {
  state.main.glossaryDrawer.searchKeyword = searchKeyword

  const lowercasedSearchKeyword = searchKeyword.toLowerCase()
  const selectedArticles = GlossaryData.filter((article) =>
    article.term.toLowerCase().includes(lowercasedSearchKeyword)
  )

  state.main.glossaryDrawer.list = selectedArticles
})

const openGlossaryDrawerContentDetails = pipe(
  async ({ state, effects }: Context, articleId: number) => {
    state.main.glossaryDrawer.isLoading = true
    state.main.glossaryDrawer.contentDetails = await effects.main.getZendeskArticle(articleId)
    state.main.glossaryDrawer.isLoading = false
  },
  catchError(({ state }: Context, error) => {
    console.error(error)
    toastErrorMessage(error?.message ?? 'Failed to fetch article.')
    state.main.glossaryDrawer.isLoading = false
  })
)

const resetGlossaryDrawerContentDetails = pipe(({ state }: Context) => {
  state.main.glossaryDrawer.contentDetails = null
})

const resetState = pipe(({ state }: Context) => {
  state.main.glossaryDrawer.isOpen = false
  state.main.glossaryDrawer.searchKeyword = null
  state.main.glossaryDrawer.contentDetails = null
  state.main.glossaryDrawer.list = null
  state.main.glossaryDrawer.selectedCategory = GlossaryCategoriesOptions[0].value
})

const setSelectedCategory = pipe(({ state }: Context, selectedCategory: string) => {
  state.main.glossaryDrawer.selectedCategory = selectedCategory
})

export {
  setSelectedCategory,
  openGlossaryDrawer,
  closeGlossaryDrawer,
  searchArticlesByKeyword,
  openGlossaryDrawerContentDetails,
  resetGlossaryDrawerContentDetails,
  resetState,
}
