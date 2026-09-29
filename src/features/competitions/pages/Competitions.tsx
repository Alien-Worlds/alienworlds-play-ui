import { useState } from 'react'

import { useBreakpointValue } from '@alien-worlds/uikit'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { CompetitionCard } from 'features/competitions/components/CompetitionCard'
import { CompetitionDrawer } from 'features/competitions/components/CompetitionDrawer'
import { useCompetitionsStore } from 'features/competitions/store/competitionsStore'
import { TournamentStatus } from 'features/competitions/types/competitionTypes'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner'
import {
  Competitions as CompetitionsData,
  Tournament,
  useCompetitions,
} from 'graphql/hooks/useCompetitions'
import { map } from 'lodash'
import { useSessionStore } from 'shared/store/sessionStore'
import { Colors } from 'shared/util/colors'

const TABS: {
  id: string
  label: string
  key: keyof CompetitionsData
  status: TournamentStatus
  gridClassName: string
}[] = [
  {
    id: 'upcoming',
    label: 'Upcoming',
    key: 'upcoming',
    status: TournamentStatus.UPCOMING,
    gridClassName: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4',
  },
  {
    id: 'live',
    label: 'Live',
    key: 'live',
    status: TournamentStatus.PLAYING,
    gridClassName: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  },
  {
    id: 'processing',
    label: 'Processing',
    key: 'processing',
    status: TournamentStatus.PROCESSING,
    gridClassName: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  },
  {
    id: 'get-rewards',
    label: 'Get Rewards',
    key: 'getRewards',
    status: TournamentStatus.CLAIMABLE,
    gridClassName: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  },
  {
    id: 'completed',
    label: 'Completed',
    key: 'completed',
    status: TournamentStatus.COMPLETED,
    gridClassName: 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4',
  },
]

export const Competitions = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [currentCompetition, setCurrentCompetition] = useState<Tournament>(null)
  const isVertical =
    useBreakpointValue<boolean>({
      base: true,
      md: false,
    }) ?? true
  const walletId = useSessionStore((state) => state.walletId)
  const claimTournamentReward = useCompetitionsStore((state) => state.claimTournamentReward)

  const handleCurrentCompetition = (competition: Tournament) => {
    setCurrentCompetition(competition)
    setIsDrawerOpen(true)
  }
  const { tournaments, loading, error, refetch } = useCompetitions({ waxId: walletId })
  const handleClaimReward = async (tournament: Tournament) => {
    const success = await claimTournamentReward(tournament.id)
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
    <div className="relative flex flex-col">
      <div className="z-[2] flex flex-col gap-8 p-8">
        {error && (
          <div role="alert" className="rounded-md bg-[#63171B] p-4">
            <p className="font-tlm text-sm text-white">Competitions query error: {error.message}</p>
            <p className="mt-2 text-xs text-[#CBD5E0]">
              Check the browser console for [useCompetitions] and [Competitions page] logs.
            </p>
          </div>
        )}
        <div>
          <h1 className="font-orb text-[40px] font-normal text-white">Competitions</h1>
          <p className="font-tlm text-base font-normal" style={{ color: Colors.GRAY_CHATEAU }}>
            Your Hub for Alien Worlds Community Projects including Games, Lore, and Content.
            Technical information
          </p>
        </div>
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
        <TabGroup vertical={isVertical} className="flex w-full flex-col">
          <TabList
            className="flex w-full max-w-max flex-col items-center rounded-[20px] md:w-max md:flex-row"
            style={{ backgroundColor: Colors.COD_GRAY }}
          >
            {map(TABS, (tab) => (
              <Tab
                key={tab.id}
                // Colors.DI_SERRIA when selected, Colors.COD_GRAY otherwise
                className={({ selected }) =>
                  `h-12 w-full rounded-full px-4 font-orb text-xs font-bold tracking-[1.16px] text-white outline-none md:w-[212px] md:text-sm ${
                    selected ? 'bg-[rgb(217,165,85)]' : 'bg-[rgb(17,17,17)]'
                  }`
                }
              >
                {tab.label}
              </Tab>
            ))}
          </TabList>

          <TabPanels>
            {map(TABS, (tab) => (
              <TabPanel key={tab.id} className="p-4 outline-none">
                <div className={`mt-4 grid gap-3 ${tab.gridClassName}`}>
                  {map(tournaments[tab.key], (tournament, index) => (
                    <CompetitionCard
                      key={`${tournament.id}-${index}`}
                      tournament={tournament}
                      onCompetitionVisit={handleCurrentCompetition}
                      status={tab.status}
                    />
                  ))}
                </div>
              </TabPanel>
            ))}
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  )
}
