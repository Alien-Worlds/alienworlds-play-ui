import { FC, useState } from 'react'

import { ReverseSortingIcon, SortingIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Colors } from 'shared/util/colors'

export const ReverseSortingFilter: FC<{
  onToggle: (reversed: boolean) => void
}> = ({ onToggle }) => {
  const [reversed, setReversed] = useState(false)

  return (
    <Button
      variant="dark"
      size="sm"
      paddingInlineStart={0.1}
      paddingInlineEnd={0.1}
      minWidth="max-content"
      color={Colors.SNOW_WHITE}
      onClick={() => {
        const rev = !reversed
        setReversed(rev)
        onToggle(rev)
      }}
      rightIcon={reversed ? <ReverseSortingIcon boxSize={18} /> : <SortingIcon boxSize={18} />}
      fontFamily="Titillium Web"
    >
      {' '}
      {reversed ? 'Z-A' : 'A-Z'}
    </Button>
  )
}
