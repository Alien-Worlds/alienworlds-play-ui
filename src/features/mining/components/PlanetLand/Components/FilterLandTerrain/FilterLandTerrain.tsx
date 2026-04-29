import { useRef, useState, VFC } from 'react'

import { Dropdown, Option } from '@alien-worlds/uikit'
import { Flex } from '@chakra-ui/react'
import { find } from 'lodash'
import { useClickAway } from 'react-use'
import { useActions, useAppState } from 'store'
import { filterTerrainsOptions } from 'store/atomic/types'

const FilterLandTerrain: VFC = () => {
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
        defaultValue={filterTerrainsOptions[0]}
        options={filterTerrainsOptions}
        value={find(filterTerrainsOptions, (t) => t.value === landAssetsFilter?.terrain)}
        styles={{
          valueContainer: () => {
            return {
              scrollbarWidth: 'none',
              scrollMarginInline: '15px',
            }
          },
          input: () => {
            return {
              cursor: 'pointer',
            }
          },
          menu: () => {
            return {
              width: '100%',
              cursor: 'pointer',
            }
          },
          option: () => {
            return {
              cursor: 'pointer',
            }
          },
        }}
        onChange={(item: Option) => {
          setLandAssetsFilter({
            ...landAssetsFilter,
            terrain: item.value,
          })
          setMenuVisible(false)
        }}
        variant="simple"
        size="md"
      />
    </Flex>
  )
}

export { FilterLandTerrain }
