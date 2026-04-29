//import { proposalsTableHeaderRendererVirtualised } from 'util/GovernanceHelper'

import { useEffect, useState } from 'react'

import { Flex } from '@chakra-ui/react'
import { ProposalDrawer } from 'features/syndicates/components/ProposalDrawer/ProposalDrawer'
import { FlattenedProposal } from 'features/syndicates/types/governanceTypes'
import {
  getProposalHoverColor,
  proposalsTableHeaderRendererVirtualised,
} from 'features/syndicates/utils/GovernanceHelper'
import { useMsigsProposals } from 'graphql/hooks/useMsigsProposals'
import { MsigsResponse } from 'graphql/types'
import { find, get, isEmpty, some, toNumber } from 'lodash'
import { useLocation } from 'react-router-dom'
import { AutoSizer, Table, InfiniteLoader } from 'react-virtualized'
import { useActions, useAppState } from 'store'

import 'react-virtualized/styles.css'

const ProposalsTableVirtualised = () => {
  const {
    main: {
      mining: { openSyndicatesProposalDrawer, closeSyndicatesProposalDrawer },
    },
  } = useActions()
  const {
    wax: { selectedDacId },
    main: { syndicatesProposalDrawer },
  } = useAppState()

  const { msigsProposals }: { msigsProposals: MsigsResponse[] } = useMsigsProposals(selectedDacId)
  const { pathname } = useLocation()

  const [sortBy, setSortBy] = useState('id')
  const [sortOrderDesc, setSortOrderDesc] = useState(true)

  const [renderedData, setRenderedData] = useState<FlattenedProposal[]>([])
  const [selectedProposal, setSelectedProposal] = useState<FlattenedProposal | null>(null)
  const [, setHasMore] = useState(true)

  const loadMoreRows = ({ startIndex, stopIndex }) => {
    if (renderedData.length >= msigsProposals.length) {
      setHasMore(false)
    } else {
      const nextData = transformProposals(msigsProposals.slice(startIndex, stopIndex + 1))
      setRenderedData((prevData) => [...prevData, ...nextData])
    }
  }
  const sortData = (data: FlattenedProposal[], sortKey: string) => {
    return [...data].sort((a, b) => {
      const aValue = a[sortKey as keyof FlattenedProposal] ?? ''
      const bValue = b[sortKey as keyof FlattenedProposal] ?? ''
      if (sortBy === 'id' && sortOrderDesc) {
        return toNumber(bValue) - toNumber(aValue)
      } else if (sortBy === 'id' && !sortOrderDesc) {
        return toNumber(aValue) - toNumber(bValue)
      } else if (sortOrderDesc) return String(bValue).localeCompare(String(aValue))
      else return String(aValue).localeCompare(String(bValue))
    })
  }
  const transformProposals = (msigsProposals: MsigsResponse[]): FlattenedProposal[] => {
    return msigsProposals.map((proposal) => ({
      id: proposal.id,
      proposalName: proposal.proposal_name,
      title: get(find(proposal?.metadata, { key: 'title' }), 'value', ''),
      description: get(find(proposal?.metadata, { key: 'description' }), 'value', ''),
      createdBy: proposal.proposer,
      to: proposal.unpacked.actions[0]?.data.to || '', // Assuming the first action is relevant
      item: proposal.unpacked.actions[0]?.data.quantity || '',
      date: proposal.modified_date,
      votes: proposal.provided_approvals.length,
      action: proposal.unpacked.actions[0]?.name || '',
      status: proposal.state,
      expiration: proposal.unpacked.expiration,
      totalVotes: 3,
      hasClaimBudget: some(proposal?.unpacked?.actions, { name: 'claimbudget' }),
      authorizationTo: some(proposal?.unpacked?.actions, { name: 'claimbudget' })
        ? get(proposal, 'unpacked.actions[0].authorization[0].actor', '')
        : '',
      unpacked: proposal.unpacked,
      approvals: proposal.provided_approvals,
    }))
  }

  const isRowLoaded = ({ index }) => index < renderedData.length

  useEffect(() => {
    if (msigsProposals.length) {
      const transformedData = transformProposals(msigsProposals)
      const sortedData = sortData(transformedData, sortBy)
      setRenderedData(sortedData)
    }
  }, [msigsProposals, sortBy, sortOrderDesc])
  const [hoveredIndex, setHoveredIndex] = useState(null)

  function selectProposal(proposal: FlattenedProposal) {
    setSelectedProposal(proposal)
    openSyndicatesProposalDrawer()
  }

  return (
    <Flex width="100%">
      <div style={{ height: '500px', width: '100%', overflow: 'auto' }} id="scrollableDiv">
        <InfiniteLoader
          isRowLoaded={isRowLoaded}
          loadMoreRows={loadMoreRows}
          rowCount={renderedData.length}
        >
          {({ onRowsRendered, registerChild }) => (
            <AutoSizer>
              {({ height, width }) => (
                <Table
                  ref={registerChild}
                  width={width}
                  height={height}
                  headerHeight={40}
                  rowHeight={50}
                  sortBy={sortBy}
                  rowCount={renderedData.length}
                  rowGetter={({ index }) => renderedData[index]}
                  onRowsRendered={onRowsRendered}
                  rowRenderer={(props) => {
                    const { index, style, key, columns, ...rest } = props

                    if (index === -1) return null // Skip header row

                    const rowData = renderedData[index]

                    const isHovered = hoveredIndex === index

                    const baseStyle = {
                      ...style,

                      overflow: 'visible',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s ease',
                    }

                    return (
                      <div
                        key={key}
                        {...rest}
                        style={{
                          ...baseStyle,
                          backgroundColor: isHovered
                            ? getProposalHoverColor(rowData.status)
                            : 'transparent',
                        }}
                        onMouseEnter={() => setHoveredIndex(index)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        onClick={() => {
                          selectProposal(rowData)
                        }}
                      >
                        {columns}
                      </div>
                    )
                  }}
                >
                  {proposalsTableHeaderRendererVirtualised(
                    pathname,
                    setSortBy,
                    setSortOrderDesc,
                    sortOrderDesc,
                    sortBy
                  )}
                </Table>
              )}
            </AutoSizer>
          )}
        </InfiniteLoader>
      </div>
      {!isEmpty(selectedProposal) && (
        <ProposalDrawer
          proposal={selectedProposal}
          isOpen={syndicatesProposalDrawer.isOpen}
          onClose={() => closeSyndicatesProposalDrawer()}
        />
      )}
    </Flex>
  )
}

export { ProposalsTableVirtualised }
