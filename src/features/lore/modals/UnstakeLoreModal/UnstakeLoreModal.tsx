import { Button } from '@alien-worlds/uikit'
import { useApolloClient } from '@apollo/client'
import { Dialog, DialogPanel } from '@headlessui/react'
import { WALLET_DETAILS_QUERY_ALL } from 'graphql/queries/walletDetails'
import { useModalStore } from 'shared/store/modalStore'
import { Colors } from 'shared/util/colors'
import { useActions } from 'store'
const UnstakeLoreModal = () => {
  const secondaryModals = useModalStore((state) => state.secondaryModals)
  const setSecondaryModalActive = useModalStore((state) => state.setSecondaryModalActive)
  const client = useApolloClient()
  const {
    wax: { tryUnStakeLore },
  } = useActions()

  const handleClose = () => {
    setSecondaryModalActive({ modalName: 'UnstakeAllLoreModal', value: false })
  }

  return (
    <Dialog
      open={!!secondaryModals.UnstakeAllLoreModal}
      onClose={() => handleClose()}
      // Chakra's theme sets zIndices.modal/topbar to 20000/21000 (see shared/styles/theme.ts),
      // so the persistent sidebar and top bar would otherwise render above this Tailwind dialog.
      className="relative z-[30000]"
    >
      <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
        <DialogPanel
          className="relative max-h-[90vh] w-full max-w-md justify-center overflow-y-auto"
          style={{
            background: Colors.BLACK_SOLID_90,
            border: 'double 1px transparent',
            borderRadius: '20px',
            backgroundImage:
              'linear-gradient(#100F10, #100F10), linear-gradient(to bottom, #9C33B6, #4F60BC,#4657A5, #009BD4)',
            backgroundOrigin: 'border-box',
            backgroundClip: 'content-box, border-box',
          }}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={() => handleClose()}
            className="absolute right-4 top-4 text-2xl leading-none"
            style={{ color: Colors.SNOW_WHITE }}
          >
            &times;
          </button>
          <div className="flex flex-col gap-4 p-10">
            <p className="font-tlm text-[24px] font-semibold">Unstake All</p>
            <p className="font-tlm text-[16px] font-normal" style={{ color: Colors.JUMBO }}>
              By unstaking, you will lose all your vote power instantly. Your unstaked TLM will be
              available straight away.
            </p>
            <Button
              size="lg"
              variant="alert"
              fontSize={18}
              onClick={async () => {
                await tryUnStakeLore()
                await client.refetchQueries({ include: [WALLET_DETAILS_QUERY_ALL] })
              }}
            >
              Unstake All TLM
            </Button>
            <Button size="lg" variant="info" fontSize={18} onClick={() => handleClose()}>
              Cancel
            </Button>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export { UnstakeLoreModal }
