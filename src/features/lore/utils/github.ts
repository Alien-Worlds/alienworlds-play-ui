import showdown from 'showdown'

import { LorePullRequest } from '../types/loreTypes'

const LORE_REPO_API = 'https://api.github.com/repos/Alien-Worlds/the-lore'

const getJson = async (path: string) => {
  const response = await fetch(`${LORE_REPO_API}${path}`, {
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
    },
  })
  if (!response.ok) throw new Error(`GitHub request failed (${response.status}): ${path}`)
  return response.json()
}

/** Open pull requests on the-lore repo: the candidates a player can submit as a lore proposal. */
export const fetchLorePullRequests = async (): Promise<LorePullRequest[]> => getJson('/pulls')

/** Message of a pull request's first commit, used to prefill the proposal description. */
export const fetchLorePullRequestCommitMessage = async (pullNumber: number): Promise<string> => {
  const commits = await getJson(`/pulls/${pullNumber}/commits`)
  return commits[0]?.commit.message ?? ''
}

/** the-lore README rendered to HTML. */
export const fetchLoreReadMe = async (): Promise<string> => {
  const { content } = await getJson('/contents/README.md')
  return new showdown.Converter().makeHtml(atob(content))
}
