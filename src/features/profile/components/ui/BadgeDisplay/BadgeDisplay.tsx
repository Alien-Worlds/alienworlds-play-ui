/**
 * BadgeDisplay Component
 *
 * A focused component that displays user level badges and rank information.
 * This component handles the visual representation of user achievements.
 */

import React from 'react'

import { BadgesMap } from 'shared/components/UserLevelsBadges/UserLevelsBadges'

interface BadgeDisplayProps {
  level?: number
  size?: 'small' | 'medium' | 'large'
  showMap?: boolean
  className?: string
}

export const BadgeDisplay: React.FC<BadgeDisplayProps> = ({
  level,
  size = 'medium',
  showMap = true,
  className,
}) => {
  const getSize = () => {
    switch (size) {
      case 'small':
        return { width: '30px', height: '30px' }
      case 'large':
        return { width: '50px', height: '50px' }
      default:
        return { width: '40px', height: '40px' }
    }
  }

  const sizeProps = getSize()

  return (
    <div className={`flex z-[2] ${className ?? ''}`}>
      {showMap && level && (
        <BadgesMap level={level} width={sizeProps.width} height={sizeProps.height} />
      )}
    </div>
  )
}
