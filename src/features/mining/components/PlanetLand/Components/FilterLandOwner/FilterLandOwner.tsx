import { useEffect, useState, VFC } from 'react'

import { Flex, Input } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'

const FilterLandOwner: VFC = () => {
  const {
    atomic: { landAssetsFilter },
  } = useAppState()

  const {
    atomic: { setLandAssetsFilter },
  } = useActions()

  const [valueOwner, setValueOwner] = useState<string>('')

  useEffect(() => {
    setValueOwner(landAssetsFilter?.owner ?? '')
  }, [landAssetsFilter])

  return (
    <Flex
      py={2}
      px={4}
      cursor="pointer"
      borderRadius={20}
      whiteSpace="nowrap"
      fontWeight="semibold"
      letterSpacing="0.1em"
      justifyContent="center"
      color={Colors.MINE_SHAFT}
      backgroundColor={Colors.SNOW_WHITE}
      width={{ base: '100%', lg: '200px' }}
      minWidth={{ base: '0px', lg: '100px' }}
    >
      <Input
        type="text"
        width="100%"
        height="25px"
        variant="unstyled"
        value={valueOwner}
        placeholder="name.wam"
        onChange={({ target: { value } }) => {
          setValueOwner(value)
          setLandAssetsFilter({
            ...landAssetsFilter,
            owner: value,
          })
        }}
      />
    </Flex>
  )
}

export { FilterLandOwner }
