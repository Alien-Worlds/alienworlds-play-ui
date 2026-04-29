import mappingImages from 'assets/data/cardImgMappings.json'
import mappingPortraits from 'assets/data/cardPortraitImgMappings.json'
import templateMappings from 'assets/data/templateImageMappings.json'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { find } from 'lodash'
import { PinataNft } from 'store/missions/types'

import { config } from './config'

export const maleHumanAvatar = `${config.IpfsApiUrl}/QmWmAY3NELbkjLVk4qWrpBEafaS1wPJFwhsUNgRcurVox4`
export const femaleHumanAvatar = `${config.IpfsApiUrl}/QmWajkhfkp7EG7x9ZQrB83MKNvdFUAxYfMFgc7cCk3J4iy`

/**
On chain we have full NFT images which were used in a previous game UI.
Now that we use dynamic NFT cards in the new UI there was a need for 
differently formatted images (circles) so new assets were made and hosted on IPFS.
This function maps from nft cardid and schema to the url in mappings json.
* */
const getNftImage = (nft: IAsset) => {
  let mappedImg
  let hash = null
  // portraits mapping
  if (
    nft?.schema?.schema_name === 'tool.worlds' &&
    nft?.data?.cardid > 31 &&
    nft?.data?.cardid < 42
  ) {
    mappedImg = find(
      mappingPortraits,
      (item) => item.Cardid === nft?.data?.cardid && item.Shine === nft?.data?.shine
    )
    hash = mappedImg?.PortraitImage
  } else {
    mappedImg = find(
      mappingImages,
      (item) => item.Cardid === nft?.data?.cardid && item.Schema === nft?.schema?.schema_name
    )

    if (mappedImg && mappedImg.IPFSHash) {
      if (mappedImg.IPFSHash === 'templateLookup') {
        // some NFTs have template_id attribute, others have template.template_id
        const assetTemplateId: number = parseInt(`${nft?.template_id}` ?? '0', 10)
        const templateTemplateId: number = parseInt(`${nft?.template?.template_id}` ?? '0', 10)
        hash = find(
          templateMappings,
          (item) => item.Template === assetTemplateId || item.Template === templateTemplateId
        )?.IPFSHash
      } else {
        hash = mappedImg?.IPFSHash
      }
    }
  }
  if (hash) {
    return `${config.IpfsApiUrl}/${hash}`
  }
  return nft?.data?.img
    ? `${config.IpfsApiUrl}/${nft.data.img}`
    : '/images/alienworlds-profile-sample01.jpg'
}

const getNftTemplatePinata = (
  templatePinatas: PinataNft[],
  missionSeries: number,
  missionNumber: number
) => {
  const templatePinataForNFT: PinataNft = find(templatePinatas, (p) => {
    const pinataSeries = find(p.attributes, (a) => a.trait_type === 'Series')?.value
    const pinataNumber = find(p.attributes, (a) => a.trait_type === 'CardNumber')?.value

    return pinataNumber === missionNumber && pinataSeries === missionSeries
  })
  return templatePinataForNFT
}

/**
 * These have the level.worlds schema
 * but should be treated and shown as the "Ore" type of nft
 */
const levelTemplateIdsAsOre = [
  '515558',
  '515559',
  '515560',
  '515561',
  '516018',
  '516019',
  '516020',
  '516021',
  '516022',
]

/**
 *
 */
const levelVariantMap: { [key: number]: string } = {
  1: 'level1A',
  2: 'level1B',
  3: 'level1C',
  4: 'level2A',
  5: 'level2B',
  6: 'level2C',
  7: 'level3A',
  8: 'level3B',
  9: 'level3C',
  10: 'level4A',
}

const getLevelVariant: any = (level: number) => {
  return levelVariantMap[level] || 'level1A'
}

export { getNftImage, getNftTemplatePinata, levelTemplateIdsAsOre, getLevelVariant }
