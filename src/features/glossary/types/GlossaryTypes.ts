export type GlossaryId = number

export interface GlossaryContentDetails {
  id: GlossaryId
  title: string
  description: string
}

export interface GlossaryContentRaw {
  id: GlossaryId
  relatedIds?: string | null // contains comma separated ids
  zendeskId?: number | null
  product: string
  termCategory: string
  term: string
  description: string
}

export interface GlossaryContent {
  id: GlossaryId
  relatedIds: GlossaryId[]
  zendeskId: number | null
  product: string
  termCategory: string
  term: string
  description: string
}

export interface GlossaryDrawerState {
  isOpen: boolean
  searchKeyword: string | null
  contentDetails: GlossaryContentDetails | null
  isLoading: boolean
  list: GlossaryContent[] | null
  selectedCategory: string | null
}
