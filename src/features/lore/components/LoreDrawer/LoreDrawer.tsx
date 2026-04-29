import React from 'react'

import { CopyIcon } from '@alien-worlds/icons'
import { Button, FormField } from '@alien-worlds/uikit'
import { useApolloClient } from '@apollo/client'
import {
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Text,
  Flex,
  Box,
  Grid,
  GridItem,
  useBreakpointValue,
} from '@chakra-ui/react'
import { LoreStatus } from 'features/lore/types/loreTypes'
import { Formik } from 'formik'
import { LORES_QUERY } from 'graphql/queries/loreProposals'
import { LoreProposal } from 'graphql/types'
import { map } from 'lodash'
import { find } from 'lodash'
import { useCopyToClipboard } from 'react-use'
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
    modal: { setPrimaryModalActive },
    wax: { tryLoreVoting },
  } = useActions()
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
    <>
      <Drawer placement={'right'} onClose={onClose} isOpen={isOpen} size="lg">
        <DrawerOverlay />
        <DrawerContent
          style={{
            top: isDemoUser ? demoTopbarHeightMobile : 90,
            borderRadius: '35px 0px 0px 35px',
            background: Colors.BLACK_SOLID_90,
            padding: '40px',
            paddingTop: '36px',
          }}
        >
          <DrawerCloseButton top="60px" right="30px" boxSize="24px" />
          <DrawerHeader color={Colors.DI_SERRIA} fontSize="24px" fontWeight={600}>
            Vote
          </DrawerHeader>
          <DrawerBody>
            <Box>
              <Text fontSize="20px" fontFamily="orb">
                {lore?.title}
              </Text>
              <Box gap={4} width="100%">
                <Flex mt="20px" width="100%" justifyContent="space-between">
                  <Text fontFamily="tlm" fontSize="16px" fontWeight={700}>
                    ID:
                  </Text>
                  <Text fontFamily="tlm" fontSize="16px" fontWeight={400} color={Colors.SILVER}>
                    {lore?.proposal_id}
                  </Text>
                </Flex>
                <Flex mt="20px" width="100%" justifyContent="space-between">
                  <Text fontFamily="tlm" fontSize="16px" fontWeight={700}>
                    Submitted by:
                  </Text>
                  <Text fontFamily="tlm" fontSize="16px" fontWeight={400} color={Colors.SILVER}>
                    {lore?.proposer}
                  </Text>
                </Flex>
                <Flex mt="20px" width="100%" justifyContent="space-between">
                  <Text fontFamily="tlm" fontSize="16px" fontWeight={700}>
                    Expire Date:
                  </Text>
                  <Text fontFamily="tlm" fontSize="16px" fontWeight={400} color={Colors.SILVER}>
                    {lore?.expires}
                  </Text>
                </Flex>
                <Flex mt="20px" width="100%" justifyContent="space-between">
                  <Text fontFamily="tlm" fontSize="16px" fontWeight={700}>
                    Earliest Execution:
                  </Text>
                  <Text fontFamily="tlm" fontSize="16px" fontWeight={400} color={Colors.SILVER}>
                    {lore?.earliest_exec}
                  </Text>
                </Flex>
                <Flex mt="20px" width="100%" justifyContent="space-between">
                  <Text fontFamily="tlm" fontSize="16px" fontWeight={700}>
                    Votes Y/N:
                  </Text>
                  <Text fontFamily="tlm" fontSize="16px" fontWeight={400} color={Colors.SILVER}>
                    {lore?.total_yes_votes + '/' + lore?.total_no_votes}
                  </Text>
                </Flex>
                <Box mt="20px" width="100%">
                  <Text fontFamily="tlm" fontSize="16px" fontWeight={700}>
                    GitHub Pull Request
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
                        copyToClipboard(url)
                        toastMessage('Url copied to Clipboard!')
                      }}
                    />
                  </Flex>
                </Box>
                {description && (
                  <Box mt="20px" width="100%" gap={8}>
                    <Text fontFamily="tlm" fontSize="16px" fontWeight={700}>
                      Description:
                    </Text>
                    <Text
                      fontFamily="tlm"
                      mt={4}
                      fontSize="16px"
                      fontWeight={400}
                      color={Colors.SILVER}
                    >
                      {description}
                    </Text>
                  </Box>
                )}

                {isAllowedStatus(lore?.status || '') && (
                  <Flex justifyContent="space-evenly" mt="20px">
                    <Box
                      width="148px"
                      height="71px"
                      background={
                        voteCheckBoxes[0]
                          ? 'radial-gradient(50% 50% at 50% 50%, rgba(14, 212, 168, 0.20) 0%, rgba(14, 212, 168, 0.00) 100%), rgba(255, 255, 255, 0.08)'
                          : 'radial-gradient(50% 50% at 50% 50%, rgba(14, 212, 168, 0.20) 0%, rgba(14, 212, 168, 0.00) 100%), rgba(255, 255, 255, 0.08);'
                      }
                      backdropBlur="10px"
                      borderRadius="12px"
                      color={Colors.CARIBBEAN_GREEN}
                      fontSize="20px"
                      fontWeight={600}
                      justifyContent="center"
                      alignItems="center"
                      display="flex"
                      cursor="pointer"
                      border={voteCheckBoxes[0] ? '1px solid #0ED4A8' : '1px solid transparent'}
                      _hover={{
                        border: '1px solid #0ED4A8',
                        background:
                          'radial-gradient(50% 50% at 50% 50%, rgba(14, 212, 168, 0.20) 0%, rgba(14, 212, 168, 0.00) 100%), rgba(255, 255, 255, 0.08)',
                      }}
                      onClick={() => handleVote(0)}
                    >
                      Yes
                    </Box>
                    <Box
                      width="148px"
                      height="71px"
                      background={
                        'radial-gradient(50% 50% at 50% 50%, rgba(255, 59, 82, 0.30) 0%, rgba(255, 59, 82, 0.00) 100%), rgba(255, 255, 255, 0.08)'
                      }
                      justifyContent="center"
                      alignItems="center"
                      display="flex"
                      backdropBlur="10px"
                      cursor="pointer"
                      _hover={{
                        border: '1px solid #FF3B52',
                        background:
                          'radial-gradient(50% 50% at 50% 50%, rgba(255, 59, 82, 0.30) 0%, rgba(255, 59, 82, 0.00) 100%), rgba(255, 255, 255, 0.08)',
                      }}
                      border={voteCheckBoxes[1] ? '1px solid #FF3B52' : '1px solid transparent'}
                      borderRadius="12px"
                      color={Colors.RADICAL_RED}
                      fontSize="20px"
                      fontWeight={600}
                      onClick={() => handleVote(1)}
                    >
                      No
                    </Box>
                  </Flex>
                )}
                {isAllowedStatus(lore?.status || '') && (
                  <Flex
                    width="100%"
                    flexDirection={{ base: 'column', lg: 'row' }}
                    justifyContent="space-between"
                    gap={4}
                    mt="20px"
                  >
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
                          <Grid
                            gap={4}
                            gridTemplateColumns={{ base: 'repeat(1,1fr)' }}
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
                                  <Flex>
                                    <Text color={Colors.JUMBO}>Your Available Vote Power: </Text>
                                    <Text fontSize={currentFontValue} color={Colors.SNOW_WHITE}>
                                      {currentNumber}
                                    </Text>
                                  </Flex>
                                </Box>
                              </Flex>
                            </GridItem>
                            <GridItem>
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
                            </GridItem>
                          </Grid>
                        </form>
                      )}
                    </Formik>
                  </Flex>
                )}
              </Box>
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export { LoreDrawer }
