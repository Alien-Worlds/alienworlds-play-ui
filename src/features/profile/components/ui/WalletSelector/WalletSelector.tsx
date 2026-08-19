/**
 * WalletSelector Component
 *
 * A component that displays wallet selection options and current wallet status.
 * This component handles wallet switching and display logic.
 */

import React from 'react'

import wcwLogo from 'assets/images/wcw_wallet_logo.png'
import wombatLogo from 'assets/images/wombat_wallet_logo.png'
import { Colors } from 'shared/util/colors'

interface WalletSelectorProps {
  className?: string
}

export const WalletSelector: React.FC<WalletSelectorProps> = ({ className }) => {
  const currentWallet: string = localStorage.getItem('aw_currentWallet') || 'wax'

  const wallets = [
    {
      id: 'wax',
      name: 'WCW',
      logo: wcwLogo,
    },
    {
      id: 'wombat',
      name: 'WOMBAT',
      logo: wombatLogo,
    },
  ]

  return (
    <div className={`flex justify-center gap-2 ${className ?? ''}`}>
      {wallets.map((wallet) => (
        <div
          key={wallet.id}
          className="inline-flex rounded-[12px] p-[2px]"
          style={{
            background:
              currentWallet === wallet.id
                ? 'linear-gradient(180deg, #FFC600 41.67%, #EE7000 49.48%)'
                : 'none',
          }}
        >
          <div className="relative flex min-w-[148px] items-center gap-4 rounded-[10px] bg-[#100F10] p-[8px] text-white h-[68px]">
            <div className="ml-[8px]">
              <img src={wallet.logo} className="size-[32px]" alt={wallet.name} />
            </div>
            <p className="font-tlm text-[14px] font-bold" style={{ color: Colors.SNOW_WHITE }}>
              {wallet.name}
            </p>
            {currentWallet === wallet.id && (
              <div
                className="absolute right-[8px] top-[8px] size-[12px] rounded-full"
                style={{ backgroundColor: Colors.DI_SERRIA }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  )
}
