import React, { useEffect, useState, useMemo, memo } from 'react'

import { Box, Container, Flex } from '@chakra-ui/react'
import { GovernanceHeader } from 'features/syndicates/components/GovernanceHeader'
import { SyndicatesSidebar } from 'features/syndicates/pages/SyndicatesSidebar'
import { useDaoDetails } from 'graphql/hooks/useDaoDetails'
import { useDaoGlobals } from 'graphql/hooks/useDaoGlobals'
import { useDaoTreasuries } from 'graphql/hooks/useDaoTreasury'
import { useWalletDaoDetails } from 'graphql/hooks/useWalletDaoDetails'
import { useWalletDetails } from 'graphql/hooks/useWalletDetails'
import { Candidate } from 'graphql/types'
import { Outlet, matchPath, useLocation, useMatch } from 'react-router-dom'
import { unionDAOFinder } from 'shared/util/helpers'
import { useScreenSize } from 'shared/util/hooks'
import { useActions, useAppState } from 'store'
import { PagePath } from 'store/main/types'

const GovernanceLayout = memo(() => {
  const {
    wax: { resetCandidatesList, resetCustodiansList, resetCustodiansProposalsList },
  } = useActions()
  const {
    wax: { selectedDacId, votedCandidatesList, isSyndicatesSidebarOpen, walletId },
  } = useAppState()

  const location = useLocation()
  const { isDesktop } = useScreenSize()

  const [, setCandidatesList] = useState<Candidate[]>([])

  const memoizedSelectedDacId = useMemo(() => selectedDacId, [selectedDacId])
  const memoizedVotedCandidateList = useMemo(() => votedCandidatesList, [votedCandidatesList])
  const disableHeader = useMatch(PagePath.GovernanceSelect)

  useDaoTreasuries([memoizedSelectedDacId, unionDAOFinder(memoizedSelectedDacId)])
  useDaoGlobals(memoizedSelectedDacId)
  useDaoGlobals(unionDAOFinder(memoizedSelectedDacId))
  useDaoDetails(memoizedSelectedDacId)

  useWalletDetails(walletId)
  useWalletDaoDetails({ dacId: memoizedSelectedDacId, walletId })

  useEffect(() => {
    if (memoizedVotedCandidateList) {
      setCandidatesList(memoizedVotedCandidateList)
    }
    return () => {
      setCandidatesList(null)
    }
  }, [memoizedVotedCandidateList])

  useEffect(() => {
    resetCustodiansList()
    resetCandidatesList()
    resetCustodiansProposalsList()
    return () => {
      resetCustodiansList()
      resetCandidatesList()
      resetCustodiansProposalsList()
    }
  }, [memoizedSelectedDacId])

  const contentStyle = {
    width: '100%',
  }

  const isPlanetSelectPage = matchPath(PagePath.GovernanceSelect, location.pathname)
  return (
    <Container maxW="100%" paddingInline={{ base: 1, sm: 2 }}>
      <Box justifyContent="start">
        {!isPlanetSelectPage && <SyndicatesSidebar />}

        <Flex
          mt="-40px"
          alignItems="center"
          flexDirection="column"
          w={isDesktop && isSyndicatesSidebarOpen ? 'calc(100% - 320px)' : '100%'}
        >
          <Box {...contentStyle}>{!disableHeader && <GovernanceHeader />}</Box>

          <Box gap={4} width="full">
            <Outlet />
          </Box>
        </Flex>
      </Box>
    </Container>
  )
})

export default GovernanceLayout
