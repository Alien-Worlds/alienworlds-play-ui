import { FC } from 'react'

import { InfoIcon } from '@alien-worlds/icons'
import { IconProps } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { useActions } from 'store'

type GlossaryInfoIconProps = IconProps & {
  glossaryId: number
}

const GlossaryInfoIcon: FC<GlossaryInfoIconProps> = ({ glossaryId, style }) => {
  const {
    main: { glossary },
  } = useActions()

  return (
    <InfoIcon
      color={Colors.GRAY_CHATEAU}
      onClick={() => glossary.openGlossaryDrawer(glossaryId)}
      cursor="pointer"
      boxSize={16}
      style={{ ...style }}
    />
  )
}

export { GlossaryInfoIcon }
