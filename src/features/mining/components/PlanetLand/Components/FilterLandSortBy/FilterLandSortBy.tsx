import { useRef, useState, VFC } from 'react'

import { Dropdown, Option } from '@alien-worlds/uikit'
import { Flex } from '@chakra-ui/react'
import { find } from 'lodash'
import { useClickAway } from 'react-use'
import { dropdownStyles } from 'shared/util/helpers'
import { useActions, useAppState } from 'store'
import { sortLandsByOptions } from 'store/atomic/types'

const FilterLandSortBy: VFC = () => {
  const {
    atomic: { landAssetsFilter },
  } = useAppState()

  const {
    atomic: { setLandAssetsFilter },
  } = useActions()

  const [, setMenuVisible] = useState(false)

  const ref = useRef(null)
  useClickAway(ref, () => setMenuVisible(false))

  return (
    <Flex
      ref={ref}
      direction="column"
      position="relative"
      justifyContent="center"
      width={{ base: '100%', lg: '200px' }}
      minWidth={{ base: '0px', lg: '100px' }}
    >
      <Dropdown
        defaultValue={sortLandsByOptions[0]}
        options={sortLandsByOptions}
        value={find(sortLandsByOptions, (r) => r.value === landAssetsFilter?.sortBy)}
        styles={dropdownStyles}
        onChange={(item: Option) => {
          setLandAssetsFilter({
            ...landAssetsFilter,
            sortBy: item.value,
          })
          setMenuVisible(false)
        }}
        variant="simple"
        size="md"
      />
    </Flex>
  )
}

export { FilterLandSortBy }
