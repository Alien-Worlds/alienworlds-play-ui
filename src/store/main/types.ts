export enum PagePath {
  Home = '/inventory',
  NewsletterJoin = '/newsletter',
  SignUp = '/signup',
  Onboarding = '/onboarding',
  OnboardingLand = '/onboarding/land',
  OnboardingPlanet = '/onboarding/planet',
  Inventory = '/inventory',
  Shining = '/shining',
  GovernanceSelect = '/syndicates',
  GovernanceDetails = '/syndicates/:planetId',
  DAOSelect = '/dao/:planetId',
  GovernanceCandidates = '/syndicates/:planetId/candidates',
  GovernanceBecomeCandidate = '/syndicates/:planetId/register',
  GovernanceManageCandidacy = '/syndicates/:planetId/manage',
  GovernanceCustodianDashboard = '/syndicates/:planetId/dashboard',
  GovernanceMemberTerms = '/syndicates/:planetId/memberterms',
  GovernanceSignCandidateVote = '/syndicates/:planetId/signcandidatevote',
  GovernanceCandidateProfile = '/syndicates/:planetId/signcandidatevote/:walletId',
  Missions = '/missions',
  MissionsInventory = '/missions/inventory',
  MissionsExplorer = '/missions/my',
  MissionDetails = '/missions/:id',
  MissionJoin = '/missions/:id/join',
  Mining = '/mining',
  Tools = '/mining/tools',
  Planet = '/mining/planet',
  Land = '/mining/land',
  LandSubpage = '/mining/land/:id',
  MiningLeaderboard = '/mining/leaderboard',
  MiningLeaderboardProfile = '/mining/leaderboard/:id',
  LandMgt = '/landMgt',
  LandMgtSubpage = '/landMgt/:id',
  Profile = '/profile',
  ProfileInfo = '/profile/info',
  ProfileBalances = '/profile/balances',
  ProfileSubpage = '/profile/:id',
  Outpost = '/outpost',
  Error = '/error',
  ArenaPortal = '/arena',
  TokenizedLore = '/lore',
  Competitions = '/competitions',
}

export enum Rarity {
  UNKNOWN = 0,
  ABUNDANT = 1,
  COMMON = 2,
  RARE = 3,
  EPIC = 4,
  LEGENDARY = 5,
  MYTHICAL = 6,
}

export enum Shine {
  UNKNOWN = 0,
  STONE = 1,
  GOLD = 2,
  STARDUST = 3,
  ANTIMATTER = 4,
  XDIMENSION = 5,
}

export enum Process {
  UNKNOWN = 0,
  CATALYST = 1,
  FUSION = 2,
  MATERIAL = 3,
}

export enum Element {
  UNKNOWN = 0,
  AIR = 1,
  FIRE = 2,
  GEM = 3,
  METAL = 4,
  NATURE = 5,
  NEUTRAL = 6,
}

export type LandOwnerDrawerType = {
  slotNumber: number
}

export enum WalletType {
  WAX = 'wax',
  ANCHOR = 'anchor',
  WOMBAT = 'wombat',
}

export interface User {
  login: string
  id: number
  node_id: string
  avatar_url: string
  gravatar_id: string
  url: string
  html_url: string
  followers_url: string
  following_url: string
  gists_url: string
  starred_url: string
  subscriptions_url: string
  organizations_url: string
  repos_url: string
  events_url: string
  received_events_url: string
  type: string
  site_admin: boolean
}

export interface Repo {
  id: number
  node_id: string
  name: string
  full_name: string
  private: boolean
  owner: User
  html_url: string
  description: string | null
  fork: boolean
  url: string
  forks_url: string
  keys_url: string
  collaborators_url: string
  teams_url: string
  hooks_url: string
  issue_events_url: string
  events_url: string
  assignees_url: string
  branches_url: string
  tags_url: string
  blobs_url: string
  git_tags_url: string
  git_refs_url: string
  trees_url: string
  statuses_url: string
  languages_url: string
  stargazers_url: string
  contributors_url: string
  subscribers_url: string
  subscription_url: string
  commits_url: string
  git_commits_url: string
  comments_url: string
  issue_comment_url: string
  contents_url: string
  compare_url: string
  merges_url: string
  archive_url: string
  downloads_url: string
  issues_url: string
  pulls_url: string
  milestones_url: string
  notifications_url: string
  labels_url: string
  releases_url: string
  deployments_url: string
  created_at: string
  updated_at: string
  pushed_at: string
  git_url: string
  ssh_url: string
  clone_url: string
  svn_url: string
  homepage: string | null
  size: number
  stargazers_count: number
  watchers_count: number
  language: string | null
  has_issues: boolean
  has_projects: boolean
  has_downloads: boolean
  has_wiki: boolean
  has_pages: boolean
  has_discussions: boolean
  forks_count: number
  mirror_url: string | null
  archived: boolean
  disabled: boolean
  open_issues_count: number
  license: string | null
  allow_forking: boolean
  is_template: boolean
  web_commit_signoff_required: boolean
  topics: string[]
  visibility: string
  forks: number
  open_issues: number
  watchers: number
  default_branch: string
}

export interface Links {
  self: { href: string }
  html: { href: string }
  issue: { href: string }
  comments: { href: string }
  review_comments: { href: string }
  review_comment: { href: string }
  commits: { href: string }
  statuses: { href: string }
}

export interface PullRequest {
  url: string
  id: number
  node_id: string
  html_url: string
  diff_url: string
  patch_url: string
  issue_url: string
  number: number
  state: string
  locked: boolean
  title: string
  user: User
  body: string
  created_at: string
  updated_at: string
  closed_at: string | null
  merged_at: string | null
  merge_commit_sha: string | null
  assignee: null
  assignees: any[]
  requested_reviewers: any[]
  requested_teams: any[]
  labels: any[]
  milestone: null
  draft: boolean
  commits_url: string
  review_comments_url: string
  review_comment_url: string
  comments_url: string
  statuses_url: string
  head: {
    label: string
    ref: string
    sha: string
    user: User
    repo: Repo
  }
  base: {
    label: string
    ref: string
    sha: string
    user: User
    repo: Repo
  }
  _links: Links
  author_association: string
  auto_merge: null
  active_lock_reason: null
}
