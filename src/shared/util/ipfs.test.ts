import { fetchIpfsText } from './ipfs'

jest.mock('./config', () => ({ config: { IpfsApiUrl: 'https://ipfs.example' } }))

const mockFetch = jest.fn()

describe('fetchIpfsText', () => {
  beforeEach(() => {
    mockFetch.mockReset()
    global.fetch = mockFetch
  })

  it('reads the file as text', async () => {
    mockFetch.mockResolvedValue({ ok: true, text: async () => '# Member terms' })

    expect(await fetchIpfsText('QmTerms')).toBe('# Member terms')
    expect(mockFetch).toHaveBeenCalledWith('https://ipfs.example/QmTerms')
  })

  it("throws when the file can't be loaded", async () => {
    mockFetch.mockResolvedValue({ ok: false })
    await expect(fetchIpfsText('QmTerms')).rejects.toThrow('Failed to load IPFS file QmTerms')
  })
})
