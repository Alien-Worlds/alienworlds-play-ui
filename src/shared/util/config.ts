interface Config {
  AlienWorldsUrl: string
  AlienWorldsName: string
  AtomicAssetsApiUrl: string
  BscChainId: number
  DiscordUrl: string
  SupportAlienUrl: string
  GoogleAnalytics: string
  HyperionApiUrl: string
  IsDevelopment: boolean
  IsProduction: boolean
  MediumUrl: string
  MissionsApiUrl: string
  MissionsContract: string
  MissionsNftContract: string
  MissionsTlmContract: string
  NodeEnvironment: string
  TelegramUrl: string
  WaxApiUrl: string
  WaxSigningUrl: string
  ActivePlanetIds: string
  ZendeskUrl: string
  AppVersion: string
  AppEnv: string
  ActiveDacIds: string
  DaoApiUrl: string
  DaoCandidacyTermsIpfs: string
  CouncilPolicyUrl: string
  UserAgreementUrl: string
  IpfsApiUrl: string
  LeaderboardApiUrl: string
  WalletConnectProjectId: string
  WalletConnectDappUrl: string
  ArenaPortalApiUrl: string
  ArenaCategoriesApiUrl: string
  DemoUserWaxAccount: string
  DemoUserPublicKey: string
  WaxMainnetChainId: string
  ArticlesApiUrl: string
  CMSApiToken: string
  WaxFetchApiUrl: string
  graphQLApiUrl: string
}

const {
  REACT_APP_ALIEN_WORLDS_URL,
  REACT_APP_AW_NAME,
  REACT_APP_ATOMIC_ASSETS_API_URL,
  REACT_APP_BSC_CHAIN_ID,
  REACT_APP_DISCORD_URL,
  REACT_APP_SUPPORT_ALIENWORLDS_URL,
  REACT_APP_GA,
  REACT_APP_HYPERION_API_URL,
  REACT_APP_MEDIUM_URL,
  REACT_APP_MISSIONS_API_URL,
  REACT_APP_MISSIONS_MISSIONS_CONTRACT,
  REACT_APP_MISSIONS_NFT_CONTRACT,
  REACT_APP_MISSIONS_TLM_CONTRACT,
  NODE_ENV,
  REACT_APP_TELEGRAM_URL,
  REACT_APP_WAX_API_URL,
  REACT_APP_WAX_SIGNING_URL,
  REACT_APP_ACTIVE_PLANET_IDS,
  REACT_APP_ZENDESK_URL,
  REACT_APP_ENV,
  REACT_APP_ACTIVE_DAC_IDS,
  REACT_APP_DAO_API,
  REACT_APP_DAO_CANDIDACY_TERMS_IPFS,
  REACT_APP_COUNCIL_POLICY_URL,
  REACT_APP_USER_AGREEMENT_URL,
  REACT_APP_IPFS_API_URL,
  REACT_APP_LEADERBOARD_API_URL,
  REACT_APP_WALLETCONNECT_PROJECT_ID,
  REACT_APP_WALLETCONNECT_DAPP_URL,
  REACT_APP_ARENA_CMS_API_URL,
  REACT_APP_ARENA_CATEGORIES_CMS_API_URL,
  REACT_APP_CMS_API_TOKEN,
  REACT_APP_DEMO_USER_ACCOUNT,
  REACT_APP_DEMO_USER_PUBKEY,
  REACT_APP_WAX_MAINNET_CHAIN_ID,
  REACT_APP_ARTICLES_CMS_API_URL,
  REACT_APP_WAX_FETCH_URL,
  REACT_APP_GRAPHQL_API_URL,
} = process.env

export const config: Config = {
  AlienWorldsUrl: REACT_APP_ALIEN_WORLDS_URL ?? null,
  AlienWorldsName: REACT_APP_AW_NAME ?? null,
  AtomicAssetsApiUrl: REACT_APP_ATOMIC_ASSETS_API_URL ?? null,
  BscChainId: Number.isNaN(Number(REACT_APP_BSC_CHAIN_ID)) ? null : Number(REACT_APP_BSC_CHAIN_ID),
  DiscordUrl: REACT_APP_DISCORD_URL ?? null,
  SupportAlienUrl: REACT_APP_SUPPORT_ALIENWORLDS_URL ?? null,
  GoogleAnalytics: REACT_APP_GA ?? null,
  HyperionApiUrl: REACT_APP_HYPERION_API_URL ?? null,
  WaxFetchApiUrl: REACT_APP_WAX_FETCH_URL ?? null,
  IsDevelopment: NODE_ENV === 'development',
  IsProduction: NODE_ENV === 'production',
  MediumUrl: REACT_APP_MEDIUM_URL ?? null,
  MissionsApiUrl: REACT_APP_MISSIONS_API_URL ?? null,
  MissionsContract: REACT_APP_MISSIONS_MISSIONS_CONTRACT ?? null,
  MissionsNftContract: REACT_APP_MISSIONS_NFT_CONTRACT ?? null,
  MissionsTlmContract: REACT_APP_MISSIONS_TLM_CONTRACT ?? null,
  NodeEnvironment: NODE_ENV ?? null,
  TelegramUrl: REACT_APP_TELEGRAM_URL ?? null,
  WaxApiUrl: REACT_APP_WAX_API_URL ?? null,
  WaxSigningUrl: REACT_APP_WAX_SIGNING_URL ?? null,
  ZendeskUrl: REACT_APP_ZENDESK_URL ?? null,
  AppVersion: process.env.REACT_APP_VERSION ?? null,
  AppEnv: REACT_APP_ENV ?? null,
  ActivePlanetIds: REACT_APP_ACTIVE_PLANET_IDS ?? null,
  ActiveDacIds: REACT_APP_ACTIVE_DAC_IDS ?? null,
  DaoApiUrl: REACT_APP_DAO_API ?? null,
  DaoCandidacyTermsIpfs: REACT_APP_DAO_CANDIDACY_TERMS_IPFS ?? null,
  CouncilPolicyUrl: REACT_APP_COUNCIL_POLICY_URL ?? null,
  UserAgreementUrl: REACT_APP_USER_AGREEMENT_URL ?? null,
  IpfsApiUrl: REACT_APP_IPFS_API_URL ?? null,
  LeaderboardApiUrl: REACT_APP_LEADERBOARD_API_URL ?? null,
  WalletConnectProjectId: REACT_APP_WALLETCONNECT_PROJECT_ID ?? null,
  WalletConnectDappUrl: REACT_APP_WALLETCONNECT_DAPP_URL ?? null,
  ArenaPortalApiUrl: REACT_APP_ARENA_CMS_API_URL ?? null,
  ArenaCategoriesApiUrl: REACT_APP_ARENA_CATEGORIES_CMS_API_URL ?? null,
  DemoUserWaxAccount: REACT_APP_DEMO_USER_ACCOUNT ?? null,
  DemoUserPublicKey: REACT_APP_DEMO_USER_PUBKEY ?? null,
  WaxMainnetChainId: REACT_APP_WAX_MAINNET_CHAIN_ID ?? null,
  CMSApiToken: REACT_APP_CMS_API_TOKEN ?? null,
  ArticlesApiUrl: REACT_APP_ARTICLES_CMS_API_URL ?? null,
  graphQLApiUrl: REACT_APP_GRAPHQL_API_URL ?? null,
}
