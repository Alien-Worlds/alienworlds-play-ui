/**
 * BalanceSection Component
 *
 * A comprehensive section that displays all user balances.
 * This component organizes different types of balances in a clean layout.
 */

import React from 'react'

import { NFTOldIcon, WaxIcon } from '@alien-worlds/icons'
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
    <div
      className="flex flex-col gap-2 rounded-[12px] p-[16px]"
      style={{ backgroundColor: Colors.BLACK_NEUTRAL }}
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
    </div>
  )
}
