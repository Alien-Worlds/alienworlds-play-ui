import { Button } from '@alien-worlds/uikit'
import { Flex, Spinner, useBreakpointValue } from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { Clock } from 'shared/components/topbar/Clock'
import { pageTransition } from 'shared/util/animations'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'
import { MiningGameState } from 'store/main/state'

const MiningCounter = ({ height, width }: { height?: string; width?: string }) => {
  const {
    wax: { trySetInitialBag },
    main: { mine, claimMine },
  } = useActions()
  const {
    wax: { bag, isLoggedIn },
    main: { miningGameState, mineDelay },
  } = useAppState()
  const buttonFontValue = useBreakpointValue({ base: 16, md: 18 })

  return (
    <motion.div {...pageTransition} style={{ width, maxWidth: '240px', height }}>
      <Flex
        alignItems="center"
        justifyContent="center"
        color={Colors.CERULEAN}
        w={width}
        h={height}
      >
        {bag && (
          <>
            <Flex direction="column" w={width || '100%'} alignItems="center" h={height}>
              {miningGameState === MiningGameState.Unknown && <></>}

              {miningGameState === MiningGameState.WorkInProgress && (
                <Flex pt="7px">
                  <Spinner />
                </Flex>
              )}

              {miningGameState === MiningGameState.MineDelay && <Clock duration={mineDelay} />}

              {miningGameState === MiningGameState.ReadyToMine &&
                bag?.items !== null &&
                bag?.items.length !== 0 && (
                  <Button
                    height="40px"
                    size="lg"
                    color={Colors.SNOW_WHITE}
                    width={width}
                    maxWidth={width}
                    minWidth={width}
                    isFullWidth
                    fontSize={buttonFontValue}
                    variant="negative"
                    onClick={() => mine()}
                  >
                    Mine
                  </Button>
                )}

              {miningGameState === MiningGameState.Mining && (
                <Button
                  fontSize={buttonFontValue}
                  width={width}
                  maxWidth={width}
                  minWidth={width}
                  rightIcon={<Spinner size="sm" />}
                  aria-label="Mining"
                  variant="negative"
                  disabled
                  size="lg"
                  isFullWidth
                  height="40px !important"
                >
                  Mining...
                </Button>
              )}

              {miningGameState === MiningGameState.ReadyToClaim && (
                <Button
                  size="lg"
                  isFullWidth
                  fontSize={buttonFontValue}
                  width={width}
                  maxWidth={width}
                  minWidth={width}
                  variant="warning"
                  onClick={() => claimMine()}
                  height="40px !important"
                >
                  Submit
                </Button>
              )}

              {miningGameState === MiningGameState.Claiming && (
                <Button
                  size="lg"
                  marginRight="0px"
                  disabled
                  isFullWidth
                  width={width}
                  maxWidth={width}
                  minWidth={width}
                  fontSize={buttonFontValue}
                  variant="warning"
                  height="40px !important"
                  rightIcon={<Spinner size="sm" />}
                >
                  Submitting...
                </Button>
              )}
            </Flex>
          </>
        )}

        {bag === undefined && <>Loading...</>}

        {isLoggedIn && bag && bag?.items?.length === 0 && (
          <Button
            height="40px !important"
            size="lg"
            width={width}
            minWidth="170px"
            marginRight="10px"
            isFullWidth
            fontSize={18}
            variant="primary"
            onClick={() => trySetInitialBag()}
          >
            Equip Tools
          </Button>
        )}
      </Flex>
    </motion.div>
  )
}

export { MiningCounter }
