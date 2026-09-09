import { CrossIcon } from '@alien-worlds/icons'
import { Dialog, DialogPanel } from '@headlessui/react'
import { AssetsFilterPanelMobile } from 'features/inventory/components/AssestsFilterPanelMobil'
import { Colors } from 'shared/util/colors'
import { useAppState } from 'store'

interface InventoryFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const InventoryFiltersDrawer = ({ isOpen, onClose }: InventoryFilterDrawerProps) => {
  const {
    wax: { isDemoUser },
  } = useAppState()

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      // Chakra's theme sets zIndices.modal/topbar to 20000/21000 (see shared/styles/theme.ts),
      // so the persistent sidebar and top bar would otherwise render above this Tailwind dialog.
      className="relative z-[30000]"
    >
      <div
        className="fixed inset-0 flex flex-col pt-[90px]"
        style={{ backgroundColor: Colors.BLACK_NEUTRAL }}
      >
        <DialogPanel className="flex h-full w-full flex-col">
          <div
            className={`flex items-center justify-between border-b px-6 py-4 ${
              isDemoUser ? 'mt-10' : 'mt-0'
            }`}
            style={{ borderColor: Colors.MINE_SHAFT }}
          >
            <p className="font-orb text-2xl font-normal">Select Filters</p>
            <button
              type="button"
              aria-label="close drawer"
              onClick={onClose}
              style={{ color: Colors.SNOW_WHITE }}
            >
              <CrossIcon />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto px-[18px] py-2 md:hidden">
            <AssetsFilterPanelMobile />
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}
