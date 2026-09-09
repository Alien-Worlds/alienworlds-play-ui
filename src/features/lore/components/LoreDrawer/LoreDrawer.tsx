import React from 'react'

import { CopyIcon } from '@alien-worlds/icons'
import { Button, FormField, useBreakpointValue } from '@alien-worlds/uikit'
import { useApolloClient } from '@apollo/client'
import { Dialog, DialogPanel } from '@headlessui/react'
import { LoreStatus } from 'features/lore/types/loreTypes'
import { Formik } from 'formik'
import { LORES_QUERY } from 'graphql/queries/loreProposals'
import { LoreProposal } from 'graphql/types'
import { map } from 'lodash'
import { find } from 'lodash'
import { useCopyToClipboard } from 'react-use'
import { useModalStore } from 'shared/store/modalStore'
import { Colors } from 'shared/util/colors'
import { validateAmount } from 'shared/util/formhelper'
import { useActions, useAppState } from 'store'
import { toastMessage } from 'store/main/actions'

import { Constants } from '../../../../shared/util/constants'

export function isAllowedStatus(status) {
  const allowedStatuses = [
    LoreStatus.OPEN,
    LoreStatus.PASSING,
    LoreStatus.FAILING,
    LoreStatus.QUORUM_UNMET,
  ]
  return allowedStatuses.includes(status)
}
interface ILoreDrawerProps {
  isOpen: boolean
  onClose: () => void
  lore: LoreProposal | null
  currentNumber: number
}
const LoreDrawer = ({ isOpen, onClose, lore, currentNumber }: ILoreDrawerProps) => {
  const [, copyToClipboard] = useCopyToClipboard()

  const {
    wax: { isDemoUser },
  } = useAppState()
  const {
    wax: { tryLoreVoting },
  } = useActions()
  const setPrimaryModalActive = useModalStore((state) => state.setPrimaryModalActive)
  const client = useApolloClient()
  const demoTopbarHeightMobile = `${Constants.DEMO_TOPBAR_HEIGHT_MOBILE - 60}px`
  const currentFontValue = useBreakpointValue({ base: 12, md: 14, '2xl': 16 })
  const url = find(lore?.attributes, { key: 'url' })?.value[1] as string
  const description = find(lore?.attributes, { key: 'description' })?.value[1] as string

  const [voteCheckBoxes, setVoteCheckBoxes] = React.useState<Array<boolean>>([true, false])
  const handleVote = (index: number) => {
    const updatedCheckBoxes = map(voteCheckBoxes, (value, i) => i === index)
    setVoteCheckBoxes(updatedCheckBoxes)
  }
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      // Chakra's theme sets zIndices.modal/topbar to 20000/21000 (see shared/styles/theme.ts),
      // so the persistent sidebar and top bar would otherwise render above this Tailwind dialog.
      className="relative z-[30000]"
    >
      <div className="fixed inset-0 flex justify-end">
        <DialogPanel
          className="h-full w-full overflow-y-auto lg:w-[512px]"
          style={{
            top: isDemoUser ? demoTopbarHeightMobile : 90,
            position: 'relative',
            borderRadius: '35px 0px 0px 35px',
            background: Colors.BLACK_SOLID_90,
            padding: '40px',
            paddingTop: '36px',
          }}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="absolute right-[30px] top-[60px]"
            style={{ color: Colors.SNOW_WHITE }}
          >
            &times;
          </button>
          <p className="text-[24px] font-semibold" style={{ color: Colors.DI_SERRIA }}>
            Vote
          </p>
          <div>
            <p className="font-orb text-[20px]">{lore?.title}</p>
            <div className="w-full">
              <div className="mt-[20px] flex w-full justify-between">
                <p className="font-tlm text-[16px] font-bold">ID:</p>
                <p className="font-tlm text-[16px] font-normal" style={{ color: Colors.SILVER }}>
                  {lore?.proposal_id}
                </p>
              </div>
              <div className="mt-[20px] flex w-full justify-between">
                <p className="font-tlm text-[16px] font-bold">Submitted by:</p>
                <p className="font-tlm text-[16px] font-normal" style={{ color: Colors.SILVER }}>
                  {lore?.proposer}
                </p>
              </div>
              <div className="mt-[20px] flex w-full justify-between">
                <p className="font-tlm text-[16px] font-bold">Expire Date:</p>
                <p className="font-tlm text-[16px] font-normal" style={{ color: Colors.SILVER }}>
                  {lore?.expires}
                </p>
              </div>
              <div className="mt-[20px] flex w-full justify-between">
                <p className="font-tlm text-[16px] font-bold">Earliest Execution:</p>
                <p className="font-tlm text-[16px] font-normal" style={{ color: Colors.SILVER }}>
                  {lore?.earliest_exec}
                </p>
              </div>
              <div className="mt-[20px] flex w-full justify-between">
                <p className="font-tlm text-[16px] font-bold">Votes Y/N:</p>
                <p className="font-tlm text-[16px] font-normal" style={{ color: Colors.SILVER }}>
                  {lore?.total_yes_votes + '/' + lore?.total_no_votes}
                </p>
              </div>
              <div className="mt-[20px] w-full">
                <p className="font-tlm text-[16px] font-bold">GitHub Pull Request</p>
                <div
                  className="mt-[12px] flex items-center justify-between rounded-lg border px-4 py-[11px] pl-4"
                  style={{ borderColor: Colors.SILVER }}
                >
                  <p>https://github.com/Alien-Worlds/the...</p>
                  <CopyIcon
                    boxSize="25px"
                    cursor="pointer"
                    color={Colors.SNOW_WHITE}
                    onClick={() => {
                      copyToClipboard(url)
                      toastMessage('Url copied to Clipboard!')
                    }}
                  />
                </div>
              </div>
              {description && (
                <div className="mt-[20px] w-full">
                  <p className="font-tlm text-[16px] font-bold">Description:</p>
                  <p
                    className="mt-4 font-tlm text-[16px] font-normal"
                    style={{ color: Colors.SILVER }}
                  >
                    {description}
                  </p>
                </div>
              )}

              {isAllowedStatus(lore?.status || '') && (
                <div className="mt-[20px] flex justify-evenly">
                  <div
                    className="flex h-[71px] w-[148px] cursor-pointer items-center justify-center rounded-xl text-[20px] font-semibold hover:border hover:border-[#0ED4A8]"
                    style={{
                      background:
                        'radial-gradient(50% 50% at 50% 50%, rgba(14, 212, 168, 0.20) 0%, rgba(14, 212, 168, 0.00) 100%), rgba(255, 255, 255, 0.08)',
                      color: Colors.CARIBBEAN_GREEN,
                      border: voteCheckBoxes[0] ? '1px solid #0ED4A8' : '1px solid transparent',
                    }}
                    onClick={() => handleVote(0)}
                  >
                    Yes
                  </div>
                  <div
                    className="flex h-[71px] w-[148px] cursor-pointer items-center justify-center rounded-xl text-[20px] font-semibold hover:border hover:border-[#FF3B52]"
                    style={{
                      background:
                        'radial-gradient(50% 50% at 50% 50%, rgba(255, 59, 82, 0.30) 0%, rgba(255, 59, 82, 0.00) 100%), rgba(255, 255, 255, 0.08)',
                      color: Colors.RADICAL_RED,
                      border: voteCheckBoxes[1] ? '1px solid #FF3B52' : '1px solid transparent',
                    }}
                    onClick={() => handleVote(1)}
                  >
                    No
                  </div>
                </div>
              )}
              {isAllowedStatus(lore?.status || '') && (
                <div className="mt-[20px] flex w-full flex-col justify-between gap-4 lg:flex-row">
                  <Formik
                    initialValues={{
                      amount: '',
                    }}
                    onSubmit={async ({ amount }) => {
                      if (isDemoUser) {
                        setPrimaryModalActive({ modalName: 'LoginModal', value: true })
                      } else
                        await tryLoreVoting({
                          proposalId: lore.proposal_id,
                          vote: voteCheckBoxes[0] ? 'yes' : 'no',
                          votePower: Number(amount),
                        })

                      await client.refetchQueries({ include: [LORES_QUERY] })
                    }}
                  >
                    {({ handleSubmit, values, setFieldValue }) => (
                      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                        <div className="grid w-full grid-cols-1 items-start gap-4">
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
                                  label="Spend Vote Power on Vote"
                                  placeholder="Enter TLM amount 10 000 e.g."
                                  color={Colors.SNOW_WHITE}
                                  fontFamily="Titillium Web"
                                  borderColor={Colors.MID_GRAY}
                                  backgroundColor={Colors.BLACK_ALPHA_50}
                                  onChange={(e) => {
                                    setFieldValue('amount', e.target.value)
                                  }}
                                  validate={() => validateAmount(values.amount, currentNumber)}
                                />
                                <div className="flex">
                                  <p style={{ color: Colors.JUMBO }}>Your Available Vote Power: </p>
                                  <p
                                    style={{ fontSize: currentFontValue, color: Colors.SNOW_WHITE }}
                                  >
                                    {currentNumber}
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <Button
                              size="lg"
                              type="submit"
                              fontSize={16}
                              variant="primary"
                              borderRadius="15px"
                              marginTop="8px"
                              isFullWidth
                            >
                              Vote
                            </Button>
                          </div>
                        </div>
                      </form>
                    )}
                  </Formik>
                </div>
              )}
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export { LoreDrawer }
