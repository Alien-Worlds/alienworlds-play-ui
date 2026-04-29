import { Colors } from 'shared/util/colors'

export const tabStyles = {
  variants: {
    'full-rounded': {
      tablist: {
        bg: Colors.MINE_SHAFT_80,
        borderRadius: '2xl',
      },
      tab: {
        fontFamily: 'orb',
        fontSize: 'xs',
        paddingInline: {
          base: 'auto',
          sm: 10,
        },
        paddingBlock: 3,
        letterSpacing: 'widest',
        borderRadius: '2xl',
        _selected: {
          color: Colors.SNOW_WHITE,
          bg: Colors.DI_SERRIA,
          fontWeight: 'black',
        },
      },
    },
  },
}
