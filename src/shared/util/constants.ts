export namespace Constants {
  // contracts
  export const CONTRACT_FEDERATION = 'federation'
  export const CONTRACT_DAO_WORLDS = 'dao.worlds'
  export const CONTRACT_MSIG_WORLDS = 'msig.worlds'
  export const CONTRACT_USER_POINTS = 'uspts.worlds'
  export const CONTRACT_TOKEN_WORLDS = 'token.worlds'
  export const CONTRACT_PLNTS_WORLDS = 'plnts.worlds'
  export const CONTRACT_ALIEN_WORLDS = 'alien.worlds'
  export const CONTRACT_INDEX_WORLDS = 'index.worlds'
  export const CONTRACT_STKVT_WORLDS = 'stkvt.worlds'
  export const CONTRACT_STAKE_WORLDS = 'stake.worlds'
  export const CONTRACT_M_FEDERATION = 'm.federation'
  export const CONTRACT_S_FEDERATION = 's.federation'
  export const CONTRACT_LAND_RATINGS = 'awlndratings'
  export const CONTRACT_BOOST_WORLDS = 'boost.worlds'
  export const CONTRACT_ATOMIC_ASSETS = 'atomicassets'
  export const CONTRACT_ALIEN_AVATARS = 'alienavatars'
  export const CONTRACT_LORE_WORLDS = 'lore.worlds'
  export const CONTRACT_COMP_WORLDS = 'comp.worlds'
  export const CONTRACT_EOSIO = 'eosio'

  // tables
  export const CONTRACT_TABLE_COMP = 'comps'
  export const CONTRACT_TABLE_DACS = 'dacs'
  export const CONTRACT_TABLE_BAGS = 'bags'
  export const CONTRACT_TABLE_MAPS = 'maps'
  export const CONTRACT_TABLE_STATS = 'stat'
  export const CONTRACT_TABLE_VOTES = 'votes'
  export const CONTRACT_TABLE_STAKE = 'stake'
  export const CONTRACT_TABLE_POOLS = 'pools'
  export const CONTRACT_TABLE_MINERS = 'miners'
  export const CONTRACT_TABLE_STATE3 = 'state3'
  export const CONTRACT_TABLE_STAKES = 'stakes'
  export const CONTRACT_TABLE_CONFIG = 'config'
  export const CONTRACT_TABLE_CLAIMS = 'claims'
  export const CONTRACT_TABLE_WEIGHT = 'weights'
  export const CONTRACT_TABLE_PLAYERS = 'players'
  export const CONTRACT_TABLE_REFUNDS = 'refunds'
  export const CONTRACT_TABLE_MEMBERS = 'members'
  export const CONTRACT_TABLE_UNSTAKE = 'unstake'
  export const CONTRACT_TABLE_REFUND = 'refund'
  export const CONTRACT_TABLE_PLANETS = 'planets'
  export const CONTRACT_TABLE_LOOKUPS = 'lookups'
  export const CONTRACT_TABLE_PAYOUTS = 'payouts'
  export const CONTRACT_TABLE_CONFIG2 = 'config2'
  export const CONTRACT_TABLE_LANDREGS = 'landregs'
  export const CONTRACT_TABLE_TRANSFER = 'transfer'
  export const CONTRACT_TABLE_UNSTAKES = 'unstakes'
  export const CONTRACT_TABLE_ACCOUNTS = 'accounts'
  export const CONTRACT_TABLE_LANDBOOSTS = 'boosts'
  export const CONTRACT_TABLE_USERTERMS = 'userterms'
  export const CONTRACT_TABLE_STAKETIME = 'staketime'
  export const CONTRACT_TABLE_PROPOSALS = 'proposals'
  export const CONTRACT_TABLE_APPROVALS = 'approvals'
  export const CONTRACT_TABLE_LANDCOMMS = 'landcomms'
  export const CONTRACT_TABLE_USERPOINTS = 'userpoints'
  export const CONTRACT_TABLE_CANDIDATES = 'candidates'
  export const CONTRACT_TABLE_DACGLOBALS = 'dacglobals'
  export const CONTRACT_TABLE_MINERCLAIM = 'minerclaim'
  export const CONTRACT_TABLE_CUSTODIANS = 'custodians1'
  export const CONTRACT_TABLE_MEMBERTERMS = 'memberterms'
  export const CONTRACT_TABLE_LEVELOFFERS = 'leveloffers'
  export const CONTRACT_TABLE_STAKECONFIG = 'stakeconfig'
  export const CONTRACT_TABLE_POINTOFFERS = 'pointoffers'
  export const CONTRACT_TABLE_PREMINTOFFERS = 'premintoffrs'
  export const CONTRACT_TABLE_LORE_DESPOSITS = 'desposits'
  export const CONTRACT_TABLE_LORE_GLOBALS = 'globals'
  export const CONTRACT_TABLE_LORE_GLOBALS_2 = 'globals2'
  export const CONTRACT_TABLE_TOKE_LORES = 'tokelores'
  export const CONTRACT_TABLE_VOTERS = 'voters'
  export const CONTRACT_TABLE_VOTERS_2 = 'voters2'
  export const CONTRACT_TABLE_WHITELIST = 'whitelist'

  // actions
  export const CONTRACT_LORE_WORLD_VOTE = 'vote'
  export const CONTRACT_LORE_WORLD_CLAIM_REWARD = 'claimreward'
  export const CONTRACT_EOSIO_BUY_RAM_BYTES = 'buyrambytes'
  export const CONTRACT_M_FEDERATION_ACTION_MINE = 'mine'
  export const CONTRACT_FEDERATION_ACTION_SETTAG = 'settag'
  export const CONTRACT_FEDERATION_ACTION_SETBAG = 'setbag'
  export const CONTRACT_MSIG_WORLDS_ACTION_EXECUTE = 'exec'
  export const CONTRACT_LAND_RATINGS_ACTION_BOOST = 'boost'
  export const CONTRACT_MSIG_WORLDS_ACTION_CANCEL = 'cancel'
  export const CONTRACT_FEDERATION_ACTION_SETLAND = 'setland'
  export const CONTRACT_MSIG_WORLDS_ACTION_PROPOSE = 'propose'
  export const CONTRACT_MSIG_WORLDS_ACTION_CLEANUP = 'cleanup'
  export const CONTRACT_MSIG_WORLDS_ACTION_APPROVE = 'approve'
  export const CONTRACT_DAO_WORLDS_ACTION_VOTECUST = 'votecust'
  export const CONTRACT_DAO_WORLDS_ACTION_STPROFILE = 'stprofile'
  export const CONTRACT_DAO_WORLDS_ACTION_SETDAOGOV = 'setdaogov'
  export const CONTRACT_DAO_WORLDS_ACTION_SETPERIODLEN = 'setperiodlen'
  export const CONTRACT_M_FEDERATION_ACTION_SETDAOGOV = 'setdaogov'
  export const CONTRACT_FEDERATION_ACTION_PLTDTAPSET = 'pltdtapset'
  export const CONTRACT_LAND_RATINGS_ACTION_OPENSLOT = 'openslot'
  export const CONTRACT_LAND_RATINGS_ACTION_CLAIMPAY = 'claimpay'
  export const CONTRACT_ALIEN_WORLDS_ACTION_TRANSFER = 'transfer'
  export const CONTRACT_FEDERATION_ACTION_AGREETERMS = 'agreeterms'
  export const CONTRACT_TOKEN_WORLDS_ACTION_MEMBERREG = 'memberreg'
  export const CONTRACT_M_FEDERATION_ACTION_CLAIMNFTS = 'claimnfts'
  export const CONTRACT_LAND_RATINGS_ACTION_MEGABOOST = 'megaboost'
  export const CONTRACT_LAND_RATINGS_ACTION_SUPERBOOST = 'superboost'
  export const CONTRACT_M_FEDERATION_ACTION_CLAIMCOMMS = 'claimcomms'
  export const CONTRACT_M_FEDERATION_ACTION_CLAIMMINES = 'claimmines'
  export const CONTRACT_DAO_WORLDS_ACTIONS_CLAIMBUDGET = 'claimbudget'
  export const CONTRACT_DAO_WORLDS_ACTION_NOMINATECANE = 'nominatecane'
  export const CONTRACT_DAO_WORLDS_ACTION_WITHDRAWCANE = 'withdrawcane'
  export const CONTRACT_FEDERATION_ACTION_SETPROFITSHR = 'setprofitshr'
  export const CONTRACT_LAND_RATINGS_ACTION_SETMINBOOST = 'setminboost'
  export const CONTRACT_M_FEDERATION_ACTION_CLAIMNFTPTS = 'claimnftpts'
  export const CONTRACT_USER_POINTS_ACTION_REDEEMPNTNFT = 'redeempntnft'
  export const CONTRACT_USER_POINTS_ACTION_REDEEMPRENFT = 'redeemprenft'
  export const CONTRACT_USER_POINTS_ACTION_REDEEMLVLNFT = 'redeemlvlnft'
  export const CONTRACT_TOKEN_WORLDS_ACTION_CLAIMUNSTKES = 'claimunstkes'
  export const CONTRACT_USER_POINTS_ACTION_REGUSER = 'reguser'
  export const CONTRACT_FEDERATION_ACTION_SETAVATAR = 'setavatar'
  export const CONTRACT_COMP_ACTION_CLAIM = 'claim'

  // events
  export const GA_AW_ERROR = 'aw_error'
  export const GA_AW_LOGIN = 'aw_login'
  export const GA_PAGE_VISIT = 'page_visit'
  export const GA_FIRST_VISIT = 'first_visit'
  export const GA_CHAIN_CHANGED = 'chain_changed'
  export const GA_MINE_CLAIMED_ERROR = 'mine_claimed_error'
  export const GA_MINE_CLAIMED_SUCCESS = 'mine_claimed_success'
  export const GA_AW_ONBOARDING_LAND = 'onboarding_land'
  export const GA_AW_ONBOARDING_SIGNUP = 'onboarding_signup'
  export const GA_AW_ONBOARDING_AVATAR = 'onboarding_avatar'
  export const GA_AW_ONBOARDING_PLANET = 'onboarding_planet'
  export const GA_AW_ONBOARDING_NEWSLETTER_CANCEL = 'onboarding_newsletter_cancel'
  export const GA_AW_ONBOARDING_NEWSLETTER_SUBSCRIBE = 'onboarding_newsletter_subscribe'
  export const GA_SYNDICATES_ADD_VP = 'add_vote_power'
  export const GA_SYNDICATES_STAKE_VP = 'stake_vote_power'
  export const GA_SYNDICATES_CONVERT_TKN = 'convert_token'
  export const GA_SYNDICATES_CHANGE_PLANET = 'change_planet'
  export const GA_SYNDICATES_UNSTAKE_VP = 'unstake_vote_power'
  export const GA_SYNDICATES_STAKE_VP_RELEASE = 'stake_vote_power_release'
  export const GA_SYNDICATES_PLANET_SELECT_EXPLORE = 'planet_select_explore'
  export const GA_SYNDICATES_PLANET_SELECT_CONVERT = 'planet_select_convert'
  export const GA_SYNDICATES_OVERLAY_CONVERT_TO = 'convert_token_overlay_to'
  export const GA_SYNDICATES_OVERLAY_CONVERT_FROM = 'convert_token_overlay_from'
  export const GA_SYNDICATES_STAKE_VP_OVERLAY_STAKE = 'stake_vote_power_overlay_stake'
  export const GA_SYNDICATES_STAKE_VP_OVERLAY_CANCEL = 'stake_vote_power_overlay_cancel'
  export const GA_MISSIONS_JOIN = 'mission_join'
  export const GA_MISSIONS_SET_ALLOWANCE = 'allowance_set'
  export const GA_MISSIONS_NEWSLETTER_SUB = 'newsletter_sub'
  export const GA_MISSIONS_JOIN_SUCCESS = 'mission_join_success'
  export const GA_MISSIONS_NEWSLETTER_UNSUB = 'newsletter_unsub'
  export const GA_MISSIONS_REWARDS_CLAIMED_ERROR = 'rewards_claimed_error'
  export const GA_MISSIONS_REWARDS_CLAIMED_SUCCESS = 'rewards_claimed_success'

  // demo
  export const MAIN_TOPBAR_HEIGHT: number = 77
  export const DEMO_TOPBAR_HEIGHT: number = 36
  export const DEMO_LOGIN_DURATION: number = 2000
  export const DEMO_ACCOUNT_TAG: string = 'demo.wam'
  export const DEMO_TOPBAR_HEIGHT_MOBILE: number = 72

  // images

  export const DEFAULT_PROFILE_IMAGE_URL = '/images/alienworlds-profile-sample01.jpg'

  // general
  export const WAX_PAGE_LIMIT: number = 1000
  export const MAIN_DRAWER_HEIGHT: number = 200
  export const DEFAULT_LAND_OPENSLOTS: number = 1
  export const WAX_DEFAULT_PAGE_NUMBER: number = 1
  export const DEFAULT_TOKEN_PRECISION: number = 4
  export const DEFAULT_LAND_RATING: number = 1000000
  export const DAC_CANDIDACY_STAKE_AMOUNT: number = 5000
  export const DEFAULT_VISIBLE_ASSETS_COUNT: number = 30
  export const DEFAULT_LAND_MIN_BOOST_AMOUNT: number = 0
  export const GOVERNANCE_MIN_STAKE_AMOUNT: number = 0.0001
  export const MAXED_TEMPLATES: Set<number> = new Set([
    13728, 19451, 19452, 19453, 19454, 19455, 19456, 19457, 19458, 19459, 19460, 19461, 19462,
    19463, 19464, 19465, 19466, 19467, 19468, 19469, 19470, 19471, 19472, 19473, 19474, 19475,
    19476, 19477, 19478, 19479, 19480, 19481, 19482, 19483, 19484, 19485, 19486, 19487, 19488,
    19489, 19490, 19491, 19492, 19493, 19494, 19495, 19496, 19497, 19498, 19499, 19500, 19501,
    19502, 19503, 19504, 19505, 19506, 19507, 19508, 19509, 19510, 19511, 19512, 19513, 19514,
    19515, 19516, 19517, 19518, 19519, 19520, 19521, 19522, 19523, 19524, 19525, 19526, 19527,
    19528, 19529, 19530, 19531, 19532, 19533, 19534, 19535, 19536, 19537, 19538, 19539, 19540,
    19541, 19542, 19543, 19544, 19545, 19546, 19547, 19548, 19549, 19550, 19551, 19554, 19655,
    28422, 28423, 28424, 28425, 44933, 44934, 56039, 56042, 235640, 235641, 235642, 235643, 235644,
    235645, 235646, 235647, 254350, 254351,
  ])
}
