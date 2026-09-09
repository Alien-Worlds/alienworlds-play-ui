import { Button, FormField } from '@alien-worlds/uikit'
import { StakeDailyRewardBanner } from 'features/lore/components/StakeLore/StakeDailyRewardBanner'
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
  newDailyReward: string
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
  newDailyReward,
}: StakeLoreActionsProps) {
  const normalizedWalletBalance = Number(walletBalance.toFixed(4))

  return (
    <div className="flex w-full flex-col gap-4">
      <div className="flex w-full flex-col justify-between gap-4 lg:flex-row">
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
              <div className="grid grid-cols-1 items-start gap-4 lg:grid-cols-2">
                <div className="self-center">
                  <div className="flex flex-col gap-2">
                    <div>
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
                    </div>
                  </div>
                </div>
                <div>
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
                </div>
              </div>
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

        <div className={!isDesktop ? 'block' : 'hidden'}>
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
        </div>
      </div>

      <StakeDailyRewardBanner newDailyReward={newDailyReward} />
    </div>
  )
}
