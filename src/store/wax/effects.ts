import { Buffer } from 'buffer'

import { WaxJS } from '@waxio/waxjs/dist'
import { APIClient, Serializer } from '@wharfkit/session'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { JsonRpc } from 'eosjs'
import { TransactResult } from 'eosjs/dist/eosjs-api-interfaces'
import { RarityPoolsResponse } from 'features/mining/types/RarityPoolTypes'
import { MainBoostLevels } from 'features/mining/utils/constants'
import {
  EosioAction,
  ProposalExec,
  BasicProposal,
  ProposalCancel,
  ProposalApproval,
  CandidacyProposalType,
  ProposalPermissionLevel,
  ProposalPairStringString,
  DaoChangeConfigs,
  DaoDTAPPayload,
  DaoElectionPeriodPayload,
} from 'features/syndicates/types/governanceTypes'
import { DaoDetailsResponse, DaoGlobalsResponse, DaoWalletDetailsResponse } from 'graphql/types'
import { toLower, split, toNumber } from 'lodash'
import { DateTime } from 'luxon'
import { wait } from 'overmind'
import { config } from 'shared/util/config'
import { getDacTokenPrecision, PrepareDacTokenAmountWithPrecision } from 'shared/util/helpers'
import { WalletType } from 'store/main/types'
import {
  WaxBag,
  WaxLand,
  WaxShine,
  WaxMiner,
  WaxTerms,
  WaxQuery,
  WaxPlayer,
  WaxResult,
  ShineData,
  ActionType,
  WaxResponse,
  PremintOffer,
  WaxResources,
  WaxUserPoints,
  WaxLevelOffer,
  WaxPointsOffer,
  OnboardingData,
  PersistedWallet,
  WaxRefundInProgress,
  VotersHistoryResponse,
  MemberTermsSignRequest,
  WaxRequest,
} from 'store/wax/types'

import { Constants } from '../../shared/util/constants'

interface WaxOptions {
  getWalletId(): string
  getSessionKit(): any
  getCurrentSession(): any
  getCurrentWallet(): string

  getMiningRandomString(): string
  onTransactionError(error: unknown): void
}

// @ts-ignore
window.Buffer = Buffer

// persisted AW wallet
const persistedWallet = {
  set(wallet: PersistedWallet) {
    localStorage.setItem('aw', JSON.stringify(wallet))
  },
  get(): PersistedWallet {
    const save = localStorage.getItem('aw')

    if (save) {
      return JSON.parse(save)
    }

    return null
  },
  remove() {
    localStorage.removeItem('aw')
  },
}

