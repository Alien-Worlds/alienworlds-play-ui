/**
 * ProfileView Component - Refactored
 *
 * A clean, focused component that displays the main profile information.
 * This component uses the new context and smaller components for better maintainability.
 */

import React from 'react'

import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'

import { useProfileContext } from '../../context/ProfileContext'
import { BalanceSection } from '../sections/BalanceSection'
import { ProfileHeader } from '../sections/ProfileHeader'
import { WalletSelector } from '../ui/WalletSelector'

export const ProfileView: React.FC = () => {
  const { state } = useProfileContext()
  const { loading } = state

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <ProfileHeader variant="full" showBadge={true} />
      <BalanceSection />
      <WalletSelector />
    </div>
  )
}
