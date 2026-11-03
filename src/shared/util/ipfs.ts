import { config } from './config'

/** Reads a text file from IPFS, e.g. a planet's member terms. Throws if it can't be loaded. */
export const fetchIpfsText = async (ipfsId: string): Promise<string> => {
  const response = await fetch(`${config.IpfsApiUrl}/${ipfsId}`)
  if (!response.ok) throw new Error(`Failed to load IPFS file ${ipfsId}`)
  return response.text()
}
