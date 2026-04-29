import { extendTheme } from '@chakra-ui/react'
import { components } from 'shared/styles/components'

export const theme = extendTheme({
  // uses default value from Chakra, written here for clarity
  breakpoints: {
    sm: '480px',
    md: '768px',
    lg: '992px',
    xl: '1280px',
    '2xl': '1536px',
  },
  components,
  zIndices: {
    tooltip: 25000,
    modal: 20000,
    topbar: 21000,
    charts: 23000,
    topbarUnderModal: 2000,
    dropdownItems: 24000,
  },
  fonts: {
    tlm: 'Titillium Web',
    orb: 'Orbitron',
  },
  styles: {
    global: () => ({
      '#root': {
        minHeight: '100vh',
      },
      body: {
        fontFamily: 'Titillium Web',
        color: 'white',
        backgroundColor: 'blackAlpha.800',
        minHeight: '100vh',
        overscrollBehaviorY: 'none',
        // overflowY: 'scroll',
        userSelect: 'text',
        // BlockNative Account Center modal z-index is set to 25000 in App.css to handle the drawer z-index issue
        // overall z-indexes configs are as follows:
        // 25000: BlockNative Account Center modal
        // 25001: BlockNative onboard modal
        // 25002: BlockNative WalletConnect modal
        '--wcm-z-index': 25002,
      },
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
      },
      '.scroll-container': {
        '::-webkit-scrollbar': {
          width: '0.375rem',
          height: '0.375rem',
        },
        '::-webkit-scrollbar-track': {
          background: 'none',
        },
        '::-webkit-scrollbar-thumb': {
          background: 'gray',
          borderRadius: '0.625rem',
        },
      },
    }),
  },
})
