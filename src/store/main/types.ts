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
