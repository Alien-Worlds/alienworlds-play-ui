import {
  GlossaryContent,
  GlossaryContentRaw,
  GlossaryId,
} from 'features/glossary/types/GlossaryTypes'

const normalizeRelatedIds = (relatedIds?: GlossaryContentRaw['relatedIds']): GlossaryId[] => {
  if (!relatedIds) {
    return []
  }

  return relatedIds
    .split(',')
    .map((id) => id.trim())
    .filter((id) => id.length > 0)
    .map((id) => Number.parseInt(id, 10))
    .filter((id) => Number.isFinite(id))
}

const normalizeGlossaryEntry = (entry: GlossaryContentRaw): GlossaryContent => ({
  ...entry,
  relatedIds: normalizeRelatedIds(entry.relatedIds),
  zendeskId: entry.zendeskId ?? null,
})

export const GlossaryDataRaw: GlossaryContentRaw[] = [
  {
    id: 1,
    relatedIds: '2,3,4,6,7',
    zendeskId: 1500010131701,
    product: 'Alien Worlds on WAX',
    termCategory: 'Blockchain',
    term: 'WAX Trillium',
    description: 'Trilium on the WAX blockchain.',
  },
  {
    id: 2,
    relatedIds: '1,3',
    zendeskId: 4403474954131,
    product: 'WAX Chain',
    termCategory: 'Blockchain',
    term: 'WAX Blockchain',
    description:
      'A DPOS (Delegated Proof of Stake Blockchain) leveraging the EOSIO (Antelope.io) Protocol. This allows fast transactions and easy user onboarding.',
  },
  {
    id: 3,
    relatedIds: '1,3',
    zendeskId: 6211519338899,
    product: 'WAX Chain',
    termCategory: 'Blockchain',
    term: 'WAX Cloud Wallet',
    description:
      'The WAX Cloud Wallet is the main wallet used on the WAX Blockchain. The browser-based wallet used to access and perform actions on the WAX Blockchain. The WCW is available through the browser at https://wax.wallet.io/',
  },
  {
    id: 4,
    relatedIds: '2,4,5,6,7',
    zendeskId: 4403474954131,
    product: 'WAX Chain',
    termCategory: 'Blockchain',
    term: 'WAX Resources',
    description:
      'For users to perform actions on the WAX Blockchain they will need virtual resources. There are different resources for different uses. The main ones are: CPU, NET, RAM.',
  },
  {
    id: 5,
    relatedIds: '2,3,4,6,7',
    zendeskId: 1500011589402,
    product: 'WAX Chain',
    termCategory: 'Resources',
    term: 'CPU',
    description: 'Processing time of an action, measured in microseconds.',
  },
  {
    id: 6,
    relatedIds: '2,3,4,6,7',
    zendeskId: 4403474954131,
    product: 'WAX Chain',
    termCategory: 'Resources',
    term: 'NET',
    description: 'Throughput capacity of the WAX network, measured in bytes.',
  },
  {
    id: 7,
    relatedIds: '2,3,4,5,6,7',
    zendeskId: 4403474954131,
    product: 'WAX Chain',
    termCategory: 'Resources',
    term: 'RAM',
    description: 'Stores data of dApps in the blockchain.',
  },
  {
    id: 8,
    relatedIds: '8,9,10,11,12,14,15,16,17,19,21,23,28,32,35,41,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: null,
    product: 'Alien Worlds on BNB',
    termCategory: 'Blockchain',
    term: 'BNB Trilium',
    description: 'Trilium on the BNB blockchain.',
  },
  {
    id: 9,
    relatedIds: '8,9,10,11,12,14,15,16,17,19,21,23,28,32,35,41,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: null,
    product: 'BNB Chain',
    termCategory: 'Blockchain',
    term: 'BNB Blockchain',
    description:
      'The blockchain from Binance using their native token BNB. This BNB Token powers the BNB ecosystem.',
  },
  {
    id: 10,
    relatedIds: '8,9,11,12,14,15,16,17,19,21,23,28,32,35,41,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: 4404413800851,
    product: 'BNB Chain',
    termCategory: 'Resources',
    term: 'Gas',
    description: 'This is a small fee in BNB needed to perform transactions on the BNB Chain.',
  },
  {
    id: 11,
    relatedIds: null,
    product: 'General',
    zendeskId: null,
    termCategory: 'Blockchain',
    term: 'Token',
    description:
      'A crypto token can be considered virtual currency also known as cryptocurrency. It represents a tradable asset or utility that resides on a blockchain and allows the holder to use it for a variety of purposes.',
  },
  {
    id: 12,
    relatedIds: '13',
    product: 'General',
    termCategory: 'Blockchain',
    term: 'Wallet',
    description:
      'A cryptocurrency wallet is a digital wallet on a mobile or desktop device that allows cryptocurrency users to access their digital assets or tokens.',
  },
  {
    id: 13,
    relatedIds: '8,9,11,12,14,15,16,17,19,21,23,28,32,35,41,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: 1500007791661,
    product: 'General',
    termCategory: 'Blockchain',
    term: 'Signing a transaction',
    description:
      'This is how a wallet holder can interact with a smart contract on a blockchain. Signing a transaction proves an action is done by a specific wallet. These transactions are published on the blockchain.',
  },
  {
    id: 14,
    relatedIds: '13',
    product: 'General',
    termCategory: 'Blockchain',
    term: 'TX (Transaction)',
    description:
      'A transaction or TX can be simply a transfer of tokens or a series of actions on the blockchain. The term transaction or TX will be shown as a receipt of an action performed on the blockchain.',
  },
  {
    id: 15,
    relatedIds: '2,4,6,7',
    product: 'General',
    termCategory: 'Blockchain',
    term: 'Smart contract',
    description:
      'A smart contract is a program that is run on the blockchain. Smart contracts can be directly interacted with from a wallet. Users can call actions on a smart contract that have pre-determined business or game logic.',
  },
  {
    id: 16,
    relatedIds: '30,31,34',
    product: 'General',
    termCategory: 'Blockchain',
    term: 'NFT',
    description:
      'A Non-Fungible Token or NFT (NFT) is a cryptographic asset on a blockchain with unique identification codes and metadata that distinguish them from each other. NFTs can be used for in-game engagement. NFTs can also be used for access to events or provide utility for specific wallet holders.',
  },
  {
    id: 17,
    relatedIds: '2,4,6,7',
    product: 'General',
    termCategory: 'Blockchain',
    term: 'Web3',
    description:
      'Web3 is an idea for a new iteration of the World Wide Web based on blockchain technology, which incorporates concepts such as decentralization and token-based ownership. It is the successor to web1 (the original content-based internet) and web2 (the social-based internet with centralized platforms).',
  },
  {
    id: 18,
    relatedIds: '8,9,11,12,14,15,16,17,19,21,23,28,32,35,41,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: 1500007804182,
    product: 'General',
    termCategory: 'Blockchain',
    term: 'Governance',
    description:
      'Blockchain governance exists in various forms. At a blockchain level, token holders can vote for who should run/host the blockchain. At a community level, communities use governance to moderate community actions, vote, or show support for who should be responsible for community resources.',
  },
  {
    id: 19,
    relatedIds: '18,20,44,47,48,49,50,52,53,54,63,66,67,68',
    product: 'General',
    termCategory: 'Blockchain',
    term: 'Consensus',
    description:
      'Consensus in blockchain can be used to trigger actions for a group or community. In blockchain communities, there are many consensus models to send community resources or to signal what actions should be taken or how to proceed.',
  },
  {
    id: 20,
    relatedIds: '8,9,11,12,14,15,16,17,19,21,23,28,32,35,41,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: 1500007804182,
    product: 'General',
    termCategory: 'Blockchain',
    term: 'DAOs | DACs',
    description:
      'DAOs or DACs are known as Decentralized Autonomous Organizations, Decentralized Autonomous Communities | Corporations. These terms can be used to describe digital communities that hold a collective resource pool with the aid of a blockchain ledger. They decide how to manage these resources through governance through various consensus models. These communities have the ability to develop their own terms and culture and to decide what are acceptable forms of engagement between the community members.',
  },
  {
    id: 21,
    relatedIds: '40',
    product: 'General',
    termCategory: 'Blockchain',
    term: 'Staking',
    description:
      "A method for a token or NFT holder to participate in an activity that “locks up” the digital item for a period of time in a smart contract. This time commitment of locking up one's digital items allows additional resources to be allocated to the user. Often, Staking provides the Staked user additional rewards or actions within a digital community.",
  },
  {
    id: 22,
    relatedIds:
      '8,9,11,12,14,15,16,17,19,21,23,24,25,27,28,32,35,36,41,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: 1500010130541,
    product: 'WAX Mining',
    termCategory: 'Mining',
    term: 'Mining',
    description:
      'The act of collecting Trilium on a planet and/or land by selecting a specific land and using distinctive tools.',
  },
  {
    id: 23,
    relatedIds: '22,24,25,27',
    product: 'WAX Mining',
    termCategory: 'Mining',
    term: 'Cooldown',
    description:
      'The time it takes until your tools are ready for the next mine. It consists of the tool cooldown and the land cooldown multiplier ((tool1_cooldown+tool2_cooldown+tool3_cooldown)*land_cooldown_multiplier)=total_cooldown). If you are using two tools, the tool with the smaller cooldown is halved. If you are using 3 tools, the smallest tool cooldown is ignored.',
  },
  {
    id: 24,
    relatedIds: '8,9,11,12,14,15,16,17,19,21,23,25,27,28,32,35,41,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: 1500008438781,
    product: 'WAX Mining',
    termCategory: 'Mining',
    term: 'PoW',
    description:
      'PoW stands for “Proof of Work reduction” and indicates how much faster the tool will perform the mining action itself. This is most noticeable with mobile devices. It is not connected to the tool cooldown.',
  },
  {
    id: 25,
    relatedIds:
      '8,9,10,11,12,14,15,16,17,19,21,22,23,24,28,32,35,41,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: 1500010317302,
    product: 'WAX Mining',
    termCategory: 'Mining',
    term: 'Charge time',
    description: 'See Cooldown.',
  },
  {
    id: 26,
    relatedIds: '8,9,10,11,12,14,15,16,17,19,21,23,28,32,35,41,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: 1500011442202,
    product: 'WAX Mining',
    termCategory: 'Mining',
    term: 'Shining',
    description:
      'The act of combining four identical NFTs and some TLM to create one shined version of that NFT. A shined NFT can be rarer and provide additional utility. ',
  },
  {
    id: 27,
    relatedIds: '8,9,10,11,12,14,15,16,17,19,21,22,23,28,32,35,41,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: 1500010317302,
    product: 'WAX Mining',
    termCategory: 'Mining',
    term: 'Mining Power',
    description: 'The relative power an Alien Worlds tool NFT has in the mining game.',
  },
  {
    id: 28,
    relatedIds: '22',
    product: 'WAX Mining',
    termCategory: 'Mining',
    term: 'Pot Sniping',
    description: 'The act of timing the mining pot to maximize Trilium mined per attempt.',
  },
  {
    id: 29,
    relatedIds: '30',
    zendeskId: 1500007789241,
    product: 'WAX Mining',
    termCategory: 'Mining',
    term: 'Planets',
    description:
      'There are currently seven Planets in Alien Worlds. Six of these planets have their own DAOs. These planets have land which are NFTs and are used for a variety of activities. Inflation from the Mining Game supports the Syndicates to fill up with the token Trilium. ',
  },
  {
    id: 30,
    relatedIds: '29',
    zendeskId: 1500007811082,
    product: 'WAX Mining',
    termCategory: 'Mining',
    term: 'Land',
    description:
      'Land NFTs represent Land on each of the six Planets. Holders of Land NFTs receive a commission of the Trilium mined on the Land. Land NFT holders can choose the commission rate for mining on their Land.',
  },
  {
    id: 31,
    relatedIds: '31',
    zendeskId: 1500010083642,
    product: 'WAX Mining',
    termCategory: 'Mining',
    term: 'Avatar',
    description:
      'An NFT game card that represents the player and can be equipped to be visible in the UI. It belongs to the NFT schema “faces.worlds” in the alien.worlds collection. It has no stats.',
  },
  {
    id: 32,
    product: 'WAX Mining',
    termCategory: 'Mining',
    term: 'Explorer',
    description: 'Another term for an Alien Worlds player/user.',
  },
  {
    id: 33,
    relatedIds: '31',
    zendeskId: 4410319529491,
    product: 'WAX Mining',
    termCategory: 'Mining',
    term: 'Minions',
    description:
      'NFT game cards representing fighters. They have different stats like attack, defense, and move cost.',
  },
  {
    id: 34,
    relatedIds: '8,9,11,12,14,15,16,17,19,21,23,28,32,35,41,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: 4410319258771,
    product: 'WAX Mining',
    termCategory: 'Mining',
    term: 'Rarity',
    description:
      'An Attribute of all NFT game cards. The different rarities, from low to high are:\r\nAbundant, Common, Rare, Epic, Legendary, Mythic.',
  },
  {
    id: 35,
    relatedIds: '29',
    product: 'WAX Mining',
    termCategory: 'Mining',
    term: 'DTAL',
    description:
      '“Daily Trilium Allocation to Landholders”. TLM received by landholders daily for owning Alien Worlds land NFTs.',
  },
  {
    id: 36,
    relatedIds: '37,38',
    zendeskId: 1500010317302,
    product: 'WAX Mining',
    termCategory: 'Mining',
    term: 'NFT Power',
    description:
      'Attribute of tool NFT game cards that determines how many Shards the tool earns when mining (see mining calculation).',
  },
  {
    id: 37,
    relatedIds: '25,27,36',
    zendeskId: 6417236739731,
    product: 'WAX Mining',
    termCategory: 'Mining',
    term: 'Shards',
    description:
      'Shards that are earned by mining with tool NFT game cards of Common or above rarity. Shards are not transferable.',
  },
  {
    id: 38,
    relatedIds: '25,27,36',
    zendeskId: 6417236739731,
    product: 'WAX Mining',
    termCategory: 'Mining',
    term: 'Experience',
    description:
      'By earning Shards, an Explorer’s Experience also increases. The Experience points can be used to claim Rank NFTs once for each Rank, without diminishing the total Experience points. There are 10 Ranks in the mining game.',
  },
  {
    id: 39,
    relatedIds: '22,25,27,36',
    zendeskId: 1500007524322,
    product: 'WAX Mining',
    termCategory: 'Mining',
    term: 'Mining Calculations',
    description:
      'These formulas determine the TLM and Shard rewards from mining.\r\nTLM per mine = (tool1_mining_power + tool2_mining_power + tool3_mining_power) * land_mining_multiplier\r\nShards per mine = (tool1_NFT_power + tool2_NFT_power + tool3_NFT_power) * land_NFT_multiplier\r\nTool Cooldown / Mining Delay\r\nFor 1 equipped tool: Cooldown as stated on the tool NFT game card\r\nFor 2 equipped tools: The smaller tool cooldown gets halved\r\nFor 3 equipped tools: The smallest tool cooldown gets ignored\r',
  },
  {
    id: 40,
    relatedIds: '8,9,11,12,14,15,16,17,19,21,23,28,32,35,41,43,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: 4406530759955,
    product: 'BNB Missions',
    termCategory: 'Missions',
    term: 'Alien Worlds Missions',
    description:
      'The Trilium staking game activity on the BNB blockchain whereby Explorers stake TLM to complete Missions and receive a TLM and NFT reward upon return/completion. ',
  },
  {
    id: 41,
    relatedIds: '40,43',
    product: 'BNB Missions',
    termCategory: 'Missions',
    term: 'BNB Staked Trilium',
    description: 'BNB Trilium sent on a Mission in the Missions game.',
  },
  {
    id: 42,
    relatedIds: '8,9,11,12,14,15,16,17,19,21,23,28,32,35,40,41,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: 1500012518322,
    product: 'BNB Missions',
    termCategory: 'Missions',
    term: 'Teleport',
    description:
      'The Trilium token bridge to send TLM to and from the WAX to BNB or Ethereum blockchains. Teleport is accessible at https://teleport.alienworlds.io/',
  },
  {
    id: 43,
    relatedIds: '40',
    zendeskId: 4405195780371,
    product: 'BNB Missions',
    termCategory: 'Missions',
    term: 'Staked Trilium',
    description: 'Trilium locked up for a duration on a Mission.',
  },
  {
    id: 44,
    relatedIds: '8,9,11,12,14,15,16,17,19,21,23,28,32,35,41,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: 1500007804182,
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Syndicates',
    description:
      'There are six Syndicates in Alien Worlds running on the WAX Blockchain. These Planetary DAOs represent gaming communities and their resources, which Members are encouraged to “take over.” Running a Syndicate is achieved through electing a Planetary Council that can control their Treasuries.',
  },
  {
    id: 45,
    relatedIds: '18,20,44,47,48,49,50,52,53,54,63,66,67,68',
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Member',
    description:
      "A Member is one who has Signed a Transaction of the latest Member Terms on a Syndicate. This allows them to Vote for Candidates to manage the Syndicates. Membership of a Planet may allow for the participation of other Syndicates' activities, determined by the community.",
  },
  {
    id: 46,
    relatedIds: '18,20,44,47,48,49,50,52,53,54,63,66,67,68',
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Member Terms',
    description:
      'The agreement that is signed by the Explorers to participate in a Syndicate. To participate in any activity within a Syndicate, one must become a Member of that respective Syndicate by Signing a Transaction of the latest Member Terms.',
  },
  {
    id: 47,
    relatedIds: '8,9,11,12,14,15,16,17,19,21,23,28,32,35,41,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: 1500007804182,
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Staked TLM',
    description:
      'Staked TLM is used for governance on each of the Syndicate. Each of the Planets has their own staked TLM.\r\n\r\nStaked TLM can be Vote-Power-Staked and used for Planetary Governance, specifically Voting for Custodians of the Syndicates. These tokens can be swapped to and from Trilium with no delay. Converting from a Staked TLM Token to another planet´s Staked TLM does have a delay based on how long the Staked TLM are chosen to be staked.',
  },
  {
    id: 48,
    relatedIds: '8,9,11,12,14,15,16,17,19,21,23,28,32,35,41,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: 1500007804182,
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Vote-Power-Staked TLM',
    description:
      'Vote Power Staked TLM is used for Governance on the Syndicates. When Staked TLM is Staked for Vote Power, they provide Voting Weight for the Syndicate Members. The more Staked TLM is held and the longer it is staked, the more Voting Weight is given to the Member.\r\n\r\nSyndicate Staking is a commitment to lock up tokens for a specified period of time. This period of time will begin when the Staked Tokens are Unstaked. If you have Staked TLM Tokens, you will not be able to use it until you Unstake and wait the Staking time you committed to.',
  },
  {
    id: 49,
    relatedIds: '8,9,11,12,14,15,16,17,19,21,23,28,32,35,41,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: 1500007804182,
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Unstaking Planetary Token',
    description:
      'The Staking duration committed to by the user begins when a Staked TLM Token is Unstaked, and a player is no longer receiving resources in exchange for their Staked Tokens.',
  },
  {
    id: 50,
    relatedIds: '8,9,11,12,14,15,16,17,19,21,23,28,32,35,41,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: 1500007804182,
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Unstake Action',
    description:
      'This is required to Unstake Staked TLM. This action triggers a smart contract to begin the process of returning the Staked TLM from the Vote-Power-Staked TLM to the user.',
  },
  {
    id: 51,
    relatedIds: '8,9,11,12,14,15,16,17,19,21,23,28,32,35,41,45,46,55,56,57,58,59,61,62,64,65,',
    zendeskId: 1500007804182,
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Custodian',
    description:
      'A Custodian is one of the elected Planetary Council members of a Syndicate. There are five Custodians per Syndicate. These Custodians are elected from voting by the Staked TLM Token Holders.',
  },
  {
    id: 52,
    relatedIds: '8,9,11,12,14,15,16,17,19,21,23,28,32,35,41,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: 1500007804182,
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Candidate',
    description:
      'A Candidate runs to be a Member of a Planetary Council. The Planetary Council are Custodians of the Syndicate. Elections for Council are ongoing.',
  },
  {
    id: 53,
    relatedIds: '8,9,11,12,14,15,16,17,19,21,23,28,32,35,41,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: 1500007804182,
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Voting Period',
    description:
      'Voting Period, Election Period or Period is the duration for which the Council is Elected. This time is set at one week.',
  },
  {
    id: 54,
    relatedIds: '8,9,11,12,14,15,16,17,19,21,23,28,32,35,41,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: 1500007804182,
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Planetary Council',
    description:
      'Each Syndicate has its own Planetary Council. The Planetary Council makes decisions on how to manage their Syndicate’s Spendings Account. The Planetary Council consists of five Custodians. These Custodians have been elected by the Members. Every week, there is a new Period that re-tabulates the votes for the Candidates.\r\n\r\nThe Planetary Council has the ability to Claim weekly Resources of Trilium from the Treasuries and Approve Proposals.',
  },
  {
    id: 55,
    relatedIds: '18,20,44,47,48,49,50,52,53,54,63,66,67,68',
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Snap Election',
    description:
      'The Syndicate Election occurs when there is a Snap Election. This occurs when a Custodian Resigns or when a custodian is fired with the firecust action that requires sufficient consensus from the other custodians.',
  },
  {
    id: 56,
    relatedIds: '18,20,44,47,48,49,50,52,53,54,63,66,67,68',
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Voting Weight',
    description:
      'Voting Weight equates to the amount of voting power a member has to vote for Candidates. Voting Weight is determined by\r\nvoteWeight = stakedAmount * (1 + (multiplier * unstakeTime / maxStakeTime))\r',
  },
  {
    id: 57,
    relatedIds: '18,20,44,47,48,49,50,52,53,54,63,66,67,68',
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Vote Decay',
    description:
      'Staked TLM Tokens decay the moment they are staked. To minimize Vote Decay - to retain optimal voting power– Staked TLM Tokens can be staked again or Voted with for Candidates.',
  },
  {
    id: 58,
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Initial Quorum Event Percent',
    description:
      'The Initial Quorum Event Percent is the percent of TLM Staked needed for a Syndicate to be Activated. The sum needed of TLM Staked to activate a Syndicate is set at 0%.',
  },
  {
    id: 59,
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Ongoing Quorum Percent',
    description:
      'The Ongoing Quorum Event Percent is the percent of TLM Token Staked needed to keep a Syndicate Activated. The sum of TLM Token Staked needed to keep a Syndicate activated is set at 0%.',
  },
  {
    id: 60,
    relatedIds: '8,9,11,12,14,15,16,17,19,21,23,28,32,35,41,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: 4410387323539,
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Treasury Account',
    description:
      'Syndicate Treasury Accounts exist for each of the Alien Worlds Planets. There are a total of six Syndicate Treasury Accounts. These accounts can be viewed on the WAX blockchain:\n\nneri.world https://wax.bloks.io/account/neri.world\nnaron.world https://wax.bloks.io/account/naron.world\nkavian.world https://wax.bloks.io/account/kavian.world\nveles.world https://wax.bloks.io/account/veles.world\neyeke.world https://wax.bloks.io/account/eyeke.world\nmagor.world https://wax.bloks.io/account/magor.world',
  },
  {
    id: 61,
    relatedIds: '60',
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Spendings Account',
    description:
      'The WAX-based Spendings Accounts contain the Planetary Resources supported by the Allocations from the Planetary Treasuries. The Planetary Council has the authority to interact with the Planetary Treasuries via multi-signature consensus. The Planetary Council can Claim their weekly Spendings Allocation.',
  },
  {
    id: 62,
    relatedIds: '60',
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Spendings Allocation',
    description:
      'This is the percent of Trilium that is distributed once per Voting Period, available for the Custodians of the Planetary Council to Claim.\r\n\r\nThe Spendings Allocation per Voting Period is set at 1%',
  },
  {
    id: 63,
    relatedIds: '8,9,11,12,14,15,16,17,19,21,23,28,32,35,41,45,46,55,56,57,58,59,61,62,64,65,',
    zendeskId: 1500007804182,
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Candidacy',
    description:
      'To run for Council of a Syndicate, a user must register to be a Candidate by Staking to a Syndicate. This will allow them to run for Council on that specific Syndicate.',
  },
  {
    id: 64,
    relatedIds: '8,9,11,12,14,15,16,17,19,21,23,28,32,35,41,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: 1500011618701,
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Register to be a Candidate',
    description:
      'If one would like to run to be a Candidate to potentially be elected on a Planetary Council they must Register to be a Candidate and stake at least 5000TLM worth of Staked TLM Tokens on a Planet.',
  },
  {
    id: 65,
    relatedIds: '64',
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Resign Custodianship',
    description:
      'When a Custodian would like to take a break from their custodianship they are able to resign. If a Custodian would like to take a break in their activities, they are able to resign, and the votes that are delegated to them will remain if they wish to return to the Planetary Council.',
  },
  {
    id: 66,
    relatedIds: '8,9,11,12,14,15,16,17,19,21,23,28,32,35,41,45,46,55,56,57,58,59,61,62,65,',
    zendeskId: 1500007804182,
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Proposals',
    description:
      'A Proposal allows the Council to send out Trilium to support a project. Any Member of a Syndicate can submit a Proposal.  ',
  },
  {
    id: 67,
    zendeskId: 1500007804182,
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Worker Proposals',
    description: 'A way for a Member to receive resources for their contribution on a Syndicate.',
  },
  {
    id: 68,
    zendeskId: 1500007804182,
    product: 'Planetary DAOs',
    termCategory: 'DAOs',
    term: 'Worker Proposal System',
    description:
      'A system for organizing Proposals between the Syndicate Councils and Members that wish to receive resources for their contributions.',
  },
]

export const GlossaryData: GlossaryContent[] = GlossaryDataRaw.map(normalizeGlossaryEntry)
