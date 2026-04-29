import { useRef, useState, VFC } from 'react'

import { Dropdown, Option } from '@alien-worlds/uikit'
import { Flex } from '@chakra-ui/react'
import { find } from 'lodash'
import { useClickAway } from 'react-use'
import { dropdownStyles } from 'shared/util/helpers'
import { useActions, useAppState } from 'store'
import { filterLandRarities } from 'store/atomic/types'

const FilterLandRarity: VFC = () => {
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
      width={{ base: '100%', lg: '200px' }}
      minWidth={{ base: '0px', lg: '100px' }}
    >
      <Dropdown
        options={filterLandRarities}
        defaultValue={filterLandRarities[0]}
        value={find(filterLandRarities, (r) => r.value === landAssetsFilter?.rarity)}
        styles={dropdownStyles}
        onChange={(item: Option) => {
          setLandAssetsFilter({
            ...landAssetsFilter,
            rarity: item.value,
          })
          setMenuVisible(false)
        }}
        variant="simple"
        size="md"
      />
    </Flex>
  )
}

export { FilterLandRarity }
