import { ITemplate } from 'atomicassets/build/API/Explorer/Objects'
import { find, reduce } from 'lodash'
import { PremintOffer, WaxLevelOffer, WaxPointsOffer } from 'store/wax/types'

export const matchOffersAndTemplatesFromWax = <T>(
  offers: (WaxPointsOffer | WaxLevelOffer | PremintOffer)[],
  templates: ITemplate[]
): T[] => {
  const offersWithTemplates: T[] = reduce(
    offers,
    (acc, offerItem) => {
      const matchedTemplate = find(templates, (template) => {
        return template.template_id === String(offerItem.template_id)
      })

      if (matchedTemplate) {
        acc.push({
          ...offerItem,
          asset: { ...matchedTemplate, data: matchedTemplate.immutable_data },
        })
      } else {
        console.error(`Template ${offerItem.template_id} not found for points offer`, offerItem)
      }
      return acc
    },
    []
  )

  return offersWithTemplates
}
