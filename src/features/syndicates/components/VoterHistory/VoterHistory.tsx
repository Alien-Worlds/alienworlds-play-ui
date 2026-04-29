import { FC, useEffect, useState, useRef } from 'react'

import { Box, Flex, Text, TableContainer, Table, Thead, Th, Tr, Td, Tbody } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { LazyAvatarRing } from 'features/syndicates/components/LazyAvatarRing/LazyAvatarRing'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { map } from 'lodash'
import InfiniteScroll from 'react-infinite-scroll-component'
import { Colors } from 'shared/util/colors'
import { formatDate, getDacPlaceRingVariantByPlace } from 'shared/util/helpers'
import { useActions, useAppState } from 'store'
import { VotersHistoryItem } from 'store/wax/types'
import { v4 as uuidV4 } from 'uuid'

interface VoterHistoryProps {
  candidateId: string
}

const ThWrapper = styled(Th)({
  fontWeight: 'bold',
  fontFamily: 'Titillium Web',
  fontSize: '12px',
  lineHeight: '14px',
  color: Colors.DI_SERRIA,
})

const TdWrapper = styled(Td)({
  fontFamily: 'Titillium Web',
  fontSize: '14px',
  lineHeight: '20px',
})

export const VoterHistory: FC<VoterHistoryProps> = ({ candidateId: candidate }) => {
  const [items, setItems] = useState<Array<VotersHistoryItem>>([])
  const scrollableDiv = `scrollable_${uuidV4()}`
  const [offset, setOffset] = useState(0)
  const [dataLength, setDataLength] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const limit = 20
  const scrollableRef = useRef<HTMLDivElement | null>(null)

  const {
    wax: { selectedDacId, custodianVotersResponse },
  } = useAppState()

  const {
    wax: { getCandidateVotersHistory, cleanupVotersHistory },
  } = useActions()

  const fetchData = () => {
    getCandidateVotersHistory({ candidateId: candidate, dacId: selectedDacId, skip: offset, limit })
    setOffset(offset + limit)
  }

  const reset = () => {
    setItems([])
    setDataLength(0)
    setOffset(0)
    cleanupVotersHistory()
  }

  useEffect(() => {
    reset()
    fetchData()

    return () => {
      reset()
    }
  }, [])

  useEffect(() => {
    if (custodianVotersResponse) {
      const { total, results } = custodianVotersResponse

      // Check if there are more results available
      const hasMoreResults = total > offset
      setHasMore(hasMoreResults)

      // Combine the existing items with the new results
      const updatedItems = [...items, ...(results || [])]
      setItems(updatedItems)

      // Update the data length with the new items count
      const updatedDataLength = updatedItems.length
      setDataLength(updatedDataLength)
    }
  }, [custodianVotersResponse])

  if (items?.length > 0) {
    return (
      <Box
        backgroundColor={Colors.BLACK_ALPHA_80}
        p={5}
        mt={8}
        id={scrollableDiv}
        ref={scrollableRef}
      >
        <InfiniteScroll
          dataLength={dataLength}
          hasMore={hasMore}
          next={fetchData}
          height={300}
          loader={<LoadingSpinner inline />}
        >
          <TableContainer width="full" overflow="unset">
            <Table w="full" variant="unstyled">
              <Thead>
                <Tr>
                  <ThWrapper>User</ThWrapper>
                  <ThWrapper>Voting Power</ThWrapper>
                  <ThWrapper>Action</ThWrapper>
                  <ThWrapper>Date Voted</ThWrapper>
                  {/* 
                  Commented temporary. 
                  <ThWrapper>
                    TX
                  </ThWrapper> */}
                </Tr>
              </Thead>
              <Tbody>
                {map(items, (item) => (
                  <Tr key={`voter_${uuidV4()}`}>
                    <TdWrapper>
                      <Flex alignItems="center" gap={3}>
                        <LazyAvatarRing
                          radius={3}
                          playerWalletId={item.voter}
                          viewportContainer={scrollableRef.current}
                          variant={getDacPlaceRingVariantByPlace(11)}
                        />
                        <Text>{item?.voter}</Text>
                      </Flex>
                    </TdWrapper>
                    <TdWrapper>{item?.votingPower}</TdWrapper>
                    <TdWrapper>Vote</TdWrapper>
                    <TdWrapper>{formatDate(item.voteTimestamp)}</TdWrapper>
                    {/*
                      Commented temporary. 
                    <TdWrapper>
                      <Link href={`https://waxblock.io/transaction/${item.transactionId}`} isExternal>
                        View more
                      </Link>
                    </TdWrapper> */}
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TableContainer>
        </InfiniteScroll>
      </Box>
    )
  }
  return (
    <Flex justifyContent="center" m={4} alignItems="center" w="full">
      <Text fontFamily="orb" color={Colors.SECONDARY_GRAY}>
        No votes available
      </Text>
    </Flex>
  )
}
