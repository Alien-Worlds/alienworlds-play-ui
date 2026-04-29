/**
 * BalanceCard Component
 *
 * A reusable component for displaying balance information.
 * This component can be used for different types of balances (WAX, BSC, Shards, etc.).
 */

import React from 'react'

import { Flex, Text } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'

import { formatBalance } from '../../../utils/profile.utils'

interface BalanceCardProps {
  icon: React.ReactElement
  label: string
  amount: string | number
  currency?: string
  color?: string
  showIcon?: boolean
  className?: string
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  icon,
  label,
  amount,
  currency = 'TLM',
  color = Colors.SNOW_WHITE,
  showIcon = true,
  className,
}) => {
  const formattedAmount = formatBalance(amount)

  return (
    <Flex justifyContent="space-between" width="100%" className={className}>
      <Flex alignItems="center" gap={2}>
        {showIcon && (
          <Flex alignItems="center" justifyContent="center">
            {React.cloneElement(icon, { color: Colors.DI_SERRIA })}
          </Flex>
        )}
        <Text
          fontFamily="tlm"
          fontWeight="bold"
          fontSize="12px"
          letterSpacing="0.1em"
          color={Colors.DI_SERRIA}
        >
          {label}
        </Text>
      </Flex>
      <Flex alignItems="center" gap={1}>
        <Text fontSize="14px" fontFamily="orb" fontWeight={700} color={color}>
          {formattedAmount}
        </Text>
        {currency && (
          <Text fontSize="14px" fontFamily="orb" fontWeight={600} color={Colors.PERSIAN_GREEN}>
            {currency}
          </Text>
        )}
      </Flex>
    </Flex>
  )
}
