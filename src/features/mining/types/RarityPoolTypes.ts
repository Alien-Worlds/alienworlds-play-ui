export interface RarityPoolsResponse {
  rates: {
    key: string
    value: string
  }[]
  pool_buckets: {
    key: string
    value: string
  }[]
}

export interface RarityPool {
  rarityName: string
  amount: string
  rawAmount: number
  percentage: number
}
