/**
 * BalanceCard Component
 *
 * A reusable component for displaying balance information.
 * This component can be used for different types of balances (WAX, BSC, Shards, etc.).
 */

import React from 'react'

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
    <div className={`flex w-full justify-between ${className ?? ''}`}>
      <div className="flex items-center gap-2">
        {showIcon && (
          <div className="flex items-center justify-center">
            {React.cloneElement(icon, { color: Colors.DI_SERRIA })}
          </div>
        )}
        <p
          className="font-tlm text-[12px] font-bold tracking-[0.1em]"
          style={{ color: Colors.DI_SERRIA }}
        >
          {label}
        </p>
      </div>
      <div className="flex items-center gap-1">
        <p className="font-orb text-[14px] font-bold" style={{ color }}>
          {formattedAmount}
        </p>
        {currency && (
          <p className="font-orb text-[14px] font-semibold" style={{ color: Colors.PERSIAN_GREEN }}>
            {currency}
          </p>
        )}
      </div>
    </div>
  )
}
