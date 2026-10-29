import { useSessionStore } from 'shared/store/sessionStore'

import { loadPremintOffers } from './premintOffers'

jest.mock('shared/util/config', () => ({ config: { DemoUserWaxAccount: 'demo.wam' } }))

const mockGetTablePage = jest.fn()
jest.mock('shared/wax/tables', () => ({
  getTablePage: (query: unknown) => mockGetTablePage(query),
}))

const mockGetTemplatesByIds = jest.fn()
jest.mock('shared/util/atomicassets', () => ({
  getTemplatesByIds: (ids: string[]) => mockGetTemplatesByIds(ids),
}))

const offer = (offer_id: number, template_id: number) => ({
  offer_id,
  template_id,
  required: 1000,
  available_count: 3,
  creator: 'creator.wam',
  collection_name: 'community',
  message: '',
})
const template = (template_id: string) => ({
  template_id,
  immutable_data: { name: `NFT ${template_id}`, img: `Qm${template_id}` },
})

const query = {
  table: 'premintoffrs',
  scope: 'uspts.worlds',
  code: 'uspts.worlds',
  key_type: '',
  limit: 10,
  reverse: true,
}

describe('loadPremintOffers', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    useSessionStore.setState({ isLoggedIn: true })
    mockGetTablePage.mockResolvedValue({
      rows: [offer(2, 20), offer(1, 10)],
      more: true,
      next_key: '1',
    })
    mockGetTemplatesByIds.mockResolvedValue([template('10'), template('20')])
  })

  afterEach(() => {
    useSessionStore.setState({ isLoggedIn: false })
  })

  it('reads the first page of offers, newest first', async () => {
    await loadPremintOffers({ lowerBound: null, fetchLimit: 10 })
    expect(mockGetTablePage).toHaveBeenCalledWith(query)
  })

  it('reads the next page from the previous next_key', async () => {
    await loadPremintOffers({ lowerBound: 42, fetchLimit: 10 })
    expect(mockGetTablePage).toHaveBeenCalledWith({ ...query, upper_bound: '42' })
  })

  it("adds each offer's template as its asset and keeps the paging info", async () => {
    const page = await loadPremintOffers({ lowerBound: null, fetchLimit: 10 })

    expect(mockGetTemplatesByIds).toHaveBeenCalledWith(['20', '10'])
    expect(page).toEqual({
      more: true,
      next_key: '1',
      rows: [
        { ...offer(2, 20), asset: { ...template('20'), data: template('20').immutable_data } },
        { ...offer(1, 10), asset: { ...template('10'), data: template('10').immutable_data } },
      ],
    })
  })

  it('leaves out offers whose template is missing', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {})
    mockGetTemplatesByIds.mockResolvedValue([template('10')])

    const page = await loadPremintOffers({ lowerBound: null, fetchLimit: 10 })

    expect(page.rows.map((row) => row.offer_id)).toEqual([1])
    expect(console.error).toHaveBeenCalledWith('Template 20 not found for points offer 2')
    jest.restoreAllMocks()
  })

  it('returns an empty page without fetching templates', async () => {
    mockGetTablePage.mockResolvedValue({ rows: [], more: false, next_key: '' })

    expect(await loadPremintOffers({ lowerBound: null, fetchLimit: 10 })).toEqual({
      rows: [],
      more: false,
      next_key: '',
    })
    expect(mockGetTemplatesByIds).not.toHaveBeenCalled()
  })

  it('returns an empty last page when logged out, without reading the chain', async () => {
    useSessionStore.setState({ isLoggedIn: false })

    expect(await loadPremintOffers({ lowerBound: null, fetchLimit: 10 })).toEqual({
      rows: [],
      more: false,
      next_key: '',
    })
    expect(mockGetTablePage).not.toHaveBeenCalled()
  })
})
