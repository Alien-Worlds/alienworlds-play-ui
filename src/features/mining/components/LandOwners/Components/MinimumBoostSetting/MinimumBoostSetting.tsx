import { useEffect, useState } from 'react'

import { Dropdown, Option } from '@alien-worlds/uikit'
import { Flex, Text } from '@chakra-ui/react'
import { BoostLevels } from 'features/mining/utils/constants'
import { find, map } from 'lodash'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'

import { Constants } from '../../../../../../shared/util/constants'

const MinimumBoostSetting = () => {
  const {
    wax: { managingLandId, managingLandDetails, walletId },
  } = useAppState()

  const {
    wax: { setMinBoost, loadManagingLandDetailsAndBoostsWithDelay },
  } = useActions()

  const [selectedMinimumBoost, setSelectedMinimumBoost] = useState<any>(null)

  useEffect(() => {
    const landMinimumBoost =
      (managingLandDetails?.data?.MinBoostAmount ?? Constants.DEFAULT_LAND_MIN_BOOST_AMOUNT) / 10000
    const landMinimumBoostLevel = find(BoostLevels, (boost) => boost.price === landMinimumBoost)

    setSelectedMinimumBoost({
      value: landMinimumBoostLevel?.name,
      label: landMinimumBoostLevel?.name,
    })
  }, [managingLandDetails])

  const handleOnSave = async (item: Option) => {
    const boostLevel = find(BoostLevels, (boost) => boost.name === item.value)

    if (boostLevel.name !== selectedMinimumBoost?.value) {
      const isSuccess = await setMinBoost({ landId: managingLandId, levelPrice: boostLevel.price })

      if (isSuccess) {
        setSelectedMinimumBoost({ value: boostLevel.name, label: boostLevel.name })
        loadManagingLandDetailsAndBoostsWithDelay()
      }
    }
  }

  if (!managingLandDetails || !selectedMinimumBoost?.value) return null

  return (
    <Flex
      gap={1}
      flexDirection="column"
      marginLeft={{ base: 0, lg: 'auto' }}
      alignItems={{ base: 'center', lg: 'flex-start' }}
    >
      <Text fontWeight="semibold" fontSize="sm" textAlign="start" color={Colors.GRAY}>
        Public Minimum Boosts
      </Text>

      <Flex width={{ base: '80%', sm: '50%', md: '40%', lg: '100%' }}>
        <Dropdown
          isDisabled={managingLandDetails?.owner !== walletId}
          defaultValue={selectedMinimumBoost}
          options={map(BoostLevels, (level) => ({
            value: level.name,
            label: level.name,
          }))}
          onChange={handleOnSave}
          variant="simple"
          size="md"
          styles={{
            dropdownIndicator: () => {
              return {
                display: managingLandDetails?.owner === walletId ? 'flex' : 'none',
              }
            },
            control: () => {
              return {
                paddingLeft: '0px',
              }
            },
            container: () => {
              return {
                cursor: 'pointer',
                textAlign: 'center',
              }
            },
            input: () => {
              return {
                cursor: 'pointer',
              }
            },
            menu: () => {
              return {
                cursor: 'pointer',
                width: '150px',
                textAlign: 'center',
              }
            },
            option: () => {
              return {
                cursor: 'pointer',
              }
            },
          }}
        />
      </Flex>
    </Flex>
  )
}

export { MinimumBoostSetting }
