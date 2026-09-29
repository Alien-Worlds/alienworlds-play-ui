import { fetchLorePullRequestCommitMessage, fetchLorePullRequests, fetchLoreReadMe } from './github'

const mockFetch = (body: unknown, ok = true, status = 200) =>
  jest.spyOn(global, 'fetch').mockResolvedValue({
    ok,
    status,
    json: async () => body,
  } as Response)

describe('lore GitHub api', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('fetches the open pull requests of the-lore', async () => {
    const pulls = [{ number: 1, title: 'Fix', html_url: 'https://github.com/x/pull/1' }]
    const fetchSpy = mockFetch(pulls)

    expect(await fetchLorePullRequests()).toEqual(pulls)
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://api.github.com/repos/Alien-Worlds/the-lore/pulls',
      expect.objectContaining({ headers: expect.any(Object) })
    )
  })

  it("returns the first commit's message of a pull request", async () => {
    const fetchSpy = mockFetch([
      { commit: { message: 'Add chapter' } },
      { commit: { message: 'x' } },
    ])

    expect(await fetchLorePullRequestCommitMessage(7)).toBe('Add chapter')
    expect(fetchSpy.mock.calls[0][0]).toBe(
      'https://api.github.com/repos/Alien-Worlds/the-lore/pulls/7/commits'
    )
  })

  it('returns an empty message for a pull request without commits', async () => {
    mockFetch([])
    expect(await fetchLorePullRequestCommitMessage(7)).toBe('')
  })

  it('decodes and renders the README to HTML', async () => {
    mockFetch({ content: btoa('# The Lore') })
    expect(await fetchLoreReadMe()).toContain('The Lore</h1>')
  })

  it('throws on a non-2xx response', async () => {
    mockFetch({ message: 'API rate limit exceeded' }, false, 403)
    await expect(fetchLorePullRequests()).rejects.toThrow('GitHub request failed (403)')
  })
})
