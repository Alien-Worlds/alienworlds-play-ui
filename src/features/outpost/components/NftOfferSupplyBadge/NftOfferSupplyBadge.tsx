import { InfinityIcon } from '@alien-worlds/icons'
import { Box, VStack } from '@chakra-ui/react'
import { isNil, toNumber } from 'lodash'
import { Colors } from 'shared/util/colors'

interface RemainingSupplyBadgeProps {
  amount: number
  borderColor: string
}

const RemainingSupplyBadge = ({ amount, borderColor }: RemainingSupplyBadgeProps) => {
  return (
    <VStack spacing={0}>
      <Box
        fontFamily="orb"
        fontSize={22}
        fontWeight={900}
        color={amount === 0 ? Colors.MINE_SHAFT : borderColor}
        mb="-5px"
      >
        {amount > 99 ? '99+' : amount}
      </Box>
      <Box
        fontFamily="tlm"
        fontSize={8}
        fontWeight={600}
        color={amount === 0 ? Colors.MINE_SHAFT : Colors.GRAY_CHATEAU}
      >
        remaining
      </Box>
    </VStack>
  )
}

const getSupplyLeft = (issuedSupply: string, maxSupply: string) => {
  return toNumber(maxSupply) - toNumber(issuedSupply)
}

const getColorsBySupply = (supplyLeft: number, maxSupply: string) => {
  let borderColor = Colors.MINE_SHAFT
  let bgColor = Colors.MINE_SHAFT

  if (toNumber(maxSupply) === 0) {
    borderColor = Colors.SNOW_WHITE
  } else if (supplyLeft >= 50) {
    // 50-50+
    borderColor = Colors.AQUA
  } else if (supplyLeft >= 40 && supplyLeft < 50) {
    // 40-49
    borderColor = Colors.ROBINS_EGG_BLUE
  } else if (supplyLeft >= 30 && supplyLeft < 40) {
    // 30-39
    borderColor = Colors.INCH_WORM
  } else if (supplyLeft >= 20 && supplyLeft < 30) {
    // 20-29
    borderColor = Colors.SCHOOL_BUS_YELLOW
  } else if (supplyLeft >= 10 && supplyLeft < 20) {
    // 10-19
    borderColor = Colors.TANGERINE
  } else if (supplyLeft > 0 && supplyLeft < 10) {
    // 1-9+
    borderColor = Colors.RADICAL_RED
  } else if (supplyLeft === 0) {
    // 0
    bgColor = Colors.RADICAL_RED
  }

  return { borderColor, bgColor }
}

interface NftOfferSupplyBadgeProps {
  maxSupply: string
  issuedSupply: string
}

const NftOfferSupplyBadge = ({ maxSupply, issuedSupply }: NftOfferSupplyBadgeProps) => {
  if (!isNil(maxSupply) && toNumber(maxSupply) === 0) {
    return <InfinityIcon width={33} height={33} />
  }

  const supplyLeft = getSupplyLeft(issuedSupply, maxSupply)
  const { borderColor } = getColorsBySupply(supplyLeft, maxSupply)

  return <RemainingSupplyBadge amount={supplyLeft} borderColor={borderColor} />
}

export { NftOfferSupplyBadge, getColorsBySupply, getSupplyLeft }
