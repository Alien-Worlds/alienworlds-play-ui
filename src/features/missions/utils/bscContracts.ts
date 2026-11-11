import { erc20abi } from 'assets/abi/erc20Abi'
import { nftAbi } from 'assets/abi/nftAbi'
import { spaceshipAbi } from 'assets/abi/spaceshipAbi'
import { BigNumber as BigNumberJs } from 'bignumber.js'
import { BigNumber, Contract, ethers } from 'ethers'
import missionsMappings from 'features/missions/data/missionsMappings.json'
import { MissionRewards, PinataNft } from 'features/missions/types/missionsTypes'
import { find, forEach, split, replace, map } from 'lodash'
import { config } from 'shared/util/config'
import { getNftTemplatePinata } from 'shared/util/nft'

// Calls to the missions contracts on BSC, through the connected wallet's provider. Formerly
// Overmind's web3.api effects.

const signerFor = (provider: any) => new ethers.providers.Web3Provider(provider, 'any').getSigner()

// The TLM contract that reads the balance is created once, and watches transfers in and out of
// the first account it reads, so the balance can reload when they happen.
let balanceContract: Contract = null

const createBalanceContract = (provider: any, account: string, onTransfer: () => void) => {
  const contract = new Contract(config.MissionsTlmContract, erc20abi, signerFor(provider))

  contract.on(contract.filters.Transfer(account), onTransfer)
  contract.on(contract.filters.Transfer(null, account), onTransfer)

  return contract
}

/** The account's TLM balance on BSC. `onTransfer` runs when TLM moves in or out of it. */
export const getBscTlmBalance = async (
  provider: any,
  account: string,
  onTransfer: () => void
): Promise<BigNumber> => {
  if (balanceContract === null) {
    balanceContract = createBalanceContract(provider, account, onTransfer)
  }

  return balanceContract.balanceOf(account)
}

/** How much TLM the missions contract may spend for the account. */
export const getAllowance = async (provider: any, account: string): Promise<BigNumber> => {
  const contract = new Contract(config.MissionsTlmContract, erc20abi, signerFor(provider))
  return contract.allowance(account, config.MissionsContract)
}

/** Lets the missions contract spend `allowance` TLM, waiting for the transaction. */
export const setAllowance = async (allowance: BigNumber, provider: any) => {
  const contract = new Contract(config.MissionsTlmContract, erc20abi, signerFor(provider))
  const response = await contract.approve(config.MissionsContract, allowance)
  await response.wait()
}

/** Sends spacecrafts on a mission, waiting for the transaction. */
export const joinMission = async (missionId: string, spaceshipsCount: number, provider: any) => {
  const contract = new Contract(config.MissionsContract, spaceshipAbi, signerFor(provider))
  const join = await contract.joinToMission(missionId, spaceshipsCount)
  await join.wait()
}

/** What claiming the mission would pay out, in TLM and NFTs. */
export const getMissionRewards = async (
  missionId: string,
  provider: any
): Promise<MissionRewards | null> => {
  if (!missionId) return null
  const contract = new Contract(config.MissionsContract, spaceshipAbi, signerFor(provider))

  const response: { rewardTLM: BigNumber; rewardNFTCount: BigNumber } =
    await contract.calculateReward(missionId)

  return {
    tlm: new BigNumberJs(response.rewardTLM.toHexString(), 16).dividedBy(10000).toString(),
    nft: response.rewardNFTCount.toString(),
  }
}

/** Claims the mission's rewards (and unlocks its TLM), waiting for the transaction. */
export const claimMissionRewards = async (missionId: string, provider: any) => {
  if (!missionId) return
  const contract = new Contract(config.MissionsContract, spaceshipAbi, signerFor(provider))
  const withdraw = await contract.withdraw(missionId)
  await withdraw.wait()
}

/**
 * The account's mission NFTs, as their template NFTs, read in batches of 10 to stay under the
 * RPC rate limit, reporting the total and progress. Null when it has none.
 */
export const getNfts = async (
  account: string,
  provider: any,
  templatePinatas: PinataNft[],
  updateTotalMissionsNfts: (nftMissionsCount: number) => void,
  updateLoadedMissionsNfts: (nftMissionsCount: number) => void
): Promise<PinataNft[] | null> => {
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
      const missionSeries: number = find(missionsMappings, (b) => b.IPFSHash === tokenIpfs)?.series

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
}
