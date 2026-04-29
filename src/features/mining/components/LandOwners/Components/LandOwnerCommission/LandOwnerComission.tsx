import { useState, useEffect } from 'react'

import { Button, useBreakpointValue } from '@alien-worlds/uikit'
import {
  Flex,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Text,
} from '@chakra-ui/react'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { LooseObject } from 'features/inventory/utils/NFTCardHelper'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { usePlanetDetail } from 'graphql/hooks/usePlanetDetail'
import { get, last, split, toLower, toUpper } from 'lodash'
import { Colors } from 'shared/util/colors'
import { useActions } from 'store'

interface NFTLandOwnerCommissionProps {
  asset: LooseObject
  landAsset: IAsset
}
const NFTLandOwnerCommission = ({ asset, landAsset }: NFTLandOwnerCommissionProps) => {
  const type = toUpper(get(asset, 'type.name', null))
  const commission = get(asset, 'commission.name', 0)
  const assetId = get(asset, 'assetId.name', null)
  const [currentCommission, setCurrentCommission] = useState<number>(commission)
  const [inputValue, setInputValue] = useState<string>(String(commission || ''))
  const [error, setError] = useState<string | null>(null)
  const planetName = toLower(last(split(landAsset?.data?.name, ' ')))
  const { planetDetails: landPlanet, loading } = usePlanetDetail(planetName)

  // Sync input value when commission prop changes
  useEffect(() => {
    setInputValue(String(commission || ''))
    setCurrentCommission(commission)
  }, [commission])

  const minCommissionValue = get(landPlanet, 'land_commission_override.min_commission', 0)
  const maxCommissionValue = get(landPlanet, 'land_commission_override.max_commission')
  // On-chain values are integers where actual % = value / 100
  // Convert to percentage format for user input (0-25 for 0-25%)
  const min = minCommissionValue / 100
  const max =
    maxCommissionValue === null || maxCommissionValue === undefined || maxCommissionValue === 0
      ? 25
      : maxCommissionValue / 100

  const {
    wax: { trySetCommission },
  } = useActions()

  function setValue(valueAsString: string, valueAsNumber?: number) {
    setError(null)

    // Always update the input string to allow typing decimals
    setInputValue(valueAsString)

    try {
      // Allow empty string or just a decimal point while typing
      if (valueAsString === '' || valueAsString === '.' || valueAsString === '-') {
        setCurrentCommission(0)
        return
      }

      // Parse the value, handling decimals properly
      const numValue = valueAsNumber !== undefined ? valueAsNumber : parseFloat(valueAsString)

      // Only update numeric value if it's a valid number
      if (!isNaN(numValue)) {
        setCurrentCommission(numValue)

        // Validate on input change
        if (numValue < min) {
          setError(`Commission cannot be less than ${min}%`)
          return
        }
        if (numValue > max) {
          setError(`Commission cannot be greater than ${max}%`)
          return
        }
      }
    } catch (ex) {
      console.log(ex)
    }
  }

  function setCommission() {
    setError(null)

    // Validate minimum
    if (currentCommission < min) {
      setError(`Commission cannot be less than ${min}%`)
      return
    }

    // Validate maximum
    if (currentCommission > max) {
      setError(`Commission cannot be greater than ${max}%`)
      return
    }

    // Multiply by 100 to convert percentage to on-chain integer format
    // e.g., 2.5% becomes 250 on-chain
    const onChainValue = Math.round(currentCommission * 100)
    trySetCommission({ landId: assetId, commission: String(onChainValue) })
  }
  const inputWidth = useBreakpointValue({ base: '75px', sm: '100%' })
  const inputMinWidth = useBreakpointValue({ base: '0', sm: '220px' })

  if (type !== 'LAND') return null
  if (loading) return <LoadingSpinner />
  return (
    <Flex direction="column" w="full">
      <Text mb={2}>Landowner commission</Text>
      <Flex
        align="center"
        left={0}
        right={0}
        mx="auto"
        w="100%"
        gap={4}
        justifyContent="space-between"
      >
        <NumberInput
          isDisabled={!asset?.isUserOwner}
          size="md"
          isInvalid={!!error}
          color="white"
          step={0.01}
          width={inputWidth}
          minWidth={inputMinWidth}
          value={inputValue}
          onChange={setValue}
          precision={2}
          allowMouseWheel
          clampValueOnBlur={false}
        >
          <NumberInputField />
          <NumberInputStepper>
            <NumberIncrementStepper />
            <NumberDecrementStepper />
          </NumberInputStepper>
        </NumberInput>

        <Button
          size="sm"
          variant="negative"
          onClick={setCommission}
          disabled={!asset?.isUserOwner}
          cursor={asset?.isUserOwner ? 'pointer' : 'not-allowed'}
        >
          Set
        </Button>
      </Flex>
      {
        <Text fontSize="14px" color={Colors.RADICAL_RED}>
          {error}
        </Text>
      }
    </Flex>
  )
}

export { NFTLandOwnerCommission }
