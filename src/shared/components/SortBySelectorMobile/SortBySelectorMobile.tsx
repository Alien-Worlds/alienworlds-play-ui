import { useState, VFC, useEffect } from 'react'

import { Dropdown, Option } from '@alien-worlds/uikit'
import { Flex } from '@chakra-ui/react'
import { debounce, map } from 'lodash'
import { dropdownStyles } from 'shared/util/helpers'
import { useAppState, useActions } from 'store'

const SortBySelectorMobile: VFC = () => {
  const {
    atomic: { setAssetsFilter },
  } = useActions()

  const {
    atomic: {
      assetsFilter: {
        view: { sortByOptions },
      },
    },
  } = useAppState()

  const {
    atomic: { assetsFilter },
  } = useAppState()

  const onSelectSortBy = (value) => {
    setAssetsFilter({
      ...assetsFilter,
      sortBy: value?.key ?? value,
    })
  }
  const onSelect = debounce(onSelectSortBy, 200)

  const [items, setItems] = useState<Option[]>([])
  const [selectedItem, setSelectedItem] = useState<string | null>(null)

  useEffect(() => {
    if (sortByOptions) {
      const data = map(sortByOptions, (item) => {
        return {
          label: item.name,
          value: item.sortBy.toString(),
        }
      })
      setItems(data)
    }
  }, [sortByOptions])

  useEffect(() => {
    if (
      assetsFilter?.view?.selectedSortByOption?.name &&
      assetsFilter.view.selectedSortByOption.name !== selectedItem
    ) {
      setSelectedItem(assetsFilter.view.selectedSortByOption.name)
      setAssetsFilter({
        ...assetsFilter,
        sortBy: assetsFilter.view.selectedSortByOption.sortBy,
      })
    }
  }, [assetsFilter.view.selectedSortByOption])

  if (!sortByOptions) return <></>

  return (
    <Flex direction="column" position="relative" minW="130px">
      <Dropdown
        defaultValue={items[0]}
        options={items}
        styles={dropdownStyles}
        onChange={(item: Option) => {
          onSelect(item.value)
        }}
        placeholder="Name"
        variant="simple"
        size="md"
      />
    </Flex>
  )
}

export { SortBySelectorMobile }
