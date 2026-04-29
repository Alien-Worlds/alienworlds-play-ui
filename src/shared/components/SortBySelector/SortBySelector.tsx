import { useState, useRef, useEffect } from 'react'

import { Dropdown, Option } from '@alien-worlds/uikit'
import { Flex } from '@chakra-ui/react'
import { find, get, map } from 'lodash'
import { matchPath } from 'react-router'
import { useClickAway } from 'react-use'
import { router } from 'routes'
import { dropdownStyles } from 'shared/util/helpers'
import { useAppState, useActions } from 'store'
import { mapToSortByOptions } from 'store/atomic/helpers'
import { AssetSchema, SortBy } from 'store/atomic/types'
import { PagePath } from 'store/main/types'

export interface SortBySelectorProps {
  defaultValue: {
    name: string
    sortBy: SortBy
  }
  width?: string | number
}

const SortBySelector = ({ defaultValue, width }: SortBySelectorProps) => {
  const {
    atomic: { setAssetsFilter },
  } = useActions()

  const {
    atomic: { assetsFilter },
  } = useAppState()
  const isToolsPage = matchPath(PagePath.GovernanceSelect, router.state.location.pathname)
  const [, setMenuVisible] = useState<boolean>(false)
  const [sortByOptions, setSortByOptions] = useState<Option[]>([])
  const sortByOpts = mapToSortByOptions(isToolsPage ? AssetSchema.TOOL : null)

  const sortByRef = useRef(null)
  useClickAway(sortByRef, () => {
    setMenuVisible(false)
  })

  const onSelectSortBy = (value) => {
    setMenuVisible(false)

    const selectedValue = value?.sortBy ?? value

    const sortByIndex = find(sortByOpts, (o) => o.name === selectedValue)?.sortBy

    setAssetsFilter({
      ...assetsFilter,
      sortBy: sortByIndex,
    })
  }

  useEffect(() => {
    setSortByOptions(
      map(get(assetsFilter, 'view.sortByOptions', []), (item: { name: string }) => {
        return { value: item.name, label: item.name }
      })
    )
  }, [assetsFilter])

  useEffect(() => {
    return () => {
      setAssetsFilter({
        ...assetsFilter,
        sortBy: isToolsPage ? SortBy.RARITY : SortBy.NAME,
      })
    }
  }, [])

  if (!assetsFilter?.view) return <></>

  return (
    <Flex ref={sortByRef} direction="column" position="relative" minW="120px" width={width}>
      <Dropdown
        options={sortByOptions}
        onChange={(item: Option) => {
          onSelectSortBy(item.value)
        }}
        styles={dropdownStyles}
        placeholder={defaultValue?.name}
        variant="simple"
        size="md"
      ></Dropdown>
    </Flex>
  )
}

export { SortBySelector }
