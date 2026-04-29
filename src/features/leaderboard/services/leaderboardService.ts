import { LeaderboardItem } from 'features/leaderboard/types/leaderboardTypes'
import { getNftImage } from 'shared/util/nft'

export class LeaderboardService {
  static async mapAvatarAndTag(
    results: LeaderboardItem[],
    getPlayer: (walletId: string) => Promise<any>,
    getAssetById: (assetId: string | number) => Promise<any>
  ): Promise<LeaderboardItem[]> {
    const mappedResults: LeaderboardItem[] = []

    for (const result of results ?? []) {
      try {
        const player = await getPlayer(result.wallet_id)
        const avatarAsset = await getAssetById(player?.avatar)
        const imageAvatar = getNftImage(avatarAsset)

        mappedResults.push({
          ...result,
          tag: player?.tag ?? null,
          avatar: imageAvatar ?? null,
        })
      } catch (error) {
        // push original result on failure to avoid breaking UI
        mappedResults.push(result)
      }
    }

    return mappedResults.sort((a, b) => a.position - b.position)
  }
}
