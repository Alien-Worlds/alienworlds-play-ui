export const drawerStyles = {
  baseStyle: {
    dialog: {
      transitionProperty: 'max-width, border-radius',
      transitionDuration: '0.3s',
      transitionTimingFunction: 'ease',
    },
  },
  variants: {
    persistent: {
      dialog: {
        pointerEvents: 'auto',
      },
      dialogContainer: {
        pointerEvents: 'none',
      },
    },
    miningTools: {
      dialog: {
        maxW: '660px',
      },
    },
  },
  sizes: {
    xs: {
      dialog: {
        maxW: '70px',
      },
    },
    sm: {
      dialog: {
        maxW: '270px',
      },
    },
    md: {
      dialog: {
        maxW: '320px',
      },
    },
    lg: {
      dialog: {
        maxW: '506px',
      },
    },
    xxl: {
      dialog: {
        maxW: '870px',
      },
    },
  },
}
