import { useCallback, useMemo, useRef, VFC } from 'react'

import { Dropdown, Option } from '@alien-worlds/uikit'
import { Flex } from '@chakra-ui/react'
import { find, get, map } from 'lodash'
import { useClickAway } from 'react-use'
import { dropdownStyles } from 'shared/util/helpers'
import { useAppState, useActions } from 'store'
import { FilterByOption, filterByToolTypeOptions, ToolType } from 'store/atomic/types'

const FilterByToolTypeSelectorComponent: VFC = () => {
  const {
    atomic: { setFilterByToolType },
  } = useActions()

  const {
    atomic: { filterByToolType },
  } = useAppState()

  const sortByRef = useRef(null)

  useClickAway(sortByRef, () => {
    // Handle click away if needed in the future
  })

  const onSelectFilterBy = useCallback(
    (value: FilterByOption) => {
      const newSelectedItem = find(filterByToolTypeOptions, (item) => {
        return item.filterBy === value.filterBy
      })

      setFilterByToolType({
        ...filterByToolType,
        selectedFilterByOption: newSelectedItem,
      })
    },
    [filterByToolType, setFilterByToolType]
  )

  const options = useMemo(() => {
    if (!filterByToolType?.filterByOptions) return []

    return map(
      get(filterByToolType, 'filterByOptions', []),
      (opt): Option => ({ value: opt.name, label: opt.filterBy as string })
    )
  }, [filterByToolType?.filterByOptions])

  const handleDropdownChange = useCallback(
    (opt: Option) => {
      onSelectFilterBy({
        name: opt?.label,
        filterBy: opt?.label as ToolType,
      })
    },
    [onSelectFilterBy]
  )

  if (!filterByToolType) return null

  return (
    <Flex ref={sortByRef} direction="column" position="relative" minW="160px" w="100%">
      <Dropdown
        onChange={handleDropdownChange}
        size="md"
        variant="classic"
        options={options}
        placeholder="Tool Type"
        styles={dropdownStyles}
      />
    </Flex>
  )
}

const FilterByToolTypeSelector = FilterByToolTypeSelectorComponent

export { FilterByToolTypeSelector }
