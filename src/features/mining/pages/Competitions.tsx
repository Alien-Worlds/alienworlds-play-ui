import { useState } from 'react'

import {
  Flex,
  Text,
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Grid,
  GridItem,
  useBreakpointValue,
} from '@chakra-ui/react'
import styled from '@emotion/styled'
import { CompetitionCard, TournamentStatus } from 'features/competitions/CompetitionCard'
import { CompetitionDrawer } from 'features/competitions/CompetitionDrawer'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner'
import { Tournament, useCompetitions } from 'graphql/hooks/useCompetitions'
import { map } from 'lodash'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'

const StyledTab = styled(Tab)({
  width: '212px',
  height: '48px',
  backgroundColor: Colors.COD_GRAY,
  fontFamily: 'Orbitron',
  letterSpacing: '1.16px',

  fontWeight: '700',
  color: Colors.SNOW_WHITE,
})
export const Competitions = () => {
  const tabsOptions = [
    { label: 'Upcoming', id: 'upcoming' },
    { label: 'Live', id: 'live' },
    { label: 'Processing', id: 'processing' },
    { label: 'Get Rewards', id: 'get-rewards' },
    { label: 'Completed', id: 'completed' },
  ]
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [currentCompetition, setCurrentCompetition] = useState<Tournament>(null)
  const tabOrientation = useBreakpointValue<'vertical' | 'horizontal'>({
    base: 'vertical',
    md: 'horizontal',
  })
  const {
    wax: { walletId },
  } = useAppState()
  const actions = useActions()

  const handleCurrentCompetition = (competition: Tournament) => {
    setCurrentCompetition(competition)
    setIsDrawerOpen(true)
  }
  const { tournaments, loading, error, refetch } = useCompetitions({ waxId: walletId })
  const handleClaimReward = async (tournament: Tournament) => {
    const success = await actions.wax.tryClaimTournamentReward(tournament.id)
    if (success) refetch()
  }

  if (typeof window !== 'undefined') {
    console.log('[Competitions page]', {
      walletId: walletId ?? '(no wallet)',
      loading,
      error: error?.message ?? null,
      counts: {
        upcoming: tournaments.upcoming.length,
        live: tournaments.live.length,
        processing: tournaments.processing.length,
        getRewards: tournaments.getRewards.length,
        completed: tournaments.completed.length,
      },
    })
  }

  if (loading) {
    return <LoadingSpinner />
  }
  return (
    <Flex flexDirection="column" position="relative">
      <Flex p={8} zIndex={2} flexDirection="column" gap={8}>
        {error && (
          <Box p={4} bg="red.900" borderRadius="md">
            <Text color="white" fontFamily="Titillium Web" fontSize="14px">
              Competitions query error: {error.message}
            </Text>
            <Text color="gray.300" fontSize="12px" mt={2}>
              Check the browser console for [useCompetitions] and [Competitions page] logs.
            </Text>
          </Box>
        )}
        <Box>
          <Text color="white" fontFamily="orbitron" fontSize="40px" fontWeight="400">
            Competitions
          </Text>
          <Text
            fontFamily="Titillium Web"
            color={Colors.GRAY_CHATEAU}
            fontSize="16px"
            fontWeight="400"
          >
            Your Hub for Alien Worlds Community Projects including Games, Lore, and Content.
            Technical information
          </Text>
        </Box>
        <CompetitionDrawer
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false)
            setCurrentCompetition(null)
          }}
          tournament={currentCompetition}
          onClaimReward={handleClaimReward}
          walletId={walletId}
        />
        <Flex>
          <Tabs
            variant="soft-rounded"
            width="100%"
            minW="auto"
            flexDirection="column"
            orientation={tabOrientation}
          >
            <TabList
              backgroundColor={Colors.COD_GRAY}
              borderRadius="20px"
              minW={{ base: '100%', md: 'max-content' }}
              alignItems="center"
              maxW="max-content"
            >
              {map(tabsOptions, (tab) => (
                <StyledTab
                  key={tab.id}
                  minW={{ base: '100%', md: 'max-content' }}
                  _selected={{ color: Colors.SNOW_WHITE, bg: Colors.DI_SERRIA }}
                  fontSize={['12px', '14px', '14px', '14px', '14x']}
                >
                  {tab.label}
                </StyledTab>
              ))}
            </TabList>

            <TabPanels>
              <TabPanel>
                <Flex mt={4} flexDir="column" gap={8}>
                  <Grid
                    gridTemplateColumns={{
                      base: 'repeat(1, 1fr)',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(2, 1fr)',
                      lg: 'repeat(3, 1fr)',
                      xl: 'repeat(3, 1fr)',
                      '2xl': 'repeat(4 , 1fr)',
                    }}
                    gap="12px"
                  >
                    {map(tournaments.upcoming, (tournament, index) => {
                      return (
                        <GridItem key={tournament.id + index}>
                          <CompetitionCard
                            tournament={tournament}
                            onCompetitionVisit={handleCurrentCompetition}
                            status={TournamentStatus.UPCOMING}
                          />
                        </GridItem>
                      )
                    })}
                  </Grid>
                </Flex>
              </TabPanel>
              <TabPanel>
                <Flex mt={4} flexDir="column" gap={8}>
                  <Grid
                    gridTemplateColumns={{
                      base: 'repeat(1, 1fr)',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                      lg: 'repeat(4, 1fr)',
                      xl: 'repeat(4, 1fr)',
                      '2xl': 'repeat(4, 1fr)',
                    }}
                    gap="12px"
                  >
                    {map(tournaments.live, (tournament, index) => (
                      <GridItem key={tournament.id + index}>
                        <CompetitionCard
                          tournament={tournament}
                          onCompetitionVisit={handleCurrentCompetition}
                          status={TournamentStatus.PLAYING}
                        />
                      </GridItem>
                    ))}
                  </Grid>
                </Flex>
              </TabPanel>
              <TabPanel>
                <Flex mt={4} flexDir="column" gap={8}>
                  <Grid
                    gridTemplateColumns={{
                      base: 'repeat(1, 1fr)',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                      lg: 'repeat(4, 1fr)',
                      xl: 'repeat(4, 1fr)',
                      '2xl': 'repeat(4, 1fr)',
                    }}
                    gap="12px"
                  >
                    {map(tournaments.processing, (tournament, index) => (
                      <GridItem key={tournament.id + index}>
                        <CompetitionCard
                          tournament={tournament}
                          onCompetitionVisit={handleCurrentCompetition}
                          status={TournamentStatus.PROCESSING}
                        />
                      </GridItem>
                    ))}
                  </Grid>
                </Flex>
              </TabPanel>
              <TabPanel>
                <Flex mt={4} flexDir="column" gap={8}>
                  <Grid
                    gridTemplateColumns={{
                      base: 'repeat(1, 1fr)',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                      lg: 'repeat(4, 1fr)',
                      xl: 'repeat(4, 1fr)',
                      '2xl': 'repeat(4, 1fr)',
                    }}
                    gap="12px"
                  >
                    {map(tournaments.getRewards, (tournament, index) => (
                      <GridItem key={tournament.id + index}>
                        <CompetitionCard
                          tournament={tournament}
                          onCompetitionVisit={handleCurrentCompetition}
                          status={TournamentStatus.CLAIMABLE}
                        />
                      </GridItem>
                    ))}
                  </Grid>
                </Flex>
              </TabPanel>
              <TabPanel>
                <Flex mt={4} flexDir="column" gap={8}>
                  <Grid
                    gridTemplateColumns={{
                      base: 'repeat(1, 1fr)',
                      sm: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                      lg: 'repeat(4, 1fr)',
                      xl: 'repeat(4, 1fr)',
                      '2xl': 'repeat(4, 1fr)',
                    }}
                    gap="12px"
                  >
                    {map(tournaments.completed, (tournament, index) => (
                      <GridItem key={tournament.id + index}>
                        <CompetitionCard
                          tournament={tournament}
                          onCompetitionVisit={handleCurrentCompetition}
                          status={TournamentStatus.COMPLETED}
                        />
                      </GridItem>
                    ))}
                  </Grid>
                </Flex>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </Flex>
      </Flex>
    </Flex>
  )
}
