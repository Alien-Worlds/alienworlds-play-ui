import { useState } from 'react'

import { DropDownIcon, DropDownTwoWaysIcon } from '@alien-worlds/icons'
import {
  Flex,
  Text,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  chakra,
} from '@chakra-ui/react'
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
    <Th
      width={width}
      border="none"
      padding="10px"
      cursor="pointer"
      onClick={() => onSelectSortBy(sortBy)}
    >
      <chakra.span display="flex" textTransform="capitalize">
        <Text
          mr={2}
          pl={3}
          mb={4}
          fontSize="sm"
          fontFamily="tlm"
          fontWeight="bold"
          color={loreFilter.sortBy === sortBy ? Colors.SNOW_WHITE : Colors.GRAY_CHATEAU}
        >
          {LoreTableColumns[LoreSortBy[sortBy]]}
        </Text>
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
      </chakra.span>
    </Th>
  )
}

export function loreTableRowRenderer() {
  const defaultTableColumns = Object.values(LoreTableColumns)

  return filter(defaultTableColumns)
}

export function loreTableHeaderRenderer() {
  return (
    <Tr borderBottom="solid 1px" borderColor={Colors.JUMBO}>
      <SortByTh sortBy={LoreSortBy.ID} width="2%" />
      <SortByTh sortBy={LoreSortBy.TITLE} width="25%" />
      <SortByTh sortBy={LoreSortBy.CREATEDBY} width="10%" />
      <SortByTh sortBy={LoreSortBy.SUBMITTED} width="12%" />
      <SortByTh sortBy={LoreSortBy.EXPIREDATE} width="12%" />
      <SortByTh sortBy={LoreSortBy.EARLIERST_EXEC} width="12%" />

      <SortByTh sortBy={LoreSortBy.VOTES} width="5%" />
      <SortByTh sortBy={LoreSortBy.STATUS} width="8%" />
    </Tr>
  )
}

export const TLabel = ({ text, ...props }) => {
  return (
    <Text
      {...props}
      fontSize="16px"
      fontWeight={400}
      fontFamily="tlm"
      whiteSpace="nowrap"
      letterSpacing="0.1em"
    >
      {text}
    </Text>
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
        <Flex ml="7px">
          <TLabel
            color={hovered ? Colors.DI_SERRIA : Colors.SNOW_WHITE}
            text={lore.total_yes_votes + '/' + lore.total_no_votes}
          />
        </Flex>
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
  const MotionTr = motion(Tr)
  const MotionTbody = motion(Tbody)

  return (
    <MotionTbody>
      {map(lores, (lore) => {
        const isSelected = selectedProposalId === lore.proposal_id

        return (
          <MotionTr
            key={lore.proposal_id}
            cursor="pointer"
            height="58px"
            p={4}
            _hover={{ borderRadius: '8px', backgroundColor: Colors.MINE_SHAFT }}
            onClick={() => {
              onSelectLore(lore)
            }}
          >
            {map(loreTableRowRenderer(), (header: string) => {
              return (
                <Td key={`${lore.proposal_id}-${header}`} p={0} pl={5} border="none">
                  {LoreTableCellRenderer(header, lore, isSelected)}
                </Td>
              )
            })}
          </MotionTr>
        )
      })}
    </MotionTbody>
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
    <Flex direction="column" gap={4}>
      <Flex justifyContent="space-between" px={4}>
        <Text fontSize="24px" fontWeight={600} fontFamily="tlm">
          Click on a proposal to vote on lore
        </Text>
        <Text fontSize="20px" fontFamily="orb" fontWeight={400} color={Colors.CARIBBEAN_GREEN}>
          {currentNumber} VP Available
        </Text>
      </Flex>
      <LoreDrawer
        isOpen={selectedLore !== null}
        onClose={clearSelection}
        lore={selectedLore}
        currentNumber={currentNumber}
      />
      <Flex
        backgroundColor={Colors.COD_GRAY}
        opacity="0.9"
        padding="40px"
        borderRadius="20px"
        flexDirection="column"
        gap={4}
      >
        <TableContainer>
          <Table variant="simple">
            <Thead>{loreTableHeaderRenderer()}</Thead>
            {loreTableBodyRenderer({
              lores: sortedLores,
              selectedProposalId,
              onSelectLore: (lore) => handleSelectLore(lore.proposal_id),
            })}
          </Table>
        </TableContainer>
      </Flex>
    </Flex>
  )
}

export { Dashboard }