export const api = (() => {
  let waxClient: WaxJS = null
  let wharfClient: any = null
  let options: WaxOptions = null

  return {
    initialize(_options: WaxOptions) {
      options = _options
    },

    async getWaxApiUrl() {
      return config.WaxApiUrl
    },

    /////////////////////////// TRANSACT /////////////////////////////
    async executeTransactWax(actions: any[]) {
      try {
        const result = await this.executeTransactCore(actions)
        return result
      } catch (error: unknown) {
        options.onTransactionError(error)
        return null
      }
    },
    async executeTransactWharf(request: WaxRequest) {
      try {
        let result

        let currentSession = await options?.getCurrentSession()

        if (currentSession?.session) {
          currentSession = currentSession.session
        }

        if (currentSession) {
          const transactOptions = {
            blocksBehind: 3,
            expireSeconds: 1200,
          }

          if (request.length > 1)
            result = await currentSession.transact({ actions: request }, transactOptions)
          else result = await currentSession.transact({ actions: request }, transactOptions)
        }
        return result
      } catch (error: unknown) {
        options.onTransactionError(error)
        return null
      }
    },
    async executeTransactRQ(actions: any[]) {
      return this.executeTransactCore(actions)
    },

    async executeTransactFinal(request: WaxRequest) {
      let result

      result = await api.executeTransactWharf(request)

      return result
    },

    ///////////////////////// LOGIN ////////////////////////////////////
    async tryAutoLogin() {
      let userAccount: string
      const waxApiUrl: string = await api.getWaxApiUrl()
      // const wallet: PersistedWallet = persistedWallet.get()
      const demoPubKeys: string[] = [config.DemoUserPublicKey]
      const demoUserAccount: string = config.DemoUserWaxAccount
      const currentWallet: string = localStorage.getItem('aw_currentWallet')
      const wharfSession: any = JSON.parse(localStorage.getItem('wharf--session'))

      // DEMO USER
      if (
        currentWallet === 'demo' ||
        !currentWallet ||
        currentWallet === undefined ||
        !wharfSession ||
        wharfSession === null ||
        wharfSession === undefined
      ) {
        waxClient = new WaxJS({
          pubKeys: demoPubKeys,
          rpcEndpoint: waxApiUrl,
          userAccount: demoUserAccount,
        })

        await waxClient.login()

        const walletDemo: PersistedWallet = {
          pubKeys: demoPubKeys,
          userAccount: demoUserAccount,
        }

        persistedWallet.set(walletDemo)

        userAccount = demoUserAccount
      } else if (currentWallet) {
        // LOGGED IN USER
        // Wax wallet
        // if (wallet && currentWallet === WalletType.WAX) {
        //   waxClient = new WaxJS({
        //     rpcEndpoint: waxApiUrl,
        //     pubKeys: wallet.pubKeys,
        //     returnTempAccounts: true,
        //     userAccount: wallet.userAccount,
        //   })
        //   userAccount = wallet.userAccount
        // }
        // Other wallets
        if (
          currentWallet === WalletType.WOMBAT ||
          currentWallet === WalletType.ANCHOR ||
          currentWallet === WalletType.WAX
        ) {
          wharfClient = new APIClient({
            url: config.WaxApiUrl,
          })

          localStorage.setItem('aw_currentWallet', currentWallet)

          userAccount = wharfSession?.actor
        }
      }

      return userAccount
    },
    async loginWombat() {
      const wharfSession = JSON.parse(localStorage.getItem('wharf--session'))
      const walletId = wharfSession?.actor

      wharfClient = new APIClient({
        url: config.WaxApiUrl,
      })

      localStorage.setItem('aw_currentWallet', WalletType.WOMBAT)

      return walletId
    },
    async loginAnchor() {
      const wharfSession = JSON.parse(localStorage.getItem('wharf--session'))
      const walletId = wharfSession?.actor

      wharfClient = new APIClient({
        url: config.WaxApiUrl,
      })

      localStorage.setItem('aw_currentWallet', WalletType.ANCHOR)

      return walletId
    },
    async loginWax() {
      // const waxApiUrl = await api.getWaxApiUrl()

      const wharfSession = JSON.parse(localStorage.getItem('wharf--session'))
      const walletId = wharfSession?.actor

      wharfClient = new APIClient({
        url: config.WaxApiUrl,
      })

      // waxClient = new WaxJS({
      //   rpcEndpoint: waxApiUrl,
      //   tryAutoLogin: true,
      //   returnTempAccounts: true,
      // })

      // const result = await waxClient.login()

      // const walletId: string = typeof result === 'string' ? result : undefined

      if (!walletId) {
        return null
      }

      const wallet: PersistedWallet = {
        userAccount: walletId,
        pubKeys: waxClient.pubKeys,
      }

      persistedWallet.set(wallet)

      localStorage.setItem('aw_currentWallet', WalletType.WAX)

      return walletId
    },
    async logout() {
      localStorage.setItem('aw_currentWallet', 'demo')
      persistedWallet.remove()
      waxClient = null
      wharfClient = null
    },

    //   let userAccount: string
    //   const waxApiUrl: string = await api.getWaxApiUrl()
    //   const wallet: PersistedWallet = persistedWallet.get()

    //   // Normal user account
    //   if (wallet && wallet?.userAccount !== config.DemoUserWaxAccount) {
    //     waxClient = new WaxJS({
    //       rpcEndpoint: waxApiUrl,
    //       pubKeys: wallet.pubKeys,
    //       userAccount: wallet.userAccount,
    //       returnTempAccounts: true,
    //     })
    //     userAccount = wallet.userAccount
    //   } else {
    //     // Demo user account
    //     const demoUserAccount: string = config.DemoUserWaxAccount
    //     const demoPubKeys: string[] = [config.DemoUserPublicKey]

    //     waxClient = new WaxJS({
    //       rpcEndpoint: waxApiUrl,
    //       pubKeys: demoPubKeys,
    //       userAccount: demoUserAccount,
    //     })

    //     await waxClient.login()

    //     const walletDemo: PersistedWallet = {
    //       userAccount: demoUserAccount,
    //       pubKeys: demoPubKeys,
    //     }

    //     persistedWallet.set(walletDemo)

    //     userAccount = demoUserAccount
    //   }
    //   return userAccount
    // },
    async login() {
      const waxApiUrl = await api.getWaxApiUrl()

      waxClient = new WaxJS({
        rpcEndpoint: waxApiUrl,
        tryAutoLogin: false,
        returnTempAccounts: true,
      })

      const result = await waxClient.login()

      const walletId: string = typeof result === 'string' ? result : undefined

      if (!walletId) {
        return null
      }

      const wallet: PersistedWallet = {
        userAccount: walletId,
        pubKeys: waxClient.pubKeys,
      }

      persistedWallet.set(wallet)

      return walletId
    },
    async isAccountValidated(): Promise<boolean | null> {
      try {
        if (!options || !options?.getWalletId()) return null
        try {
          if (waxClient?.api) await waxClient.api.rpc.get_account(options.getWalletId())
          else if (wharfClient) await wharfClient.v1.chain.get_account(options.getWalletId())
          return true
        } catch (e) {
          return false
        }
      } catch (error) {
        return false
      }
    },

    ///////////////////////// READ ////////////////////////////////////

    async getTerms() {
      if (!options || !options?.getWalletId()) return null

      const query: WaxQuery = {
        table: Constants.CONTRACT_TABLE_USERTERMS,
        scope: Constants.CONTRACT_FEDERATION,
        code: Constants.CONTRACT_FEDERATION,
        upper_bound: options.getWalletId(),
        lower_bound: options.getWalletId(),
        limit: 1,
      }

      let result: WaxResult

      const rpc = new JsonRpc(config.WaxFetchApiUrl, { fetch })
      if (rpc) result = await rpc.get_table_rows(query)
      else if (waxClient?.api) result = await waxClient.api.rpc.get_table_rows(query)
      else if (wharfClient) result = await wharfClient.v1.chain.get_table_rows(query)

      return <WaxTerms>result?.rows?.[0] ?? null
    },
    async getPlayer(walletId: string) {
      if (!options || !options?.getWalletId()) return null

      const query: WaxQuery = {
        table: Constants.CONTRACT_TABLE_PLAYERS,
        scope: Constants.CONTRACT_FEDERATION,
        code: Constants.CONTRACT_FEDERATION,
        upper_bound: walletId,
        lower_bound: walletId,
        limit: 10,
      }

      let result: WaxResult

      const rpc = new JsonRpc(config.WaxFetchApiUrl, { fetch })
      if (rpc) result = await rpc.get_table_rows(query)
      else if (waxClient?.api) result = await waxClient.api.rpc.get_table_rows(query)
      else if (wharfClient) result = await wharfClient.v1.chain.get_table_rows(query)

      return <WaxPlayer>result.rows?.[0] ?? null
    },
    async getMiner() {
      if (!options || !options?.getWalletId()) {
        return null
      }

      const query: WaxQuery = {
        table: Constants.CONTRACT_TABLE_MINERS,
        scope: Constants.CONTRACT_M_FEDERATION,
        code: Constants.CONTRACT_M_FEDERATION,
        upper_bound: options.getWalletId(),
        lower_bound: options.getWalletId(),
      }

      let result: WaxResult

      const rpc = new JsonRpc(config.WaxFetchApiUrl, { fetch })
      if (rpc) result = await rpc.get_table_rows(query)
      else if (waxClient?.api) result = await waxClient.api.rpc.get_table_rows(query)
      else if (wharfClient) result = await wharfClient.v1.chain.get_table_rows(query)

      return <WaxMiner>result?.rows?.[0] ?? null
    },

    async loreVote({
      proposalId,
      vote,
      votePower,
    }: {
      proposalId: number
      vote: string
      votePower: number
    }) {
      if (!options || !options?.getWalletId()) return
      const actionsPermissions: ProposalPermissionLevel[] = [
        {
          actor: options.getWalletId(),
          permission: 'active',
        },
      ]

      const voteAction: EosioAction = {
        authorization: actionsPermissions,
        name: Constants.CONTRACT_LORE_WORLD_VOTE,
        account: Constants.CONTRACT_LORE_WORLDS,
        data: {
          voter: options.getWalletId(),
          proposal_id: proposalId,
          vote: vote,
          vote_power: votePower.toFixed(4) + ' VP',
        },
      }

      const request: ActionType[] = []

      request.push(voteAction)

      await this.executeTransactFinal(request)
    },

    async getWhiteListId(dacId: string) {
      if (!options || !options?.getWalletId() || dacId === null) return null

      const query: WaxQuery = {
        table: Constants.CONTRACT_TABLE_WHITELIST,
        code: Constants.CONTRACT_DAO_WORLDS,
        scope: dacId,
        lower_bound: options?.getWalletId(),
        upper_bound: options?.getWalletId(),
      }

      let result: WaxResult

      const rpc = new JsonRpc(config.WaxFetchApiUrl, { fetch })
      if (rpc) result = await rpc.get_table_rows(query)
      else if (waxClient?.api) result = await waxClient.api.rpc.get_table_rows(query)
      else if (wharfClient) result = await wharfClient.v1.chain.get_table_rows(query)

      return <any>result?.rows?.[0] ?? null
    },

    async getRefundsInProgress() {
      if (!options || !options?.getWalletId()) return null

      const query: WaxQuery = {
        table: Constants.CONTRACT_TABLE_REFUNDS,
        scope: Constants.CONTRACT_FEDERATION,
        code: Constants.CONTRACT_FEDERATION,
        upper_bound: options.getWalletId(),
        lower_bound: options.getWalletId(),
        index_position: 2,
        key_type: 'i64',
        limit: 100,
      }

      let result: WaxResult

      const rpc = new JsonRpc(config.WaxFetchApiUrl, { fetch })
      if (rpc) result = await rpc.get_table_rows(query)
      else if (waxClient?.api) result = await waxClient.api.rpc.get_table_rows(query)
      else if (wharfClient) result = await wharfClient.v1.chain.get_table_rows(query)

      return <WaxRefundInProgress[]>result?.rows ?? null
    },
    async getBag() {
      if (!options || !options?.getWalletId()) return null

      const query: WaxQuery = {
        table: Constants.CONTRACT_TABLE_BAGS,
        scope: Constants.CONTRACT_M_FEDERATION,
        code: Constants.CONTRACT_M_FEDERATION,
        upper_bound: options.getWalletId(),
        lower_bound: options.getWalletId(),
      }

      let result: WaxResult

      const rpc = new JsonRpc(config.WaxFetchApiUrl, { fetch })
      if (rpc) result = await rpc.get_table_rows(query)
      else if (waxClient?.api) result = await waxClient.api.rpc.get_table_rows(query)
      else if (wharfClient) result = await wharfClient.v1.chain.get_table_rows(query)

      return <WaxBag>result?.rows?.[0] ?? null
    },
    async getLand(landId: string) {
      if (!options || !options?.getWalletId() || !landId) return null

      const query: WaxQuery = {
        table: Constants.CONTRACT_TABLE_LANDREGS,
        scope: Constants.CONTRACT_FEDERATION,
        code: Constants.CONTRACT_FEDERATION,
        upper_bound: landId,
        lower_bound: landId,
      }

      let result: WaxResult

      const rpc = new JsonRpc(config.WaxFetchApiUrl, { fetch })
      if (rpc) result = await rpc.get_table_rows(query)
      else if (waxClient?.api) result = await waxClient.api.rpc.get_table_rows(query)
      else if (wharfClient) result = await wharfClient.v1.chain.get_table_rows(query)

      return <WaxLand>result?.rows?.[0] ?? null
    },
    async getResources() {
      if (!options || !options?.getWalletId()) return null
      let resources: WaxResources
      let account: any

      try {
        if (waxClient?.api) {
          account = await waxClient.api.rpc.get_account(options.getWalletId())
        } else if (wharfClient) {
          const unparsedAccount = await wharfClient.v1.chain.get_account(options.getWalletId())
          account = Serializer.objectify(unparsedAccount)
        }

        resources = {
          usedCPU: account.cpu_limit.used,
          usedNET: account.net_limit.used,
          usedRAM: account.ram_usage,

          stakedCPU: parseFloat(account.total_resources.cpu_weight.split(' WAX')[0]),
          stakedNET: parseFloat(account.total_resources.net_weight.split(' WAX')[0]),
          stakedRAM: account.total_resources.ram_bytes,

          availableCPU: account.cpu_limit.available,
          availableNET: account.net_limit.available,

          totalCPU: account.cpu_limit.max,
          totalNET: account.net_limit.max,
          totalRAM: account.ram_quota,

          currentTotalCPU:
            account.cpu_limit.available !== 0 ? account.cpu_limit.available : account.cpu_limit.max,
          currentTotalNET:
            account.net_limit.available !== 0 ? account.net_limit.available : account.net_limit.max,

          percCPU: (account.cpu_limit.used / account.cpu_limit.max) * 100,
          percNET: (account.net_limit.used / account.net_limit.max) * 100,
          percRAM: (account.ram_usage / account.ram_quota) * 100,
        }

        return resources ?? null
      } catch (error) {
        return null
      }
    },
    async getShineInfo(templateId: string) {
      if (!options || !options?.getWalletId() || !templateId) return null

      const query: WaxQuery = {
        table: Constants.CONTRACT_TABLE_LOOKUPS,
        scope: Constants.CONTRACT_S_FEDERATION,
        code: Constants.CONTRACT_S_FEDERATION,
        upper_bound: templateId,
        lower_bound: templateId,
        index_position: 1,
        show_payer: false,
        reverse: false,
        key_type: ' ',
        json: true,
        limit: 1,
      }
      let result: WaxResult

      const rpc = new JsonRpc(config.WaxFetchApiUrl, { fetch })
      if (rpc) result = await rpc.get_table_rows(query)
      else if (waxClient?.api) result = await waxClient.api.rpc.get_table_rows(query)
      else if (wharfClient) result = await wharfClient.v1.chain.get_table_rows(query)

      return <WaxShine>result?.rows?.[0] ?? null
    },
    async getNftsToClaim(): Promise<{ length: number; templates: string[] } | null> {
      if (!options || !options?.getWalletId()) return null

      const query: WaxQuery = {
        table: Constants.CONTRACT_TABLE_CLAIMS,
        scope: Constants.CONTRACT_M_FEDERATION,
        code: Constants.CONTRACT_M_FEDERATION,
        upper_bound: options.getWalletId(),
        lower_bound: options.getWalletId(),
        limit: 1,
      }
      let result: WaxResult

      const rpc = new JsonRpc(config.WaxFetchApiUrl, { fetch })
      if (rpc) result = await rpc.get_table_rows(query)
      else if (waxClient?.api) result = await waxClient.api.rpc.get_table_rows(query)
      else if (wharfClient) result = await wharfClient.v1.chain.get_table_rows(query)

      const templates: string[] = result.rows[0]?.template_ids ?? []
      const hasMaxed = templates.some((x) => {
        return Constants.MAXED_TEMPLATES.has(parseInt(`${x}`, 10))
      })

      if (hasMaxed) {
        return { length: 0, templates }
      }

      return { length: templates.length || 0, templates }
    },
    async getUserPoints() {
      if (!options || !options?.getWalletId()) return null

      const query: WaxQuery = {
        table: Constants.CONTRACT_TABLE_USERPOINTS,
        scope: Constants.CONTRACT_USER_POINTS,
        code: Constants.CONTRACT_USER_POINTS,
        upper_bound: options.getWalletId(),
        lower_bound: options.getWalletId(),
        limit: 10,
      }

      let result: WaxResult

      const rpc = new JsonRpc(config.WaxFetchApiUrl, { fetch })
      if (rpc) result = await rpc.get_table_rows(query)
      else if (waxClient?.api) result = await waxClient.api.rpc.get_table_rows(query)
      else if (wharfClient) result = await wharfClient.v1.chain.get_table_rows(query)

      return <WaxUserPoints>result?.rows?.[0] ?? null
    },
    async getLevelOffers() {
      if (!options || !options?.getWalletId()) return null

      const query: WaxQuery = {
        table: Constants.CONTRACT_TABLE_LEVELOFFERS,
        scope: Constants.CONTRACT_USER_POINTS,
        code: Constants.CONTRACT_USER_POINTS,
        limit: 100,
      }
      let result: WaxResult

      const rpc = new JsonRpc(config.WaxFetchApiUrl, { fetch })
      if (rpc) result = await rpc.get_table_rows(query)
      else if (waxClient?.api) result = await waxClient.api.rpc.get_table_rows(query)
      else if (wharfClient) result = await wharfClient.v1.chain.get_table_rows(query)

      return <WaxLevelOffer[]>result?.rows ?? null
    },
    async getPointsOffers() {
      if (!options || !options?.getWalletId()) return null

      const allRows: WaxPointsOffer[] = []
      let upperBound: string | number = null
      const limit = 500

      const rpc = new JsonRpc(config.WaxFetchApiUrl, { fetch })

      do {
        const query: WaxQuery = {
          table: Constants.CONTRACT_TABLE_POINTOFFERS,
          scope: Constants.CONTRACT_USER_POINTS,
          code: Constants.CONTRACT_USER_POINTS,
          key_type: '',
          limit,
          reverse: true,
          ...(upperBound != null && { upper_bound: String(upperBound) }),
        }

        let result: WaxResult
        if (rpc) result = await rpc.get_table_rows(query)
        else if (waxClient?.api) result = await waxClient.api.rpc.get_table_rows(query)
        else if (wharfClient) result = await wharfClient.v1.chain.get_table_rows(query)
        else break

        if (result?.rows?.length) allRows.push(...result.rows)
        if (!result?.more) break
        upperBound = result.next_key
      } while (true)

      return allRows.length ? allRows : null
    },
    async getPremintOffers(nextKey, limit = 20): Promise<WaxResponse<PremintOffer>> {
      if (!options || !options?.getWalletId()) return null

      const query: WaxQuery = {
        table: Constants.CONTRACT_TABLE_PREMINTOFFERS,
        scope: Constants.CONTRACT_USER_POINTS,
        code: Constants.CONTRACT_USER_POINTS,
        key_type: '',
        limit,
        reverse: true,
        ...(nextKey != null && { upper_bound: String(nextKey) }),
      }

      let result: WaxResult

      const rpc = new JsonRpc(config.WaxFetchApiUrl, { fetch })
      if (rpc) result = await rpc.get_table_rows(query)
      else if (waxClient?.api) result = await waxClient.api.rpc.get_table_rows(query)
      else if (wharfClient) result = await wharfClient.v1.chain.get_table_rows(query)

      return <WaxResponse<PremintOffer>>result ?? null
    },
    async getDACs<T>(params) {
      const {
        codeContract,
        table,
        scope,
        lowerBound,
        upperBound,
        endpoint,
        batchSize,
        limit,
        sleepMS = 50,
      } = params

      if (!options || !options?.getWalletId()) return null

      const rpc = new JsonRpc(endpoint, { fetch })
      let resultRows: T[] = []
      let count = 0

      let result: { more: boolean; next_key: string; rows: T[] }
      let limitNotReached: boolean = true
      try {
        do {
          const query: WaxQuery = {
            table,
            scope,
            code: codeContract,
            limit: batchSize,
            lower_bound: lowerBound,
            upper_bound: upperBound,
          }

          if (rpc) result = await rpc.get_table_rows(query)
          else result = await wharfClient.v1.chain.get_table_rows(query)

          resultRows = resultRows.concat(result.rows)
          count += result.rows.length

          if (sleepMS > 0) {
            wait(sleepMS)
          }

          if (typeof limit === 'number') {
            limitNotReached = count < limit
          } else {
            limitNotReached = !limit(result.rows)
          }
        } while (result.more && limitNotReached)
      } catch (e) {
        console.error(e)
      }
      return resultRows
    },

    async getPlanetMemberTermsText(ipfsId: string) {
      if (!options || !options?.getWalletId()) return null

      try {
        const result = await fetch(`${config.IpfsApiUrl}/${ipfsId}`)

        // @TODO consider using Axios to intercept the errors better
        if (!result?.ok) {
          throw new Error('Failed to load MemberTerms text')
        } else {
          return await result?.text()
        }
      } catch (e) {
        throw new Error(e)
      }
    },

    async getDAOInfo(dacId: string) {
      if (!options || !options?.getWalletId() || !dacId) return null

      try {
        const url = `${config.DaoApiUrl}/dacs?dacId=${toLower(dacId)}`
        const resc = await fetch(url)
        const json = await resc.json()

        if (json?.results?.length) {
          return json.results
        }
      } catch (e) {
        console.error(e)
      }

      return null
    },

    async getLandBoosts(landId: string) {
      if (!options || !options?.getWalletId()) return null

      const query: WaxQuery = {
        table: Constants.CONTRACT_TABLE_LANDBOOSTS,
        scope: Constants.CONTRACT_LAND_RATINGS,
        code: Constants.CONTRACT_LAND_RATINGS,
        upper_bound: landId,
        lower_bound: landId,
        limit: 1, // limit to the last day boosts added
      }

      let result: WaxResult

      const rpc = new JsonRpc(config.WaxFetchApiUrl, { fetch })
      if (rpc) result = await rpc.get_table_rows(query)
      else if (waxClient?.api) result = await waxClient.api.rpc.get_table_rows(query)
      else if (wharfClient) result = await wharfClient.v1.chain.get_table_rows(query)

      return result?.rows ?? null
    },
    async getVotingHistory(
      candidateId: string,
      dacId: string,
      skip: number,
      limit: number
    ): Promise<VotersHistoryResponse> {
      if (!options || !options?.getWalletId()) return null

      try {
        const url = `${config.DaoApiUrl}/candidates_voters_history?dacId=${dacId}&candidateId=${candidateId}&skip=${skip}&limit=${limit}`
        const data = await fetch(url)
        const response = (await data.json()) as VotersHistoryResponse

        return response
      } catch (e) {
        console.error(e)
      }

      return null
    },
    async getRarityPools(dacTreasuryAccount: string) {
      if (!options || !options?.getWalletId()) return null

      const query: WaxQuery = {
        table: Constants.CONTRACT_TABLE_POOLS,
        code: Constants.CONTRACT_M_FEDERATION,
        scope: dacTreasuryAccount,
        limit: 1,
      }

      let result: WaxResult

      const rpc = new JsonRpc(config.WaxFetchApiUrl, { fetch })
      if (rpc) result = await rpc.get_table_rows(query)
      else if (waxClient?.api) result = await waxClient.api.rpc.get_table_rows(query)
      else if (wharfClient) result = await wharfClient.v1.chain.get_table_rows(query)

      return <RarityPoolsResponse>result?.rows?.[0] ?? null
    },

    ///////////////////////// WRITE ////////////////////////////////////
    async setBag(items: string[]) {
      if (!options || !options?.getWalletId()) return

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_M_FEDERATION,
          name: Constants.CONTRACT_FEDERATION_ACTION_SETBAG,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            account: options.getWalletId(),
            items,
          },
        },
      ]

      await this.executeTransactFinal(request)
    },
    async setTag(tag: string) {
      if (!options || !options?.getWalletId()) return

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_FEDERATION,
          name: Constants.CONTRACT_FEDERATION_ACTION_SETTAG,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            account: options.getWalletId(),
            tag,
          },
        },
      ]

      await this.executeTransactFinal(request)
    },
    async setAvatar(avatarId: string) {
      if (!options || !options?.getWalletId()) return

      const requests: WaxRequest = []

      const setAvatarRequest = {
        account: Constants.CONTRACT_FEDERATION,
        name: Constants.CONTRACT_FEDERATION_ACTION_SETAVATAR,
        authorization: [
          {
            actor: options.getWalletId(),
            permission: 'active',
          },
        ],
        data: {
          account: options.getWalletId(),
          avatar_id: avatarId,
        },
      }

      if (Number(avatarId) === 1 || Number(avatarId) === 2) {
        requests.push({
          account: Constants.CONTRACT_EOSIO,
          name: Constants.CONTRACT_EOSIO_BUY_RAM_BYTES,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            payer: options.getWalletId(),
            receiver: 'mint.worlds',
            bytes: 152,
          },
        })
      }
      requests.push(setAvatarRequest)

      await this.executeTransactFinal(requests)
    },
    async setLand(landId: string) {
      if (!options || !options?.getWalletId()) return

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_M_FEDERATION,
          name: Constants.CONTRACT_FEDERATION_ACTION_SETLAND,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            account: options.getWalletId(),
            land_id: landId,
          },
        },
      ]

      await this.executeTransactFinal(request)
    },

    async setCommission(landId: string, commission: string) {
      if (!options || !options?.getWalletId()) return

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_LAND_RATINGS,
          name: Constants.CONTRACT_FEDERATION_ACTION_SETPROFITSHR,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            owner: options.getWalletId(),
            land_id: landId,
            profit_share: commission,
          },
        },
      ]

      await this.executeTransactFinal(request)
    },
    async claimMine() {
      if (!options || !options?.getWalletId()) return null

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_M_FEDERATION,
          name: Constants.CONTRACT_M_FEDERATION_ACTION_MINE,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            miner: options.getWalletId(),
            nonce: options.getMiningRandomString(),
          },
        },
      ]

      const result = await this.executeTransactFinal(request)

      return result
    },
    async claimUnstake(symbol: string) {
      if (!options || !options?.getWalletId()) return

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_TOKEN_WORLDS,
          name: Constants.CONTRACT_TOKEN_WORLDS_ACTION_CLAIMUNSTKES,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            account: options.getWalletId(),
            token_symbol: symbol,
          },
        },
      ]

      await this.executeTransactFinal(request)
    },
    async submitShine(shineIds: string[], shineData: ShineData) {
      if (!options || !options?.getWalletId()) return null
      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_ALIEN_WORLDS,
          name: Constants.CONTRACT_TABLE_TRANSFER,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            from: options.getWalletId(),
            to: Constants.CONTRACT_S_FEDERATION,
            quantity: shineData.info.cost,
            memo: 'Shining',
          },
        },
        {
          account: Constants.CONTRACT_ATOMIC_ASSETS,
          name: Constants.CONTRACT_TABLE_TRANSFER,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            from: options.getWalletId(),
            to: Constants.CONTRACT_S_FEDERATION,
            asset_ids: shineIds,
            memo: 'Shining',
          },
        },
      ]

      const result = await this.executeTransactFinal(request)

      return result as TransactResult
    },
    async executeOnboarding(onboarding: OnboardingData) {
      if (!options || !options?.getWalletId()) return
      const agreeTermsRequest = {
        account: Constants.CONTRACT_FEDERATION,
        name: Constants.CONTRACT_FEDERATION_ACTION_AGREETERMS,
        authorization: [
          {
            actor: options.getWalletId(),
            permission: 'active',
          },
        ],
        data: {
          account: options.getWalletId(),
          terms_id: 1,
          terms_hash: 'e2e07b7d7ece0d5f95d0144b5886ff74272c9873d7dbbc79bc56f047098e43ad',
        },
      }
      const setAvatarRequest = {
        account: Constants.CONTRACT_FEDERATION,
        name: Constants.CONTRACT_FEDERATION_ACTION_SETAVATAR,
        authorization: [
          {
            actor: options.getWalletId(),
            permission: 'active',
          },
        ],
        data: {
          account: options.getWalletId(),
          avatar_id: onboarding.avatarId,
        },
      }
      const setTagRequest = {
        account: Constants.CONTRACT_FEDERATION,
        name: Constants.CONTRACT_FEDERATION_ACTION_SETTAG,
        authorization: [
          {
            actor: options.getWalletId(),
            permission: 'active',
          },
        ],
        data: {
          account: options.getWalletId(),
          tag: onboarding.tagId,
        },
      }
      const setLandRequest = {
        account: Constants.CONTRACT_M_FEDERATION,
        name: Constants.CONTRACT_FEDERATION_ACTION_SETLAND,
        authorization: [
          {
            actor: options.getWalletId(),
            permission: 'active',
          },
        ],
        data: {
          account: options.getWalletId(),
          land_id: onboarding.landId,
        },
      }
      const registerUserRequest = {
        account: Constants.CONTRACT_USER_POINTS,
        name: Constants.CONTRACT_USER_POINTS_ACTION_REGUSER,
        authorization: [
          {
            actor: options.getWalletId(),
            permission: 'active',
          },
        ],
        data: {
          user: options.getWalletId(),
        },
      }
      const requests: WaxRequest = [agreeTermsRequest]
      if (Number(onboarding.avatarId) === 1 || Number(onboarding.avatarId) === 2) {
        requests.push({
          account: Constants.CONTRACT_EOSIO,
          name: Constants.CONTRACT_EOSIO_BUY_RAM_BYTES,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            payer: options.getWalletId(),
            receiver: 'mint.worlds',
            bytes: 304,
          },
        })
      }
      requests.push(setAvatarRequest)
      requests.push(registerUserRequest)
      requests.push(setLandRequest)
      requests.push(setTagRequest)

      await this.executeTransactFinal(requests)
    },
    async stake(dacTreasuryAccount: string, quantity: string) {
      if (!options || !options?.getWalletId()) return

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_ALIEN_WORLDS,
          name: Constants.CONTRACT_TABLE_TRANSFER,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            from: options.getWalletId(),
            to: Constants.CONTRACT_STAKE_WORLDS,
            quantity,
            memo: 'staking',
          },
        },
        {
          account: Constants.CONTRACT_STAKE_WORLDS,
          name: Constants.CONTRACT_TABLE_STAKE,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            account: options.getWalletId(),
            planet_name: dacTreasuryAccount,
            quantity,
          },
        },
      ]

      await this.executeTransactFinal(request)
    },
    async unstake(quantity: string) {
      if (!options || !options?.getWalletId()) return

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_TOKEN_WORLDS,
          name: Constants.CONTRACT_TABLE_TRANSFER,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            from: options.getWalletId(),
            to: Constants.CONTRACT_STAKE_WORLDS,
            quantity,
            memo: 'Unstaking',
          },
        },
      ]

      await this.executeTransactFinal(request)
    },
    async stakeVotePower(
      planet: DaoDetailsResponse,
      amount: number,
      releaseTime: number,
      currentReleaseTime: number
    ) {
      if (!options || !options?.getWalletId()) return

      const quantity = `${
        PrepareDacTokenAmountWithPrecision(
          amount,
          planet.dac_id,
          getDacTokenPrecision(planet)
        )?.split(' TLM')?.[0]
      } ${planet.symbol.sym?.split(',')?.[1]}`
      const tokenSymbol = planet.symbol.sym

      const stakeTimeAction = {
        account: Constants.CONTRACT_TOKEN_WORLDS,
        name: Constants.CONTRACT_TABLE_STAKETIME,
        authorization: [
          {
            actor: options.getWalletId(),
            permission: 'active',
          },
        ],
        data: {
          account: options.getWalletId(),
          unstake_time: releaseTime * 86400,
          token_symbol: tokenSymbol,
        },
      }
      const stakeAction = {
        account: Constants.CONTRACT_TOKEN_WORLDS,
        name: Constants.CONTRACT_TABLE_STAKE,
        authorization: [
          {
            actor: options.getWalletId(),
            permission: 'active',
          },
        ],
        data: {
          account: options.getWalletId(),
          quantity,
        },
      }
      const request: ActionType[] = []

      if (releaseTime > 2 && releaseTime > currentReleaseTime) request.push(stakeTimeAction)
      if (amount > 0) request.push(stakeAction)

      await this.executeTransactFinal(request)
    },
    async stakeVotePowerLore({ amount }: { amount: string }) {
      if (!options || !options?.getWalletId()) return
      const actionsPermissions: ProposalPermissionLevel[] = [
        {
          actor: options.getWalletId(),
          permission: 'active',
        },
      ]
      const transferTxn: EosioAction = {
        authorization: actionsPermissions,
        name: Constants.CONTRACT_TABLE_TRANSFER,
        account: Constants.CONTRACT_ALIEN_WORLDS,
        data: {
          from: options.getWalletId(),
          to: Constants.CONTRACT_LORE_WORLDS,
          memo: 'staking for lore',
          quantity: `${parseFloat(amount).toFixed(4)} TLM`,
        },
      }
      const stakeAction = {
        account: Constants.CONTRACT_LORE_WORLDS,
        name: Constants.CONTRACT_TABLE_STAKE,
        authorization: actionsPermissions,
        data: {
          account: options.getWalletId(),
        },
      }
      const request: ActionType[] = []
      request.push(transferTxn)
      request.push(stakeAction)

      await this.executeTransactFinal(request)
    },
    async submitLore({
      title,
      type = 'lore',
      url,
      description,
      fee,
    }: {
      title: string
      type: string
      url: string
      description: string
      fee: string
    }) {
      if (!options || !options?.getWalletId()) return
      const actionsPermissions: ProposalPermissionLevel[] = [
        {
          actor: options.getWalletId(),
          permission: 'active',
        },
      ]

      const id = toNumber(url.split('/').pop())
      const attributes = [
        {
          key: 'pull_req_id',
          value: ['uint16', id],
        },
        {
          key: 'url',
          value: ['string', url],
        },
        {
          key: 'description',
          value: ['string', description],
        },
      ]

      const proposalAction: EosioAction = {
        authorization: actionsPermissions,
        name: Constants.CONTRACT_MSIG_WORLDS_ACTION_PROPOSE,
        account: Constants.CONTRACT_LORE_WORLDS,
        data: {
          proposal_id: id,
          proposer: options.getWalletId(),
          title: title,
          type: type,
          attributes: attributes,
        },
      }
      const stakeAction = {
        account: Constants.CONTRACT_ALIEN_WORLDS,
        name: Constants.CONTRACT_TABLE_TRANSFER,
        authorization: [
          {
            actor: options.getWalletId(),
            permission: 'active',
          },
        ],
        data: {
          from: options.getWalletId(),
          to: Constants.CONTRACT_LORE_WORLDS,
          quantity: fee,
          memo: 'lore',
        },
      }

      const request: ActionType[] = []
      request.push(stakeAction)
      request.push(proposalAction)

      await this.executeTransactFinal(request)
    },
    async unStakeLore() {
      if (!options || !options?.getWalletId()) return
      const actionsPermissions: ProposalPermissionLevel[] = [
        {
          actor: options.getWalletId(),
          permission: 'active',
        },
      ]

      const stakeAction = {
        account: Constants.CONTRACT_LORE_WORLDS,
        name: Constants.CONTRACT_TABLE_UNSTAKE,
        authorization: actionsPermissions,
        data: {
          account: options.getWalletId(),
        },
      }
      const refundAction = {
        account: Constants.CONTRACT_LORE_WORLDS,
        name: Constants.CONTRACT_TABLE_REFUND,
        authorization: actionsPermissions,
        data: {
          account: options.getWalletId(),
        },
      }
      const request: ActionType[] = []

      request.push(stakeAction)
      request.push(refundAction)
      await this.executeTransactFinal(request)
    },
    async voteCandidates(dacId: string, newVotes: string[]) {
      if (!options || !options?.getWalletId()) return

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_DAO_WORLDS,
          name: Constants.CONTRACT_DAO_WORLDS_ACTION_VOTECUST,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            voter: options.getWalletId(),
            newvotes: newVotes,
            dac_id: dacId,
          },
        },
      ]

      await this.executeTransactFinal(request)
    },
    async unStakeVotePower(quantity: string) {
      if (!options || !options?.getWalletId()) return

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_TOKEN_WORLDS,
          name: Constants.CONTRACT_TABLE_UNSTAKE,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            account: options.getWalletId(),
            quantity,
          },
        },
      ]

      await this.executeTransactFinal(request)
    },
    async cancelUnstake(id: number, symbol: string) {
      if (!options || !options?.getWalletId()) return

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_TOKEN_WORLDS,
          name: Constants.CONTRACT_MSIG_WORLDS_ACTION_CANCEL,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            unstake_id: id,
            token_symbol: symbol,
          },
        },
      ]

      await this.executeTransactFinal(request)
    },
    async claimNfts(numOfNFts: number) {
      if (!options || !options?.getWalletId()) return

      const requests: WaxRequest = [
        {
          account: Constants.CONTRACT_EOSIO,
          name: Constants.CONTRACT_EOSIO_BUY_RAM_BYTES,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            payer: options.getWalletId(),
            receiver: 'mint.worlds',
            bytes: numOfNFts * 151,
          },
        },
        {
          account: Constants.CONTRACT_M_FEDERATION,
          name: Constants.CONTRACT_M_FEDERATION_ACTION_CLAIMNFTS,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            miner: options.getWalletId(),
          },
        },
      ]

      await this.executeTransactFinal(requests)
    },
    async claimNFTPts() {
      if (!options || !options?.getWalletId()) return

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_M_FEDERATION,
          name: Constants.CONTRACT_M_FEDERATION_ACTION_CLAIMNFTPTS,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            miner: options.getWalletId(),
          },
        },
      ]

      await this.executeTransactFinal(request)
    },
    async redeemAWNftOffer(offerId: number) {
      if (!options || !options?.getWalletId()) throw new Error('No wallet id')

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_EOSIO,
          name: Constants.CONTRACT_EOSIO_BUY_RAM_BYTES,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            payer: options.getWalletId(),
            receiver: 'mint.worlds',
            bytes: 152,
          },
        },
        {
          account: Constants.CONTRACT_USER_POINTS,
          name: Constants.CONTRACT_USER_POINTS_ACTION_REDEEMPNTNFT,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            user: options.getWalletId(),
            offer_id: offerId,
          },
        },
      ]

      const result = await this.executeTransactFinal(request)

      return result as TransactResult
    },
    async redeemCommunityNftOffer(offerId: number) {
      if (!options || !options?.getWalletId()) throw new Error('No wallet id')

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_USER_POINTS,
          name: Constants.CONTRACT_USER_POINTS_ACTION_REDEEMPRENFT,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            user: options.getWalletId(),
            offer_id: offerId,
          },
        },
      ]

      const result = await this.executeTransactFinal(request)

      return result as TransactResult
    },
    async redeemLevelOffer(levelOfferId: number) {
      if (!options || !options?.getWalletId()) throw new Error('No wallet id')

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_EOSIO,
          name: Constants.CONTRACT_EOSIO_BUY_RAM_BYTES,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            payer: options.getWalletId(),
            receiver: 'mint.worlds',
            bytes: 152,
          },
        },
        {
          account: Constants.CONTRACT_USER_POINTS,
          name: Constants.CONTRACT_USER_POINTS_ACTION_REDEEMLVLNFT,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            user: options.getWalletId(),
            id: levelOfferId,
          },
        },
      ]

      const result = await this.executeTransactFinal(request)

      return result as TransactResult
    },
    async signPlanetMemberTerms({ dac_id }: Partial<MemberTermsSignRequest>) {
      if (!options || !options?.getWalletId()) return null

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_TOKEN_WORLDS,
          name: Constants.CONTRACT_TOKEN_WORLDS_ACTION_MEMBERREG,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: <MemberTermsSignRequest>{
            sender: options.getWalletId(),
            agreedterms: 'NA',
            dac_id,
          },
        },
      ]

      const result = await this.executeTransactFinal(request)

      return result as TransactResult
    },

    async tryRegisterNewCandidate(
      candidacyProposal: CandidacyProposalType,
      selectedDac: DaoDetailsResponse,
      daoGlobals: DaoGlobalsResponse,
      daoWalletDetails: DaoWalletDetailsResponse
    ) {
      if (!options || !options?.getWalletId()) return

      const actions: WaxRequest = []
      const stakeRequirement = daoGlobals.lockupasset.quantity

      const [reqStr] = split(stakeRequirement, ' ')
      const stakeAmount = daoWalletDetails.stake_details.staked_amount
      let stakeStr = '0'
      if (stakeAmount) {
        ;[stakeStr] = split(stakeAmount, ' ')
      }

      let extraStake = toNumber(parseFloat(reqStr)) - toNumber(parseFloat(stakeStr))
      if (extraStake === 0) {
        extraStake = 5000
      } else if (extraStake < 0 && reqStr === null) {
        extraStake = 5000 - toNumber(parseFloat(stakeStr))
      } else {
        extraStake = 5000
      }

      extraStake = 0

      actions.push({
        account: Constants.CONTRACT_DAO_WORLDS,
        name: Constants.CONTRACT_DAO_WORLDS_ACTION_STPROFILE,
        authorization: [
          {
            permission: 'active',
            actor: candidacyProposal.wallet,
          },
        ],
        data: {
          cand: candidacyProposal.wallet,
          dac_id: candidacyProposal.dacName,
          profile: candidacyProposal.candidate,
        },
      })

      actions.push({
        account: Constants.CONTRACT_DAO_WORLDS,
        name: Constants.CONTRACT_DAO_WORLDS_ACTION_NOMINATECANE,
        authorization: [
          {
            permission: 'active',
            actor: candidacyProposal.wallet,
          },
        ],
        data: {
          requestedpay: '0.0000 TLM',
          cand: candidacyProposal.wallet,
          dac_id: candidacyProposal.dacName,
        },
      })

      await this.executeTransactFinal(actions)
    },
    async activateNewCandidate(candidacyProposal: CandidacyProposalType) {
      if (!options || !options?.getWalletId()) return

      const actions: WaxRequest = []

      actions.push({
        account: Constants.CONTRACT_DAO_WORLDS,
        name: Constants.CONTRACT_DAO_WORLDS_ACTION_NOMINATECANE,
        authorization: [
          {
            permission: 'active',
            actor: candidacyProposal.wallet,
          },
        ],
        data: {
          requestedpay: '0.0000 TLM',
          cand: candidacyProposal.wallet,
          dac_id: candidacyProposal.dacName,
        },
      })

      await this.executeTransactFinal(actions)
    },
    async withdrawCandidate(candidacyProposal: CandidacyProposalType) {
      if (!options || !options?.getWalletId()) return

      const actions: WaxRequest = []

      actions.push({
        account: Constants.CONTRACT_DAO_WORLDS,
        name: Constants.CONTRACT_DAO_WORLDS_ACTION_WITHDRAWCANE,
        authorization: [
          {
            permission: 'active',
            actor: candidacyProposal.wallet,
          },
        ],
        data: {
          cand: candidacyProposal.wallet,
          dac_id: candidacyProposal.dacName,
        },
      })

      await this.executeTransactFinal(actions)
    },
    async updateCandidate(candidacyProposal: CandidacyProposalType) {
      if (!options || !options?.getWalletId()) return

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_DAO_WORLDS,
          name: Constants.CONTRACT_DAO_WORLDS_ACTION_STPROFILE,
          authorization: [
            {
              permission: 'active',
              actor: options.getWalletId(),
            },
          ],
          data: {
            cand: candidacyProposal.wallet,
            dac_id: candidacyProposal.dacName,
            profile: candidacyProposal.candidate,
          },
        },
      ]

      await this.executeTransactFinal(request)
    },

    async createNewCustodianProposal({
      dac_id,
      proposer,
      metadata,
      proposal_to,
      proposal_name,
      proposal_memo,
      expirationDays,
      proposal_quantity,
    }: {
      dac_id: string
      proposer: string
      proposal_to: string
      proposal_name: string
      proposal_memo: string
      expirationDays: number
      proposal_quantity: string
      metadata: Array<ProposalPairStringString>
    }) {
      if (!options || !options?.getWalletId()) return null
      const transactionPermissions: ProposalPermissionLevel[] = [
        {
          actor: proposer,
          permission: 'active',
        },
      ]
      const actionsPermissions: ProposalPermissionLevel[] = [
        {
          actor: options.getWalletId(),
          permission: 'active',
        },
      ]
      const transferTxn: EosioAction = {
        authorization: transactionPermissions,
        name: Constants.CONTRACT_TABLE_TRANSFER,
        account: Constants.CONTRACT_ALIEN_WORLDS,
        data: {
          from: proposer,
          to: proposal_to,
          memo: proposal_memo,
          quantity: `${parseFloat(proposal_quantity).toFixed(4)} TLM`,
        },
      }
      const waxApiUrl: string = await api.getWaxApiUrl()
      // const wallet: PersistedWallet = persistedWallet.get()
      const demoPubKeys: string[] = [config.DemoUserPublicKey]
      const demoUserAccount: string = config.DemoUserWaxAccount
      waxClient = new WaxJS({
        pubKeys: demoPubKeys,
        rpcEndpoint: waxApiUrl,
        userAccount: demoUserAccount,
      })

      const serialisedActions = await waxClient.api.serializeActions([transferTxn])
      const expiration = DateTime.now()
        .plus({ days: expirationDays })
        .toBSON()
        .toISOString()
        .replace('Z', '')

      const data: BasicProposal = {
        proposer: options.getWalletId(),
        proposal_name,
        requested: transactionPermissions,
        dac_id,
        metadata,
        trx: {
          expiration,
          context_free_actions: [],
          delay_sec: '0',
          max_cpu_usage_ms: 0,
          max_net_usage_words: '0',
          ref_block_num: 0,
          ref_block_prefix: 0,
          actions: serialisedActions,
          transaction_extensions: [],
        },
      }
      const actions: EosioAction[] = [
        {
          data,
          authorization: actionsPermissions,
          account: Constants.CONTRACT_MSIG_WORLDS,
          name: Constants.CONTRACT_MSIG_WORLDS_ACTION_PROPOSE,
        },
      ]

      const result = await this.executeTransactFinal(actions)

      return result as TransactResult
    },
    async changeDTAPConfigs({
      planet_name,
      claim_rate_perc_x100,
      destination,
      proposer,
      proposalTitle,
      proposalDescription,
      proposalName,
      dac_id,
    }: DaoDTAPPayload) {
      if (!options || !options?.getWalletId()) return null
      const transactionPermissions: ProposalPermissionLevel[] = [
        {
          actor: proposer,
          permission: 'active',
        },
      ]
      const actionsPermissions: ProposalPermissionLevel[] = [
        {
          actor: options.getWalletId(),
          permission: 'active',
        },
      ]
      const transferTxn: EosioAction = {
        authorization: transactionPermissions,
        account: Constants.CONTRACT_M_FEDERATION,
        name: Constants.CONTRACT_FEDERATION_ACTION_PLTDTAPSET,
        data: {
          planet_name,
          claim_rate_perc_x100,
          destination,
        },
      }
      const metadata = [
        {
          key: 'title',
          value: proposalTitle,
        },
        {
          key: 'description',
          value: proposalDescription,
        },
      ]
      const waxApiUrl: string = await api.getWaxApiUrl()
      // const wallet: PersistedWallet = persistedWallet.get()
      const demoPubKeys: string[] = [config.DemoUserPublicKey]
      const demoUserAccount: string = config.DemoUserWaxAccount
      waxClient = new WaxJS({
        pubKeys: demoPubKeys,
        rpcEndpoint: waxApiUrl,
        userAccount: demoUserAccount,
      })

      const serialisedActions = await waxClient.api.serializeActions([transferTxn])
      const expiration = DateTime.now().plus({ days: 7 }).toBSON().toISOString().replace('Z', '')

      const data: BasicProposal = {
        proposer: options.getWalletId(),
        proposal_name: proposalName,
        requested: transactionPermissions,
        dac_id,
        metadata,
        trx: {
          expiration,
          context_free_actions: [],
          delay_sec: '0',
          max_cpu_usage_ms: 0,
          max_net_usage_words: '0',
          ref_block_num: 0,
          ref_block_prefix: 0,
          actions: serialisedActions,
          transaction_extensions: [],
        },
      }
      const actions: EosioAction[] = [
        {
          data,
          authorization: actionsPermissions,
          account: Constants.CONTRACT_MSIG_WORLDS,
          name: Constants.CONTRACT_MSIG_WORLDS_ACTION_PROPOSE,
        },
      ]

      const result = await this.executeTransactFinal(actions)

      return result as TransactResult
    },
    async changeDaoConfigs({
      dac_id,
      auththreshold,
      numelected,
      maxvotes,
      proposer,
      proposalName,
      proposalTitle,
      proposalDescription,
    }: DaoChangeConfigs) {
      if (!options || !options?.getWalletId()) return null
      const transactionPermissions: ProposalPermissionLevel[] = [
        {
          actor: proposer,
          permission: 'active',
        },
      ]
      const actionsPermissions: ProposalPermissionLevel[] = [
        {
          actor: options.getWalletId(),
          permission: 'active',
        },
      ]
      const transferTxn: EosioAction = {
        authorization: transactionPermissions,
        account: Constants.CONTRACT_DAO_WORLDS,
        name: Constants.CONTRACT_DAO_WORLDS_ACTION_SETDAOGOV,
        data: {
          dac_id,
          auththreshold,
          numelected,
          maxvotes,
        },
      }
      const metadata = [
        {
          key: 'title',
          value: proposalTitle,
        },
        {
          key: 'description',
          value: proposalDescription,
        },
      ]
      const waxApiUrl: string = await api.getWaxApiUrl()
      // const wallet: PersistedWallet = persistedWallet.get()
      const demoPubKeys: string[] = [config.DemoUserPublicKey]
      const demoUserAccount: string = config.DemoUserWaxAccount
      waxClient = new WaxJS({
        pubKeys: demoPubKeys,
        rpcEndpoint: waxApiUrl,
        userAccount: demoUserAccount,
      })

      const serialisedActions = await waxClient.api.serializeActions([transferTxn])
      const expiration = DateTime.now().plus({ days: 7 }).toBSON().toISOString().replace('Z', '')

      const data: BasicProposal = {
        proposer: options.getWalletId(),
        proposal_name: proposalName,
        requested: transactionPermissions,
        dac_id,
        metadata,
        trx: {
          expiration,
          context_free_actions: [],
          delay_sec: '0',
          max_cpu_usage_ms: 0,
          max_net_usage_words: '0',
          ref_block_num: 0,
          ref_block_prefix: 0,
          actions: serialisedActions,
          transaction_extensions: [],
        },
      }
      const actions: EosioAction[] = [
        {
          data,
          authorization: actionsPermissions,
          account: Constants.CONTRACT_MSIG_WORLDS,
          name: Constants.CONTRACT_MSIG_WORLDS_ACTION_PROPOSE,
        },
      ]

      const result = await this.executeTransactFinal(actions)

      return result as TransactResult
    },
    async changeElectionDuration({
      dac_id,
      electionDuration,
      proposer,
      proposalName,
      proposalTitle,
      proposalDescription,
    }: DaoElectionPeriodPayload) {
      if (!options || !options?.getWalletId()) return null
      const transactionPermissions: ProposalPermissionLevel[] = [
        {
          actor: proposer,
          permission: 'active',
        },
      ]
      const actionsPermissions: ProposalPermissionLevel[] = [
        {
          actor: options.getWalletId(),
          permission: 'active',
        },
      ]
      const transferTxn: EosioAction = {
        authorization: transactionPermissions,
        account: Constants.CONTRACT_DAO_WORLDS,
        name: Constants.CONTRACT_DAO_WORLDS_ACTION_SETPERIODLEN,
        data: {
          dac_id,
          periodlength: electionDuration * 86400, // convert days to seconds
        },
      }
      const metadata = [
        {
          key: 'title',
          value: proposalTitle,
        },
        {
          key: 'description',
          value: proposalDescription,
        },
      ]
      const waxApiUrl: string = await api.getWaxApiUrl()
      // const wallet: PersistedWallet = persistedWallet.get()
      const demoPubKeys: string[] = [config.DemoUserPublicKey]
      const demoUserAccount: string = config.DemoUserWaxAccount
      waxClient = new WaxJS({
        pubKeys: demoPubKeys,
        rpcEndpoint: waxApiUrl,
        userAccount: demoUserAccount,
      })

      const serialisedActions = await waxClient.api.serializeActions([transferTxn])
      const expiration = DateTime.now().plus({ days: 7 }).toBSON().toISOString().replace('Z', '')

      const data: BasicProposal = {
        proposer: options.getWalletId(),
        proposal_name: proposalName,
        requested: transactionPermissions,
        dac_id,
        metadata,
        trx: {
          expiration,
          context_free_actions: [],
          delay_sec: '0',
          max_cpu_usage_ms: 0,
          max_net_usage_words: '0',
          ref_block_num: 0,
          ref_block_prefix: 0,
          actions: serialisedActions,
          transaction_extensions: [],
        },
      }
      const actions: EosioAction[] = [
        {
          data,
          authorization: actionsPermissions,
          account: Constants.CONTRACT_MSIG_WORLDS,
          name: Constants.CONTRACT_MSIG_WORLDS_ACTION_PROPOSE,
        },
      ]

      const result = await this.executeTransactFinal(actions)

      return result as TransactResult
    },
    async createNewBudgetClaimProposal({
      dac_id,
      metadata,
      proposal_name,
      expirationDays,
      proposer,
    }: {
      dac_id: string
      proposer: string
      proposal_name: string
      expirationDays: number
      metadata: Array<{ key: string; value: string }>
    }) {
      if (!options || !options?.getWalletId()) return null

      const transactionPermissions: ProposalPermissionLevel[] = [
        {
          permission: 'active',
          actor: proposer,
        },
      ]
      const actionsPermissions: ProposalPermissionLevel[] = [
        {
          permission: 'active',
          actor: options.getWalletId(),
        },
      ]
      const transferTxn: EosioAction = {
        authorization: transactionPermissions,
        account: Constants.CONTRACT_DAO_WORLDS,
        name: Constants.CONTRACT_DAO_WORLDS_ACTIONS_CLAIMBUDGET,
        data: {
          dac_id,
        },
      }
      const waxApiUrl: string = await api.getWaxApiUrl()
      // const wallet: PersistedWallet = persistedWallet.get()
      const demoPubKeys: string[] = [config.DemoUserPublicKey]
      const demoUserAccount: string = config.DemoUserWaxAccount
      waxClient = new WaxJS({
        pubKeys: demoPubKeys,
        rpcEndpoint: waxApiUrl,
        userAccount: demoUserAccount,
      })

      const serialisedActions = await waxClient.api.serializeActions([transferTxn])
      const expiration = DateTime.now()
        .plus({ days: expirationDays })
        .toBSON()
        .toISOString()
        .replace('Z', '')

      const data: BasicProposal = {
        proposer: options.getWalletId(),
        proposal_name,
        requested: transactionPermissions,
        dac_id,
        metadata,
        trx: {
          expiration,
          context_free_actions: [],
          delay_sec: '0',
          max_cpu_usage_ms: 0,
          max_net_usage_words: '0',
          ref_block_num: 0,
          ref_block_prefix: 0,
          actions: serialisedActions,
          transaction_extensions: [],
        },
      }
      const actions: EosioAction[] = [
        {
          data,
          authorization: actionsPermissions,
          account: Constants.CONTRACT_MSIG_WORLDS,
          name: Constants.CONTRACT_MSIG_WORLDS_ACTION_PROPOSE,
        },
      ]

      const result = await this.executeTransactFinal(actions)

      return result as TransactResult
    },
    async cancelCustodianProposal({
      dac_id,
      canceler,
      proposal_name,
    }: {
      dac_id: string
      canceler: string
      proposal_name: string
    }) {
      if (!options || !options?.getWalletId()) return null

      const data: ProposalCancel = {
        dac_id,
        canceler,
        proposal_name,
      }
      const actions: EosioAction[] = [
        {
          data,
          account: Constants.CONTRACT_MSIG_WORLDS,
          name: Constants.CONTRACT_MSIG_WORLDS_ACTION_CANCEL,
          authorization: [{ actor: canceler, permission: 'active' }],
        },
      ]

      const result = await this.executeTransactFinal(actions)

      return result as TransactResult
    },
    async cleanCustodianProposal({
      dac_id,
      canceler,
      proposal_name,
    }: {
      dac_id: string
      canceler: string
      proposal_name: string
    }) {
      const data: ProposalCancel = {
        dac_id,
        canceler,
        proposal_name,
      }
      const actions: EosioAction[] = [
        {
          data,
          account: Constants.CONTRACT_MSIG_WORLDS,
          name: Constants.CONTRACT_MSIG_WORLDS_ACTION_CLEANUP,
          authorization: [{ actor: canceler, permission: 'active' }],
        },
      ]

      const result = await this.executeTransactFinal(actions)

      return result as TransactResult
    },
    async approveCustodianProposal({
      dac_id,
      approver,
      proposal_name,
    }: {
      dac_id: string
      approver: string
      proposal_name: string
    }) {
      if (!options || !options?.getWalletId()) return null

      const data: ProposalApproval = {
        dac_id,
        proposal_name,
        proposal_hash: null,
        level: { actor: approver, permission: 'active' },
      }
      const actions: EosioAction[] = [
        {
          data,
          account: Constants.CONTRACT_MSIG_WORLDS,
          name: Constants.CONTRACT_MSIG_WORLDS_ACTION_APPROVE,
          authorization: [{ actor: approver, permission: 'active' }],
        },
      ]

      const result = await this.executeTransactFinal(actions)

      return result as TransactResult
    },
    async executeCustodianProposal({
      dac_id,
      executer,
      proposal_name,
    }: {
      dac_id: string
      executer: string
      proposal_name: string
    }) {
      if (!options || !options?.getWalletId()) return null

      const data: ProposalExec = {
        dac_id,
        executer,
        proposal_name,
      }
      const actions: EosioAction[] = [
        {
          data,
          account: Constants.CONTRACT_MSIG_WORLDS,
          name: Constants.CONTRACT_MSIG_WORLDS_ACTION_EXECUTE,
          authorization: [{ actor: executer, permission: 'active' }],
        },
      ]

      const result = await this.executeTransactFinal(actions)

      return result as TransactResult
    },
    async claimLandownerAllowance() {
      if (!options || !options?.getWalletId()) return

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_LAND_RATINGS,
          name: Constants.CONTRACT_LAND_RATINGS_ACTION_CLAIMPAY,
          authorization: [
            {
              permission: 'active',
              actor: options.getWalletId(),
            },
          ],
          data: {
            receiver: options.getWalletId(),
          },
        },
      ]
      await this.executeTransactFinal(request)
    },
    async claimMiningRewards() {
      if (!options || !options?.getWalletId()) return

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_M_FEDERATION,
          name: Constants.CONTRACT_M_FEDERATION_ACTION_CLAIMMINES,
          authorization: [
            {
              permission: 'active',
              actor: options.getWalletId(),
            },
          ],
          data: {
            receiver: options.getWalletId(),
          },
        },
      ]
      await this.executeTransactFinal(request)
    },
    async claimLandownerComissions() {
      if (!options || !options?.getWalletId()) return

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_M_FEDERATION,
          name: Constants.CONTRACT_M_FEDERATION_ACTION_CLAIMCOMMS,
          authorization: [
            {
              permission: 'active',
              actor: options.getWalletId(),
            },
          ],
          data: {
            receiver: options.getWalletId(),
          },
        },
      ]
      await this.executeTransactFinal(request)
    },
    async claimTournamentReward(compId: number) {
      if (!options || !options?.getWalletId()) return

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_COMP_WORLDS,
          name: Constants.CONTRACT_COMP_ACTION_CLAIM,
          authorization: [
            {
              permission: 'active',
              actor: options.getWalletId(),
            },
          ],
          data: {
            id: compId,
            player: options.getWalletId(),
          },
        },
      ]
      await this.executeTransactFinal(request)
    },
    async applyMainBoost(landId: string, boost: IAsset) {
      if (!options || !options?.getWalletId()) return

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_ATOMIC_ASSETS,
          name: Constants.CONTRACT_TABLE_TRANSFER,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            from: options.getWalletId(),
            to: Constants.CONTRACT_LAND_RATINGS,
            asset_ids: [boost.asset_id],
            memo: `<${boost.name}> for land id ${landId}`,
          },
        },
        {
          account: Constants.CONTRACT_LAND_RATINGS,
          name:
            boost.name === MainBoostLevels[0].name
              ? Constants.CONTRACT_LAND_RATINGS_ACTION_MEGABOOST
              : Constants.CONTRACT_LAND_RATINGS_ACTION_SUPERBOOST,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            land_id: landId,
          },
        },
      ]

      const result = await this.executeTransactFinal(request)

      return result as TransactResult
    },
    async setMinBoost(landId: string, minBoost: string) {
      if (!options || !options?.getWalletId()) return

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_LAND_RATINGS,
          name: Constants.CONTRACT_LAND_RATINGS_ACTION_SETMINBOOST,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            owner: options.getWalletId(),
            land_id: landId,
            minboost: minBoost,
          },
        },
      ]

      const result = await this.executeTransactFinal(request)
      return result as TransactResult
    },
    async boostSlot(landId: string, cost: string) {
      if (!options || !options?.getWalletId()) return

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_ALIEN_WORLDS,
          name: Constants.CONTRACT_TABLE_TRANSFER,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            from: options.getWalletId(),
            to: Constants.CONTRACT_BOOST_WORLDS,
            quantity: cost,
            memo: `landrating - boostslot for ${landId}`,
          },
        },
        {
          account: Constants.CONTRACT_LAND_RATINGS,
          name: Constants.CONTRACT_LAND_RATINGS_ACTION_BOOST,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            payer: options.getWalletId(),
            land_id: landId,
            amount: cost,
          },
        },
      ]

      const result = await this.executeTransactFinal(request)
      return result as TransactResult
    },
    async unlockSlot(landId: string, cost: string) {
      if (!options || !options?.getWalletId()) return

      const request: WaxRequest = [
        {
          account: Constants.CONTRACT_ALIEN_WORLDS,
          name: Constants.CONTRACT_TABLE_TRANSFER,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            from: options.getWalletId(),
            to: Constants.CONTRACT_BOOST_WORLDS,
            quantity: cost,
            memo: `landrating - openslot for ${landId}`,
          },
        },
        {
          account: Constants.CONTRACT_LAND_RATINGS,
          name: Constants.CONTRACT_LAND_RATINGS_ACTION_OPENSLOT,
          authorization: [
            {
              actor: options.getWalletId(),
              permission: 'active',
            },
          ],
          data: {
            owner: options.getWalletId(),
            land_id: landId,
          },
        },
      ]

      const result = await this.executeTransactFinal(request)
      return result as TransactResult
    },
  }
})()
