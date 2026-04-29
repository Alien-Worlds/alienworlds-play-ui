import { VFC } from 'react'

import { ReverseSortingIcon, SortingIcon } from '@alien-worlds/icons'
import { Flex, Button } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'

const FilterLandToggleSort: VFC = () => {
  const {
    atomic: { landAssetsFilter },
  } = useAppState()

  const {
    atomic: { setLandAssetsFilter },
  } = useActions()
  return (
    <Flex w="fit-content">
      <Button
        p={0}
        size="sm"
        variant="dark"
        fontFamily="tlm"
        minW="65px !important"
        maxW="65px !important"
        color={landAssetsFilter.reversed ? Colors.DI_SERRIA : Colors.SNOW_WHITE}
        rightIcon={
          landAssetsFilter.reversed ? (
            <ReverseSortingIcon boxSize={24} color={Colors.DI_SERRIA} />
          ) : (
            <SortingIcon boxSize={24} />
          )
        }
        onClick={() => {
          setLandAssetsFilter({
            ...landAssetsFilter,
            reversed: !landAssetsFilter.reversed,
          })
        }}
      >
        {landAssetsFilter.reversed ? 'Z-A' : 'A-Z'}
      </Button>
    </Flex>
  )
}

export { FilterLandToggleSort }
