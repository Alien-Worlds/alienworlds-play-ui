import { FC } from 'react'

import { InfoIcon } from '@alien-worlds/icons'
import { IconProps } from '@chakra-ui/react'
import { useGlossaryStore } from 'features/glossary/store/glossaryStore'
import { Colors } from 'shared/util/colors'

type GlossaryInfoIconProps = IconProps & {
  glossaryId: number
}

const GlossaryInfoIcon: FC<GlossaryInfoIconProps> = ({ glossaryId, style }) => {
  const openGlossaryDrawer = useGlossaryStore((state) => state.openGlossaryDrawer)

  return (
    <InfoIcon
      color={Colors.GRAY_CHATEAU}
      onClick={() => openGlossaryDrawer(glossaryId)}
      cursor="pointer"
      boxSize={16}
      style={{ ...style }}
    />
  )
}

export { GlossaryInfoIcon }
