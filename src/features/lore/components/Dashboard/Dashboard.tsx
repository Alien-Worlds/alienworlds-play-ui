import { useState } from 'react'

import { DropDownIcon, DropDownTwoWaysIcon } from '@alien-worlds/icons'
import { LoreDrawer } from 'features/lore/components/LoreDrawer/LoreDrawer'
import { useLoreDashboard } from 'features/lore/hooks/useLoreDashboard'
import { LoreSortBy, LoreStatus, LoreTableColumns } from 'features/lore/types/loreTypes'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { getFormattedProposalDate } from 'features/syndicates/utils/GovernanceHelper'
import { motion } from 'framer-motion'
import { LoreProposal } from 'graphql/types'
import { filter, map, startCase } from 'lodash'
import { Colors } from 'shared/util/colors'
import { truncateWithEllipsis } from 'shared/util/helpers'
import { useActions, useAppState } from 'store'

export const SortByTh = ({ sortBy, width }) => {
  const {
    wax: { setLoreFilter },
  } = useActions()
  const {
    wax: { loreFilter },
  } = useAppState()

  const [rotate, setRotate] = useState(false)
  const onSelectSortBy = (value: LoreSortBy) => {
    if (value === loreFilter.sortBy) {
      setRotate(!rotate)
      setLoreFilter({
        ...loreFilter,
        reversed: rotate,
      })
      return
    }
    setRotate(false)
    setLoreFilter({
      ...loreFilter,
      sortBy: value,
    })
  }
  return (
    <th
      style={{ width, border: 'none', padding: '10px' }}
      className="cursor-pointer"
      onClick={() => onSelectSortBy(sortBy)}
    >
      <span className="flex capitalize">
        <p
          className="mb-4 mr-2 pl-3 font-tlm text-sm font-bold"
          style={{ color: loreFilter.sortBy === sortBy ? Colors.SNOW_WHITE : Colors.GRAY_CHATEAU }}
        >
          {LoreTableColumns[LoreSortBy[sortBy]]}
        </p>
        {loreFilter.sortBy === sortBy && (
          <>
            {rotate ? (
              <motion.div
                initial={{ rotate: '180deg' }}
                animate={{ rotate: '0deg' }}
                exit={{
                  rotate: '180deg',
                  transition: { duration: 0.3 },
                }}
                transition={{ duration: 0.3 }}
              >
                <DropDownIcon boxSize="14px" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ rotate: '0deg' }}
                animate={{ rotate: '180deg', translateY: '-15px' }}
                exit={{
                  rotate: '0deg',
                  transition: { duration: 0.3 },
                }}
                transition={{ duration: 0.3 }}
              >
                <DropDownIcon boxSize="14px" />
              </motion.div>
            )}
          </>
        )}

        {loreFilter.sortBy !== sortBy && <DropDownTwoWaysIcon boxSize="16px" />}
      </span>
    </th>
  )
}

export function loreTableRowRenderer() {
  const defaultTableColumns = Object.values(LoreTableColumns)

  return filter(defaultTableColumns)
}

export function loreTableHeaderRenderer() {
  return (
    <tr style={{ borderBottom: 'solid 1px', borderColor: Colors.JUMBO }}>
      <SortByTh sortBy={LoreSortBy.ID} width="2%" />
      <SortByTh sortBy={LoreSortBy.TITLE} width="25%" />
      <SortByTh sortBy={LoreSortBy.CREATEDBY} width="10%" />
      <SortByTh sortBy={LoreSortBy.SUBMITTED} width="12%" />
      <SortByTh sortBy={LoreSortBy.EXPIREDATE} width="12%" />
      <SortByTh sortBy={LoreSortBy.EARLIERST_EXEC} width="12%" />

      <SortByTh sortBy={LoreSortBy.VOTES} width="5%" />
      <SortByTh sortBy={LoreSortBy.STATUS} width="8%" />
    </tr>
  )
}

export const TLabel = ({ text, color }: { text: string | number; color?: string }) => {
  return (
    <p
      className="whitespace-nowrap font-tlm text-[16px] font-normal tracking-[0.1em]"
      style={{ color }}
    >
      {text}
    </p>
  )
}
export function loreStatusColorFinder(status: string) {
  switch (status) {
    case LoreStatus.COMPLETE:
      return Colors.CARIBBEAN_GREEN
    case LoreStatus.EXECUTED:
      return Colors.CARIBBEAN_GREEN
    case LoreStatus.FAILING:
      return Colors.HELIOTROPE
    case LoreStatus.EXPIRED:
      return Colors.RADICAL_RED
    case LoreStatus.MERGED:
      return Colors.CARIBBEAN_GREEN
    case LoreStatus.MINTPREP:
      return Colors.GRAY
    case LoreStatus.OPEN:
      return Colors.WEB_ORANGE
    case LoreStatus.PASSING:
      return Colors.CORNFLOWER_BLUE
    case LoreStatus.QUORUM_UNMET:
      return Colors.GRAY
  }
}

