import { InfoIcon } from '@alien-worlds/icons'
import { Button, Grid, GridItem, Text, Hide } from '@chakra-ui/react'
import { theme } from 'shared/styles/theme'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'
import { useScreenSize } from 'shared/util/hooks'
import { useAppState, useActions } from 'store'

import { Constants } from '../../util/constants'

const UserDemoBanner = () => {
  const {
    modal: { setPrimaryModalActive },
  } = useActions()
  const { isMobile } = useScreenSize()
  const {
    modal: { isModalActive },
    main: {
      glossaryDrawer,
      miningToolsDrawer,
      planetDetailsDrawer,
      isOutPostModalsActive,
      syndicatesProposalDrawer,
      isLandOwnerAddSlotDrawerOpen,
    },
    wax: { walletId, isAuthenticating },
  } = useAppState()

  if (walletId !== config.DemoUserWaxAccount) return null

  const demoTopbarHeight = `${Constants.DEMO_TOPBAR_HEIGHT.toString()}px`
  const demoTopbarHeightMobile = `${Constants.DEMO_TOPBAR_HEIGHT_MOBILE.toString()}px`

  return (
    <Grid
      w="100%"
      position="fixed"
      bg={Colors.WEB_ORANGE}
      templateColumns={{ base: '65% 35%', sm: '50% 50%' }}
      alignItems="center"
      gap={2}
      px="16px"
      py={isMobile ? '16px' : '2px'}
      overflowX="hidden"
      h={{ base: demoTopbarHeightMobile, md: demoTopbarHeight }}
      zIndex={
        isModalActive ||
        isOutPostModalsActive ||
        glossaryDrawer.isOpen ||
        miningToolsDrawer.isOpen ||
        planetDetailsDrawer.isOpen ||
        syndicatesProposalDrawer.isOpen ||
        isLandOwnerAddSlotDrawerOpen
          ? theme.zIndices.topbarUnderModal
          : theme.zIndices.topbar
      }
    >
      <GridItem display="flex" alignItems="center" gap={2} minW={0}>
        <Hide above="md">
          <InfoIcon boxSize="32px" color={Colors.BLACK_NEUTRAL} />
        </Hide>
        <Hide below="md">
          <InfoIcon boxSize="18px" color={Colors.BLACK_NEUTRAL} />
        </Hide>
        <Text
          color={Colors.BLACK_NEUTRAL}
          fontSize="12px"
          fontFamily="orb"
          fontWeight={700}
          whiteSpace="normal"
          wordBreak="break-word"
        >
          You are not logged in & exploring as virtual user
        </Text>
      </GridItem>

      <GridItem display="flex" gap={2} justifyContent={{ base: 'center', sm: 'flex-end' }}>
        <Hide>
          <Button
            size="sm"
            height="35px"
            variant="info"
            fontFamily="orb"
            borderRadius="25px"
            border="2px solid white"
            isLoading={isAuthenticating}
            onClick={() => setPrimaryModalActive({ modalName: 'LoginModal', value: true })}
          >
            Login
          </Button>
        </Hide>
        <Button
          size={isMobile ? 'lg' : 'sm'}
          height={isMobile ? '35px' : '24px'}
          fontSize={isMobile ? '14px' : '12px'}
          fontFamily="orb"
          variant="hydrogen"
          border="2px solid white"
          borderRadius={isMobile ? '25px' : '12px'}
          background={Colors.COD_GRAY}
          isLoading={isAuthenticating}
          onClick={() => setPrimaryModalActive({ modalName: 'SignUpModal', value: true })}
        >
          Get Started
        </Button>
      </GridItem>
    </Grid>
  )
}

export { UserDemoBanner }
