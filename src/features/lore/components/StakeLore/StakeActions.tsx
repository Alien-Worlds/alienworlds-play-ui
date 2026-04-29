import { Button, FormField } from '@alien-worlds/uikit'
import { Flex, Grid, GridItem, Box } from '@chakra-ui/react'
import { Formik } from 'formik'
import { toNumber } from 'lodash'
import { Colors } from 'shared/util/colors'
import { validateAmount } from 'shared/util/formhelper'

type StakeLoreActionsProps = {
  onSubmitStake: (amount: string) => Promise<void>
  onUnstakeAll: () => void
  onSubmitLore: () => void
  onStakeInputChange: (amount: number) => void
  isMobile: boolean
  isDesktop: boolean
  isFullWidth: boolean
  walletBalance: number
}

export function StakeActions({
  onSubmitStake,
  onUnstakeAll,
  onSubmitLore,
  onStakeInputChange,
  isMobile,
  isDesktop,
  isFullWidth,
  walletBalance,
}: StakeLoreActionsProps) {
  const normalizedWalletBalance = Number(walletBalance.toFixed(4))

  return (
    <Flex
      width="100%"
      flexDirection={{ base: 'column', lg: 'row' }}
      justifyContent="space-between"
      gap={4}
    >
      <Formik
        initialValues={{
          amount: '',
        }}
        onSubmit={async ({ amount }) => {
          await onSubmitStake(amount)
        }}
      >
        {({ handleSubmit, values, setFieldValue }) => (
          <form onSubmit={handleSubmit}>
            <Grid
              gap={4}
              gridTemplateColumns={{ base: 'repeat(1,1fr)', lg: 'repeat(2,1fr)' }}
              alignItems="flex-start"
            >
              <GridItem alignSelf="center">
                <Flex direction="column" gap={2}>
                  <Box>
                    <FormField
                      size="md"
                      name="amount"
                      minWidth="280px"
                      type="number"
                      width="100%"
                      height="48px"
                      borderWidth="1px"
                      paddingInline={0}
                      marginBottom="4px"
                      borderRadius="8px"
                      textAlign="center"
                      placeholder="Enter TLM amount 10 000 e.g."
                      color={Colors.SNOW_WHITE}
                      fontFamily="Titillium Web"
                      borderColor={Colors.MID_GRAY}
                      backgroundColor={Colors.BLACK_ALPHA_50}
                      onChange={(event) => {
                        setFieldValue('amount', event.target.value)
                        onStakeInputChange(toNumber(event.target.value))
                      }}
                      validate={() => validateAmount(values.amount, normalizedWalletBalance)}
                    />
                  </Box>
                </Flex>
              </GridItem>
              <GridItem>
                <Button
                  size="lg"
                  type="submit"
                  height={isMobile ? '40px' : '48px'}
                  fontSize={16}
                  variant="warning"
                  borderRadius="15px"
                  marginTop="8px"
                  isFullWidth={isFullWidth}
                >
                  Stake TLM
                </Button>
              </GridItem>
            </Grid>
          </form>
        )}
      </Formik>

      <Button
        size="lg"
        variant="alert"
        height={isMobile ? '40px' : '48px'}
        fontSize={18}
        maxWidth={isFullWidth ? '100%' : 'max-content'}
        isFullWidth={isFullWidth}
        onClick={onUnstakeAll}
      >
        Unstake All TLM
      </Button>

      <Box display={!isDesktop ? 'block' : 'none'}>
        <Button
          size="lg"
          variant="primary"
          height={isMobile ? '40px' : '48px'}
          fontSize={18}
          fontWeight={900}
          isFullWidth={isFullWidth}
          onClick={onSubmitLore}
        >
          Submit Lore
        </Button>
      </Box>
    </Flex>
  )
}