export function LoreTableCellRenderer(
  header: string,

  lore: LoreProposal,
  hovered: boolean
) {
  switch (header) {
    case LoreTableColumns.ID:
      return (
        <TLabel color={hovered ? Colors.DI_SERRIA : Colors.SNOW_WHITE} text={lore.proposal_id} />
      )
    case LoreTableColumns.TITLE:
      return (
        <TLabel
          text={truncateWithEllipsis(lore.title, 40)}
          color={hovered ? Colors.DI_SERRIA : Colors.SNOW_WHITE}
        />
      )
    case LoreTableColumns.CREATEDBY:
      return <TLabel text={lore.proposer} color={hovered ? Colors.DI_SERRIA : Colors.SNOW_WHITE} />
    case LoreTableColumns.SUBMITTED:
      return (
        <TLabel
          color={hovered ? Colors.DI_SERRIA : Colors.SNOW_WHITE}
          text={getFormattedProposalDate(lore?.submitted, '/', true)}
        />
      )

    case LoreTableColumns.EXPIREDATE:
      return (
        <TLabel
          color={hovered ? Colors.DI_SERRIA : Colors.SNOW_WHITE}
          text={getFormattedProposalDate(lore?.expires, '/', true)}
        />
      )
    case LoreTableColumns.EARLIERST_EXEC:
      return (
        <TLabel
          color={hovered ? Colors.DI_SERRIA : Colors.SNOW_WHITE}
          text={getFormattedProposalDate(lore?.earliest_exec, '/', true)}
        />
      )

    case LoreTableColumns.STATUS:
      return <TLabel color={loreStatusColorFinder(lore.status)} text={startCase(lore.status)} />
    case LoreTableColumns.VOTES:
      return (
        <div className="ml-[7px] flex">
          <TLabel
            color={hovered ? Colors.DI_SERRIA : Colors.SNOW_WHITE}
            text={lore.total_yes_votes + '/' + lore.total_no_votes}
          />
        </div>
      )

    default:
      break
  }
  return null
}

export function loreTableBodyRenderer({
  lores,
  selectedProposalId,
  onSelectLore,
}: {
  lores: LoreProposal[]
  selectedProposalId: number | null
  onSelectLore: (lore: LoreProposal) => void
}) {
  return (
    <motion.tbody>
      {map(lores, (lore) => {
        const isSelected = selectedProposalId === lore.proposal_id

        return (
          <motion.tr
            key={lore.proposal_id}
            className="h-[58px] cursor-pointer p-4 hover:rounded-lg hover:bg-[rgba(46,46,46,1)]"
            onClick={() => {
              onSelectLore(lore)
            }}
          >
            {map(loreTableRowRenderer(), (header: string) => {
              return (
                <td
                  key={`${lore.proposal_id}-${header}`}
                  style={{ padding: 0, paddingLeft: '20px', border: 'none' }}
                >
                  {LoreTableCellRenderer(header, lore, isSelected)}
                </td>
              )
            })}
          </motion.tr>
        )
      })}
    </motion.tbody>
  )
}

const Dashboard = ({ currentNumber }: { currentNumber: number }) => {
  const {
    isLoading,
    sortedLores,
    selectedLore,
    handleSelectLore,
    selectedProposalId,
    clearSelection,
  } = useLoreDashboard()

  if (isLoading) return <LoadingSpinner />

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between px-4">
        <p className="font-tlm text-[24px] font-semibold">Click on a proposal to vote on lore</p>
        <p className="font-orb text-[20px] font-normal" style={{ color: Colors.CARIBBEAN_GREEN }}>
          {currentNumber} VP Available
        </p>
      </div>
      <LoreDrawer
        isOpen={selectedLore !== null}
        onClose={clearSelection}
        lore={selectedLore}
        currentNumber={currentNumber}
      />
      <div
        className="flex flex-col gap-4 rounded-[20px] p-10"
        style={{ backgroundColor: Colors.COD_GRAY, opacity: 0.9 }}
      >
        <div className="w-full overflow-x-auto">
          <table className="w-full">
            <thead>{loreTableHeaderRenderer()}</thead>
            {loreTableBodyRenderer({
              lores: sortedLores,
              selectedProposalId,
              onSelectLore: (lore) => handleSelectLore(lore.proposal_id),
            })}
          </table>
        </div>
      </div>
    </div>
  )
}

export { Dashboard }
