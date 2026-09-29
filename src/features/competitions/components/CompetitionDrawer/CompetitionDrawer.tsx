import { ReactNode } from 'react'

import { CopyIcon } from '@alien-worlds/icons'
import { Button, useBreakpointValue } from '@alien-worlds/uikit'
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from '@headlessui/react'
import {
  canClaimReward,
  DEFAULT_COMPETITIONS_URL,
  DEFAULT_TOURNAMENT_IMAGE,
  formatUtc,
} from 'features/competitions/utils/utils'
import { Tournament } from 'graphql/hooks/useCompetitions'
import { useCopyToClipboard } from 'react-use'
import { useSessionStore } from 'shared/store/sessionStore'
import { Colors } from 'shared/util/colors'
import { Constants } from 'shared/util/constants'
import { toastMessage } from 'shared/util/toast'

interface Props {
  isOpen: boolean
  onClose: () => void
  tournament: Tournament | null
  onClaimReward?: (tournament: Tournament) => void
  walletId?: string
}

const TOPBAR_HEIGHT = 90

const DetailRow = ({ label, value }: { label: string; value: ReactNode }) => (
  <div className="flex w-full justify-between">
    <p className="font-tlm text-base font-bold">{label}</p>
    <p className="font-tlm text-base font-normal" style={{ color: Colors.SILVER }}>
      {value}
    </p>
  </div>
)

export const CompetitionDrawer = ({
  onClose,
  isOpen,
  tournament,
  onClaimReward,
  walletId,
}: Props) => {
  const isDemoUser = useSessionStore((state) => state.isDemoUser)
  const [, copyToClipboard] = useCopyToClipboard()
  const demoTopbarHeight =
    useBreakpointValue({
      base: Constants.DEMO_TOPBAR_HEIGHT_MOBILE,
      sm: Constants.DEMO_TOPBAR_HEIGHT,
    }) ?? Constants.DEMO_TOPBAR_HEIGHT_MOBILE
  const top = TOPBAR_HEIGHT + (isDemoUser ? demoTopbarHeight : 0)

  return (
    <Dialog
      open={isOpen && tournament !== null}
      onClose={onClose}
      // Chakra's theme sets zIndices.modal/topbar to 20000/21000 (see shared/styles/theme.ts),
      // so the persistent sidebar and top bar would otherwise render above this Tailwind dialog.
      className="relative z-[30000]"
    >
      {/* The overlay only dims the page on smaller screens, matching the old Chakra drawer */}
      <DialogBackdrop className="fixed inset-0 bg-black/[0.48] lg:hidden" />
      <DialogPanel
        data-testid="competition-drawer-panel"
        className="fixed bottom-0 right-0 flex w-[270px] flex-col pb-5 text-white lg:w-[320px]"
        style={{
          top,
          borderRadius: '35px 0px 0px 35px',
          background: Colors.BLACK_SOLID_90,
        }}
      >
        <div className="mt-4 flex w-full flex-col gap-1 px-6 py-4">
          <div className="flex w-full items-start justify-between">
            <DialogTitle className="font-orb text-xl font-normal">{tournament?.title}</DialogTitle>
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className="mt-1 text-2xl leading-none"
              style={{ color: Colors.SNOW_WHITE }}
            >
              &times;
            </button>
          </div>
          <p className="font-tlm text-sm font-semibold" style={{ color: Colors.GRAY_CHATEAU }}>
            Competition ID: {tournament?.id}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <img
            src={tournament?.image || DEFAULT_TOURNAMENT_IMAGE}
            alt={tournament?.title}
            className="h-[136px] w-[272px] max-w-full rounded-xl object-cover object-[70%_30%]"
          />
          <div className="flex w-full flex-col gap-4 pt-4">
            {tournament && (
              <>
                <DetailRow
                  label="Start Date:"
                  value={formatUtc(tournament.start_time, 'dd.MM.yyyy')}
                />
                <DetailRow
                  label="Start Time:"
                  value={`${formatUtc(tournament.start_time, 'HH:mm:ss')} UTC`}
                />
                <DetailRow label="End Date:" value={formatUtc(tournament.end_time, 'dd.MM.yyyy')} />
                <DetailRow
                  label="End Time:"
                  value={`${formatUtc(tournament.end_time, 'HH:mm:ss')} UTC`}
                />
                <DetailRow label="Min.Number of Players:" value={tournament.min_players} />
                <DetailRow label="Max.Number of Players:" value={tournament.max_players} />
                <DetailRow label="Number of Players:" value={tournament.num_players} />
                <DetailRow label="Reward:" value={tournament.winnings_budget} />
              </>
            )}
            <div className="mt-5 w-full">
              <p className="font-tlm text-base font-bold">Competition Link</p>
              <div
                className="mt-3 flex items-center justify-between rounded-lg border py-[11px] pl-4 pr-3"
                style={{ borderColor: Colors.SILVER }}
              >
                <p>https://github.com/Alien-Worlds/the...</p>
                <button
                  type="button"
                  aria-label="Copy competition link"
                  onClick={() => {
                    copyToClipboard(tournament?.url || DEFAULT_COMPETITIONS_URL)
                    toastMessage('Url copied to Clipboard!')
                  }}
                >
                  <CopyIcon boxSize="25px" color={Colors.SNOW_WHITE} />
                </button>
              </div>
            </div>
            <div className="mt-5 w-full">
              <p className="font-tlm text-base font-bold">Rules :</p>
              <p>{tournament?.description}</p>
            </div>
            {canClaimReward(tournament, walletId) && onClaimReward && (
              <Button variant="primary" size="lg" onClick={() => onClaimReward(tournament)}>
                Claim rewards
              </Button>
            )}
            <Button
              variant="primary"
              size="lg"
              onClick={() => window.open(tournament?.url, '_blank')}
            >
              Visit
            </Button>
          </div>
        </div>
      </DialogPanel>
    </Dialog>
  )
}
