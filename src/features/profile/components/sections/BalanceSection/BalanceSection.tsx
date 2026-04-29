/**
 * BalanceSection Component
 *
 * A comprehensive section that displays all user balances.
 * This component organizes different types of balances in a clean layout.
 */

import React from 'react'

import { NFTOldIcon, WaxIcon } from '@alien-worlds/icons'
import { Flex } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { formatUserPointsWithDecimal } from 'shared/util/helpers'

import { useProfileContext } from '../../../context/ProfileContext'
import { BalanceCard } from '../../ui/BalanceCard'

export const BalanceSection: React.FC = () => {
  const { state } = useProfileContext()
  const { balanceData } = state

  if (!balanceData) {
    return null
  }

  return (
    <Flex
      backgroundColor={Colors.BLACK_NEUTRAL}
      p="16px"
      direction="column"
      gap={2}
      borderRadius="12px"
    >
      <BalanceCard
        icon={<WaxIcon h="20px" w="20px" />}
        label="WAX TLM Balance"
        amount={balanceData.tlmBalance}
        currency="TLM"
      />

      <BalanceCard
        icon={<NFTOldIcon h="20px" w="20px" />}
        label="Shards"
        amount={formatUserPointsWithDecimal(balanceData.shards)}
        currency=""
      />
    </Flex>
  )
}
