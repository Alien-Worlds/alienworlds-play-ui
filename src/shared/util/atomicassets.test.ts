import { getTemplatesByIds } from './atomicassets'

jest.mock('./config', () => ({ config: { AtomicAssetsApiUrl: 'https://atomic.example' } }))

const mockGetTemplates = jest.fn()
jest.mock('atomicassets', () => ({
  ExplorerApi: class {
    getTemplates = (options: unknown) => mockGetTemplates(options)
  },
}))

describe('getTemplatesByIds', () => {
  beforeEach(() => mockGetTemplates.mockReset())

  it('reads the templates by their ids', async () => {
    mockGetTemplates.mockResolvedValue([{ template_id: '10' }, { template_id: '20' }])

    expect(await getTemplatesByIds(['10', '20'])).toEqual([
      { template_id: '10' },
      { template_id: '20' },
    ])
    expect(mockGetTemplates).toHaveBeenCalledWith({ ids: '10,20' })
  })

  it('returns no templates without ids, without calling the API', async () => {
    expect(await getTemplatesByIds([])).toEqual([])
    expect(mockGetTemplates).not.toHaveBeenCalled()
  })
})
