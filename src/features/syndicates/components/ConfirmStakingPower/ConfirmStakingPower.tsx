import { Button, BUTTON_SIZE } from '@alien-worlds/uikit'
import { Divider, Container, HStack, Text, VStack, useBreakpointValue } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { PlanetIcon } from 'shared/util/icons'
import { formatNumber } from 'shared/util/numbers'

type ConfirmPlanetPowerType = {
  planetName: string
  stakingDays: number
  planetSymbol: string
  stakingTokens: number
  finalVotingPower: number
  onClickStakingPower: () => void
  onChangeAmountClick: (x: number) => void
}

const iconStyle: any = {
  zIndex: 3,
  width: 68,
  height: 68,
}
const ConfirmStakingPower = ({
  planetName,
  planetSymbol,
  stakingDays,
  stakingTokens,
  finalVotingPower,
  onChangeAmountClick,
  onClickStakingPower,
}: ConfirmPlanetPowerType) => {
  const currentBreakpointButtonSize: keyof typeof BUTTON_SIZE = useBreakpointValue({
    base: 'sm',
    sm: 'sm',
    md: 'sm',
    lg: 'md',
    xl: 'lg',
    '2xl': 'lg',
  })
  return (
    <Container h="calc(100vh)" alignItems="center" display="flex" justifyContent="center">
      <VStack gap={4}>
        <PlanetIcon planetName={planetName} style={iconStyle} />

        <Text fontFamily="Titillium Web" fontSize={16} fontWeight={400}>
          Total {planetSymbol} Tokens being Staked
        </Text>
        <Text
          fontFamily="Orbitron"
          fontSize={45}
          fontWeight={400}
          background={Colors.Gradient1}
          backgroundClip="text"
        >
          {formatNumber(stakingTokens, 4, 4)}
        </Text>
        <Divider width="324px" />
        <Text fontFamily="Titillium Web" fontSize={16} fontWeight={400}>
          {planetSymbol} TLM Unstake Date
        </Text>
        <HStack gap={0}>
          <Text
            fontFamily="Orbitron"
            fontSize="45px"
            fontWeight={400}
            letterSpacing="0.06em"
            color={Colors.SNOW_WHITE}
            h="41px"
          >
            {stakingDays}
          </Text>

          <Text
            fontFamily="Titillium Web"
            fontSize="22px"
            fontWeight={400}
            marginBlockEnd={0}
            marginBlockStart={0}
            marginInlineStart="0.1rem"
            h="12px"
          >
            Days
          </Text>
        </HStack>

        <Text
          fontFamily="Titillium Web"
          fontSize="16px"
          fontWeight={400}
          color={Colors.AMARANTH}
          maxW="280px"
        >
          This is not a countdown when you stake. Your Release date starts the day you choose to
          Unstake your {planetSymbol} Tokens, and ends{' '}
          <span
            style={{
              fontFamily: 'Orbitron',
              fontSize: '27px',
              fontWeight: 400,
              color: Colors.SNOW_WHITE,

              position: 'relative',
              top: '3px',
            }}
          >
            {' '}
            {stakingDays}
          </span>{' '}
          <span
            style={{
              fontFamily: 'Titillium Web',
              fontSize: '13px',
              fontWeight: 400,
              color: Colors.SNOW_WHITE,

              position: 'relative',
              bottom: '5px',
            }}
          >
            {' '}
            Days
          </span>{' '}
          after.
        </Text>
        <Divider />
        <Text fontFamily="Titillium Web" fontSize="16px" fontWeight={700} color={Colors.JUMBO}>
          Final Vote Power
        </Text>

        <Text
          fontFamily="Orbitron"
          fontSize={{
            base: 30,
            md: 49,
          }}
          fontWeight={400}
          style={{ marginTop: 0 }}
          color={Colors.CARIBBEAN_GREEN}
        >
          {formatNumber(finalVotingPower, 4, 4)}
        </Text>
        <Button
          width="100%"
          size={currentBreakpointButtonSize}
          variant="primary"
          onClick={() => onClickStakingPower()}
        >
          Yes, Stake this Vote Power
        </Button>
        <Button
          width="100%"
          size={currentBreakpointButtonSize}
          variant="info"
          onClick={() => onChangeAmountClick(1)}
        >
          Change Amount
        </Button>
      </VStack>
    </Container>
  )
}

export { ConfirmStakingPower }
