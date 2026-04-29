import { useMemo } from 'react'

import { CopyIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import {
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  css,
  useBreakpoint,
  useBreakpointValue,
  Text,
  Image,
  Box,
} from '@chakra-ui/react'
import { Tournament } from 'graphql/hooks/useCompetitions'
import { DateTime } from 'luxon'
import { useCopyToClipboard } from 'react-use'
import { Colors } from 'shared/util/colors'
import { Constants } from 'shared/util/constants'
import { useScreenSize } from 'shared/util/hooks'
import { useAppState } from 'store'
import { toastMessage } from 'store/main/actions'

interface Props {
  isOpen: boolean
  onClose: () => void
  tournament: Tournament
  onClaimReward?: (tournament: Tournament) => void
  walletId?: string
}

type ResponsiveValuesType = {
  buttonFontSizeSmall: number
  buttonFontSize: number
  drawerVariant: string
  drawerSize: string
  drawerPaddingLeft: number
  buttonIconSize: string
  planetIconSize: string
  votePowerIconSize: string
}
const getLuxonUtcDateTime = (dateTime: string) => {
  return DateTime.fromISO(dateTime, {
    zone: 'utc',
  })
}
const ResponsiveComponentValues = (currentBreakPoint: string): ResponsiveValuesType => {
  const buttonFontSize = {
    base: 14,
    sm: 14,
    md: 14,
    lg: 14,
    xl: 16,
    '2xl': 16,
  }
  const buttonFontSizeSmall = {
    base: 12,
    sm: 12,
    md: 12,
    lg: 12,
    xl: 14,
    '2xl': 14,
  }
  const drawerVariants = {
    base: null,
    sm: null,
    md: null,
    lg: 'persistent',
    xl: 'persistent',
    '2xl': 'persistent',
  }
  const drawerSizes = {
    base: 'sm',
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'md',
    '2xl': 'md',
  }
  const buttonIconSizes = {
    base: '18px',
    sm: '22px',
    md: '22px',
    lg: '22px',
    xl: '22px',
    '2xl': '22px',
  }
  const planetIconSizes = {
    base: 30,
    sm: 30,
    md: 30,
    lg: 44,
    xl: 44,
    '2xl': 44,
  }
  const drawerPaddingsLeft = {
    base: 24,
    sm: 24,
    md: 24,
    lg: 24,
    xl: 24,
    '2xl': 24,
  }

  const votePowerIconSizes = {
    base: '20px',
    sm: '20px',
    md: '20px',
    lg: '30px',
    xl: '30px',
    '2xl': '30px',
  }

  return {
    buttonFontSizeSmall: buttonFontSizeSmall[currentBreakPoint],
    buttonFontSize: buttonFontSize[currentBreakPoint],
    drawerVariant: drawerVariants[currentBreakPoint],
    drawerSize: drawerSizes[currentBreakPoint],
    drawerPaddingLeft: drawerPaddingsLeft[currentBreakPoint],
    buttonIconSize: buttonIconSizes[currentBreakPoint],
    planetIconSize: planetIconSizes[currentBreakPoint],
    votePowerIconSize: votePowerIconSizes[currentBreakPoint],
  }
}

const hasUnclaimedReward = (tournament: Tournament, walletId: string) =>
  tournament?.players?.some((p) => p.player === walletId && !p.claimed) ?? false

export const CompetitionDrawer = ({
  onClose,
  isOpen,
  tournament,
  onClaimReward,
  walletId,
}: Props) => {
  const {
    wax: { isDemoUser },
  } = useAppState()
  const [, copyToClipboard] = useCopyToClipboard()
  const currentBreakPoint = useBreakpoint()
  const responsiveValues = useMemo(
    () => ResponsiveComponentValues(currentBreakPoint),
    [currentBreakPoint]
  )
  const { isNotDesktop } = useScreenSize()
  const demoTopbarHeight = `${Constants.DEMO_TOPBAR_HEIGHT + 90}px`
  const demoTopbarHeightMobile = `${Constants.DEMO_TOPBAR_HEIGHT_MOBILE + 90}px`

  const memoizedIsDemoUser = useMemo(() => isDemoUser, [isDemoUser])
  const drawerTopMargin = useBreakpointValue({
    base: memoizedIsDemoUser ? demoTopbarHeightMobile : 90,
    sm: memoizedIsDemoUser ? demoTopbarHeight : 90,
    md: memoizedIsDemoUser ? demoTopbarHeight : 90,
    lg: memoizedIsDemoUser ? demoTopbarHeight : 90,
    xl: memoizedIsDemoUser ? demoTopbarHeight : 90,
    '2xl': memoizedIsDemoUser ? demoTopbarHeight : 90,
  })
  return (
    <Drawer
      placement="right"
      trapFocus={false}
      variant={responsiveValues.drawerVariant}
      blockScrollOnMount={false}
      onClose={onClose}
      isOpen={isOpen && tournament !== null}
      size={responsiveValues.drawerSize}
    >
      <DrawerOverlay display={isNotDesktop ? 'block' : 'none'} />

      <DrawerContent
        style={{
          top: drawerTopMargin,
          borderRadius: '35px 0px 0px 35px',
          background: Colors.BLACK_SOLID_90,
          paddingBottom: '20px',
        }}
      >
        <DrawerHeader mt={4}>
          <Flex justifyContent="space-between" width="100%" flexDirection="column" gap={1}>
            <Flex justifyContent="space-between" width="100%" alignItems="flex-start">
              <Text fontWeight="400" fontFamily="orb">
                {tournament?.title}
              </Text>
              <DrawerCloseButton mt={4} />
            </Flex>
            <Text fontFamily="tlm" fontSize="14px" fontWeight={600} color={Colors.GRAY_CHATEAU}>
              Competition ID: {tournament?.id}
            </Text>
          </Flex>
        </DrawerHeader>

        <DrawerBody
          css={css({
            zIndex: '10000',
            scrollbarWidth: 'none',
            paddingLeft: responsiveValues.drawerPaddingLeft,
            overflowY: 'scroll',
            '::-webkit-scrollbar': { display: 'none' },
            overflowScrolling: 'touch',
            boxShadow: 'inset 0 -2px 0 rgba(0, 0, 0, 0.1)',
          })}
          gap={4}
        >
          <Image
            src={tournament?.image || 'images/tournament/card-artifact-1.png'}
            width="272px"
            height="136px"
            borderRadius="12px"
            objectFit="cover"
            objectPosition="70% 30%"
          />
          <Flex width="100%" pt={4} gap={4} flexDirection="column">
            <Flex width="100%" justifyContent="space-between">
              <Text fontFamily="tlm" fontSize="16px" fontWeight={700}>
                {' Start Date:'}
              </Text>
              <Text fontFamily="tlm" fontSize="16px" fontWeight={400} color={Colors.SILVER}>
                {getLuxonUtcDateTime(tournament?.start_time).toFormat('dd.MM.yyyy')}
              </Text>
            </Flex>
            <Flex width="100%" justifyContent="space-between">
              <Text fontFamily="tlm" fontSize="16px" fontWeight={700}>
                {' Start Time:'}
              </Text>
              <Text fontFamily="tlm" fontSize="16px" fontWeight={400} color={Colors.SILVER}>
                {getLuxonUtcDateTime(tournament?.start_time).toFormat('HH:mm:ss')} UTC
              </Text>
            </Flex>
            <Flex width="100%" justifyContent="space-between">
              <Text fontFamily="tlm" fontSize="16px" fontWeight={700}>
                {' End Date:'}
              </Text>
              <Text fontFamily="tlm" fontSize="16px" fontWeight={400} color={Colors.SILVER}>
                {getLuxonUtcDateTime(tournament?.end_time).toFormat('dd.MM.yyyy')}
              </Text>
            </Flex>
            <Flex width="100%" justifyContent="space-between">
              <Text fontFamily="tlm" fontSize="16px" fontWeight={700}>
                {' End Time:'}
              </Text>
              <Text fontFamily="tlm" fontSize="16px" fontWeight={400} color={Colors.SILVER}>
                {getLuxonUtcDateTime(tournament?.end_time).toFormat('HH:mm:ss')} UTC
              </Text>
            </Flex>
            <Flex width="100%" justifyContent="space-between">
              <Text fontFamily="tlm" fontSize="16px" fontWeight={700}>
                {' Min.Number of Players:'}
              </Text>
              <Text fontFamily="tlm" fontSize="16px" fontWeight={400} color={Colors.SILVER}>
                {tournament?.min_players}
              </Text>
            </Flex>
            <Flex width="100%" justifyContent="space-between">
              <Text fontFamily="tlm" fontSize="16px" fontWeight={700}>
                {' Max.Number of Players:'}
              </Text>
              <Text fontFamily="tlm" fontSize="16px" fontWeight={400} color={Colors.SILVER}>
                {tournament?.max_players}
              </Text>
            </Flex>
            <Flex width="100%" justifyContent="space-between">
              <Text fontFamily="tlm" fontSize="16px" fontWeight={700}>
                {' Number of Players:'}
              </Text>
              <Text fontFamily="tlm" fontSize="16px" fontWeight={400} color={Colors.SILVER}>
                {tournament?.num_players}
              </Text>
            </Flex>
            <Flex width="100%" justifyContent="space-between">
              <Text fontFamily="tlm" fontSize="16px" fontWeight={700}>
                {'Reward:'}
              </Text>
              <Text fontFamily="tlm" fontSize="16px" fontWeight={400} color={Colors.SILVER}>
                {tournament?.winnings_budget}
              </Text>
            </Flex>
            <Box mt="20px" width="100%">
              <Text fontFamily="tlm" fontSize="16px" fontWeight={700}>
                Competition Link
              </Text>
              <Flex
                padding="11px 12px 11px 16px"
                alignItems="center"
                borderRadius="8px"
                border="1px solid"
                borderColor={Colors.SILVER}
                mt="12px"
                justifyContent="space-between"
              >
                <Text>https://github.com/Alien-Worlds/the...</Text>
                <CopyIcon
                  boxSize="25px"
                  cursor="pointer"
                  color={Colors.SNOW_WHITE}
                  onClick={() => {
                    copyToClipboard(
                      tournament?.url ||
                        'https://github.com/Alien-Worlds/the-alien-worlds-competitions'
                    )
                    toastMessage('Url copied to Clipboard!')
                  }}
                />
              </Flex>
            </Box>
            <Box mt="20px" width="100%">
              <Text fontFamily="tlm" fontSize="16px" fontWeight={700}>
                Rules :
              </Text>
              <Text>{tournament?.description}</Text>
            </Box>
            {tournament?.state === 'rewarding' &&
              walletId &&
              hasUnclaimedReward(tournament, walletId) &&
              onClaimReward && (
                <Button variant="primary" size="lg" onClick={() => onClaimReward(tournament)}>
                  Claim rewards
                </Button>
              )}
            <Button
              variant="primary"
              size="lg"
              onClick={() => window.open(tournament?.url, '_blank')}
            >
              Visit
            </Button>
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}
