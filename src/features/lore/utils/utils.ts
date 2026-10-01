import { LoreSortBy } from 'features/lore/types/loreTypes'
import { LoreProposal } from 'graphql/types'

interface FilterAndSortParams {
  lores: LoreProposal[]
  sortBy: LoreSortBy
  reversed: boolean
}
export function removeLastDecimalDigit(num: number) {
  const str = num.toString()
  if (str.includes('.')) {
    const [intPart, decPart] = str.split('.')
    const newDec = decPart.slice(0, -1)
    return newDec ? `${intPart}.${newDec}` : intPart
  }
  return str // no decimal part, return as string
}

export const sortLores = ({ lores, sortBy, reversed }: FilterAndSortParams): LoreProposal[] => {
  const sortedLores = [...lores].sort((a, b) => {
    let aValue: any = ''
    let bValue: any = ''
    let result: number

    switch (sortBy) {
      case LoreSortBy.ID:
        aValue = a.proposal_id
        bValue = b.proposal_id
        result = bValue - aValue // Numeric comparison
        break
      case LoreSortBy.TITLE:
        aValue = a.title.toLowerCase()
        bValue = b.title.toLowerCase()
        result = aValue.localeCompare(bValue)
        break
      case LoreSortBy.CREATEDBY:
        aValue = a.proposer
        bValue = b.proposer
        result = aValue.localeCompare(bValue)
        break
      case LoreSortBy.SUBMITTED:
        aValue = a.submitted
        bValue = b.submitted
        aValue = !aValue ? new Date('12-31-1970').toISOString() : aValue
        bValue = !bValue ? new Date('12-31-1970').toISOString() : bValue
        result = aValue.localeCompare(bValue)
        break
      case LoreSortBy.VOTES:
        aValue = (a.total_yes_votes + a.total_no_votes).toString()
        bValue = (b.total_yes_votes + b.total_no_votes).toString()
        result = aValue.localeCompare(bValue)
        break
      case LoreSortBy.EXPIREDATE:
        aValue = a.expires
        bValue = b.expires
        aValue = !aValue ? new Date('12-31-1970').toISOString() : aValue
        bValue = !bValue ? new Date('12-31-1970').toISOString() : bValue
        result = aValue.localeCompare(bValue)
        break
      case LoreSortBy.STATUS:
        aValue = a.status
        bValue = b.status
        result = aValue.localeCompare(bValue)
        break
      default:
        result = 0
        break
    }

    return result
  })

  // Reverse if necessary
  if (reversed) {
    return sortedLores.reverse()
  }

  return sortedLores
}
