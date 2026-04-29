// import { any } from '@web3-onboard/common'
import { erc20abi } from 'assets/abi/erc20Abi'
import { nftAbi } from 'assets/abi/nftAbi'
import { spaceshipAbi } from 'assets/abi/spaceshipAbi'
import { BigNumber as BigNumberJs } from 'bignumber.js'
import { BigNumber, Contract, ethers } from 'ethers'
import missionsMappings from 'features/missions/data/missionsMappings.json'
import { find, forEach, split, replace, map } from 'lodash'
import { config } from 'shared/util/config'
import { getNftTemplatePinata } from 'shared/util/nft'
import { Mission, PinataNft } from 'store/missions/types'
import { MissionRewards } from 'store/web3/types'

interface Web3Options {
  onConnectionSuccess: (account: string, isInvalidChain: boolean) => void
  onAccountChanged: (account: string) => void
  onChainChanged: (isInvalidChain: boolean) => void
  onInOutTransfer: () => void
  onDisconnect: () => void
  getSelectedMission: () => Mission
}

export const api = (() => {
  let options: Web3Options = null
  let balanceContract: Contract = null

  // const createBalanceContract = (provider: any, account: string) => {
  const createBalanceContract = (provider: any, account: string) => {
    const ethersProvider = new ethers.providers.Web3Provider(provider, 'any')
    const signer = ethersProvider.getSigner()
    const contract = new Contract(config.MissionsTlmContract, erc20abi, signer)

    const incomingTransfer = contract.filters.Transfer(account)
    const outcomingTransfer = contract.filters.Transfer(null, account)

    contract.on(incomingTransfer, options.onInOutTransfer)
    contract.on(outcomingTransfer, options.onInOutTransfer)

    return contract
  }

  return {
    initialize(_options: Web3Options) {
      options = _options
    },

    async getBscTlmBalance(provider: any, account: string) {
      if (balanceContract === null) {
        balanceContract = createBalanceContract(provider, account)
      }

      if (balanceContract === null) {
        return null
      }

      const balance: BigNumber = await balanceContract.balanceOf(account)
      return balance
    },
    async getAllowance(provider: any, account: string) {
      const ethersProvider = new ethers.providers.Web3Provider(provider, 'any')

      const signer = ethersProvider.getSigner()
      const contract = new Contract(config.MissionsTlmContract, erc20abi, signer)
      const result: BigNumber = await contract.allowance(account, config.MissionsContract)

      return result
    },
    async setAllowance(allowance: BigNumber, provider: any) {
      const ethersProvider = new ethers.providers.Web3Provider(provider, 'any')

      const signer = ethersProvider.getSigner()

      const contract = new Contract(config.MissionsTlmContract, erc20abi, signer)

      const response = await contract.approve(config.MissionsContract, allowance)
      await response.wait()
    },
    async joinMission(missionId: string, spaceshipsCount: number, provider: any) {
      const ethersProvider = new ethers.providers.Web3Provider(provider, 'any')

      const signer = ethersProvider.getSigner()
      const contract = new Contract(config.MissionsContract, spaceshipAbi, signer)

      const join = await contract.joinToMission(missionId, spaceshipsCount)
      await join.wait()
    },
    async getMissionRewards(missionId: string, provider: any) {
      if (!missionId) return null
      const ethersProvider = new ethers.providers.Web3Provider(provider, 'any')
      const signer = ethersProvider.getSigner()

      const contract = new Contract(config.MissionsContract, spaceshipAbi, signer)

      const response: { rewardTLM: BigNumber; rewardNFTCount: BigNumber } =
        await contract.calculateReward(missionId)

      return <MissionRewards>{
        tlm: new BigNumberJs(response.rewardTLM.toHexString(), 16).dividedBy(10000).toString(),
        nft: response.rewardNFTCount.toString(),
      }
    },
    async claimMissionRewards(missionId: string, provider: any) {
      if (!missionId) return
      const ethersProvider = new ethers.providers.Web3Provider(provider, 'any')
      const signer = ethersProvider.getSigner()

      const contract = new Contract(config.MissionsContract, spaceshipAbi, signer)

      const withdraw = await contract.withdraw(missionId)
      await withdraw.wait()
    },
    async getNfts(
      account: string,
      provider: any,
      templatePinatas: PinataNft[],
      updateTotalMissionsNfts: (nftMissionsCount: number) => void,
      updateLoadedMissionsNfts: (nftMissionsCount: number) => void
    ) {
      const ethersProvider = new ethers.providers.Web3Provider(provider, 'any')
      const signer = ethersProvider.getSigner()
      const contract = new Contract(config.MissionsNftContract, nftAbi, signer)
      const nftCount = BigNumber.from(await contract.balanceOf(account))
      let tokenUrlTasks: string[] = []
      const tokenPinatas: PinataNft[] = []
      const batchIntervalDelay: number = 750
      const totalNumber: number = nftCount.toNumber()

      // Update totalMissionsNfts before start batching
      updateTotalMissionsNfts(totalNumber)

      if (totalNumber > 0) {
        const batchSize = 10
        const tokenUrlResults = []
        const numBatches = Math.ceil(nftCount.toNumber() / batchSize)

        for (let batchIndex = 0; batchIndex < numBatches; batchIndex += 1) {
          const startIndex = batchIndex * batchSize
          const endIndex = Math.min(startIndex + batchSize, nftCount.toNumber())

          let retries = 0
          let tokenResults
          const maxRetries = 2

          // Retry fetching if rate-limit error is returned
          while (retries < maxRetries) {
            try {
              const tokenTasks = []
              for (let i = startIndex; i < endIndex; i += 1) {
                // Fetch account tokens by index
                const nftToken = contract.tokenOfOwnerByIndex(account, i)
                tokenTasks.push(nftToken)
              }
              tokenResults = await Promise.all(tokenTasks)
              break
            } catch (e) {
              retries += 1
              if (retries === maxRetries) {
                console.log('Failed to fetch tokens after retries. Error: ', e)
              }
              console.log('Retrying fetching NFTs...')
              // eslint-disable-next-line @typescript-eslint/no-loop-func
              await new Promise((resolve) => setTimeout(resolve, batchIntervalDelay))
            }
          }

          retries = 0

          while (retries < maxRetries) {
            try {
              // Get token URI for each NFT fetched
              tokenUrlTasks = map(tokenResults, (tokenResult) => contract.tokenURI(tokenResult))
              const batchTokenUrlResults = await Promise.all(tokenUrlTasks)
              tokenUrlResults.push(...batchTokenUrlResults)
              break
            } catch (e) {
              retries += 1
              if (retries === maxRetries) {
                console.log('Failed to fetch NFTs URIs after retries. Error: ', e)
                throw e
              }
              console.log('Retrying fetching NFTs URIs...')
              // eslint-disable-next-line @typescript-eslint/no-loop-func
              await new Promise((resolve) => setTimeout(resolve, batchIntervalDelay))
            }
          }

          // Update loadedMissionsNfts after each batch is fetched
          updateLoadedMissionsNfts(endIndex)

          // Add delay between batches to avoid going over rate-limit
          // eslint-disable-next-line @typescript-eslint/no-loop-func
          await new Promise((resolve) => setTimeout(resolve, batchIntervalDelay))
        }

        forEach(tokenUrlResults, (t) => {
          // some NFTs have hardcoded ipfs links to pinata,
          // in order to fetch the updated version it must be changed manually
          if (t.startsWith('http')) {
            t = replace(t, 'https://alienworlds.mypinata.cloud/ipfs', config.IpfsApiUrl)
          }

          // Find current nft series and number
          const tokenIpfs: string = split(t, config.IpfsApiUrl)[1].substring(1)
          const missionNumber: number = find(
            missionsMappings,
            (b) => b.IPFSHash === tokenIpfs
          )?.cardNumber
          const missionSeries: number = find(
            missionsMappings,
            (b) => b.IPFSHash === tokenIpfs
          )?.series

          const templatePinataForNFT: PinataNft = getNftTemplatePinata(
            templatePinatas,
            missionSeries,
            missionNumber
          )

          // Map matching template Pinata to current nft
          tokenPinatas.push(templatePinataForNFT)
        })

        return tokenPinatas
      }

      return null
    },
  }
})()
