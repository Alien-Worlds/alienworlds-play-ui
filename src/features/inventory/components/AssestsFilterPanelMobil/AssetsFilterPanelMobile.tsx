import { ReverseSortingIcon, SortingIcon } from '@alien-worlds/icons'
import { Switch } from '@headlessui/react'
import { FilterBySelectorMobile } from 'features/inventory/components/FilterBySelectorMobil/FilterBySelectorMobile'
import { useMatch } from 'react-router-dom'
import { SortBySelectorMobile } from 'shared/components/SortBySelectorMobile/SortBySelectorMobile'
import { Colors } from 'shared/util/colors'
import { useAppState, useActions } from 'store'
import { AssetType } from 'store/atomic/types'
import { PagePath } from 'store/main/types'

const ToggleSwitch = ({
  checked,
  onChange,
  label,
}: {
  checked: boolean
  onChange: (value: boolean) => void
  label: string
}) => (
  <Switch
    checked={checked}
    onChange={onChange}
    aria-label={label}
    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
      checked ? 'bg-[green]' : 'bg-gray-600'
    }`}
  >
    <span
      className={`inline-block size-6 transform rounded-full bg-white transition-transform ${
        checked ? 'translate-x-7' : 'translate-x-1'
      }`}
    />
  </Switch>
)

const AssetsFilterPanelMobile = () => {
  const {
    atomic: { assetsFilter },
  } = useAppState()

  const {
    atomic: { setAssetsFilter },
  } = useActions()

  const isInventoryPage = useMatch(PagePath.Inventory)

  const changeGroupByTemplate = (value: boolean) => {
    setAssetsFilter({
      ...assetsFilter,
      groupByTemplate: value,
    })
  }

  const changeReversed = (value: boolean) => {
    setAssetsFilter({
      ...assetsFilter,
      reversed: value,
    })
  }

  if (!assetsFilter?.view) return <></>

  return (
    <div className="m-0 w-full max-w-full p-0 lg:max-w-fit lg:p-2">
      <div className="flex flex-col gap-4 px-[2px] md:px-0">
        <div className="flex w-full flex-wrap items-center">
          <p
            className="mr-4 min-w-[5rem] whitespace-nowrap font-tlm tracking-[0.1em]"
            style={{ color: Colors.SNOW_WHITE }}
          >
            Filter by
          </p>
          <div className="grow">
            <FilterBySelectorMobile />
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center">
          <p
            className="mr-4 min-w-[5rem] whitespace-nowrap font-tlm tracking-[0.1em]"
            style={{ color: Colors.SNOW_WHITE }}
          >
            Sort by
          </p>
          <div className="grow">
            <SortBySelectorMobile />
          </div>
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2">
            <p>{assetsFilter.reversed ? 'Z-A' : 'A-Z'}</p>
            {assetsFilter.reversed ? (
              <ReverseSortingIcon boxSize="18px" />
            ) : (
              <SortingIcon boxSize="18px" />
            )}
          </div>
          <ToggleSwitch
            checked={assetsFilter.reversed}
            onChange={changeReversed}
            label="Reverse sort order"
          />
        </div>
        {isInventoryPage &&
          assetsFilter?.view?.tabOptions[assetsFilter?.view?.selectedTabIndex]?.name !==
            AssetType.LAND && (
            <div className="flex w-full items-center justify-between">
              <div className="flex items-center gap-2">
                <p>Group</p>
              </div>
              <ToggleSwitch
                checked={assetsFilter.groupByTemplate}
                onChange={changeGroupByTemplate}
                label="Group by template"
              />
            </div>
          )}
      </div>
    </div>
  )
}

export { AssetsFilterPanelMobile }
