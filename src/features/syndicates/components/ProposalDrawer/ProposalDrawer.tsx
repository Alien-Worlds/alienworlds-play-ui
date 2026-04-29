import { useEffect, useRef, useState } from 'react'

import { CanceledIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import {
  Box,
  css,
  Drawer,
  DrawerBody,
  DrawerContent,
  Flex,
  VStack,
  Text,
  DrawerOverlay,
  DrawerCloseButton,
  createIcon,
} from '@chakra-ui/react'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import {
  ProposalType,
  EosioAction,
  FlattenedProposal,
  ProposalStatus,
  ProposalApprovalPayload,
  ProposalExecutionPayload,
} from 'features/syndicates/types/governanceTypes'
import {
  getProposalDetailsTextColor,
  getProposalDetailsVotesColor,
  getProposalDashboardActionTextAndState,
  isCancelableProposal,
} from 'features/syndicates/utils/GovernanceHelper'
import { useWalletDaoDetails } from 'graphql/hooks/useWalletDaoDetails'
import { DaoWalletDetailsResponse } from 'graphql/types'
import { get, head, lowerCase, map, startCase, times, toLower, toNumber } from 'lodash'
import { useMatch } from 'react-router-dom'
import { Colors } from 'shared/util/colors'
import { formatNumber } from 'shared/util/numbers'
import { useActions, useAppState } from 'store'
import { PagePath } from 'store/main/types'
import { DACUserStatusType } from 'store/wax/types'
import { v4 } from 'uuid'

type ProposalDrawerType = {
  onClose: () => void
  isOpen: boolean
  proposal: FlattenedProposal
}
type ProposalCardType = {
  action: EosioAction
  index: number
  lastIndex: boolean
  total: number
}
export const RoundArtifact = createIcon({
  viewBox: '0 0 16 16',
  displayName: 'RoundArtifact',
  path: (
    <>
      <circle cx="8" cy="8" r="7.5" stroke="#D9A555" />
      <circle cx="8.00003" cy="8.00003" r="2.13333" fill="#D9A555" />
    </>
  ),
})

const ProposalCard = ({ action, lastIndex = false, total = 0 }: ProposalCardType) => {
  const containerRef = useRef(null)
  const [containerHeight, setContainerHeight] = useState(0)
  useEffect(() => {
    if (containerRef.current) {
      setContainerHeight(containerRef.current.clientHeight)
    }
  }, [])

  return (
    <Flex width="100%" gap={4} ref={containerRef}>
      {total > 1 && (
        <Flex flexDirection="column" alignItems="center" gap={2}>
          <RoundArtifact />
          {times(lastIndex ? 0 : containerHeight / 18, () => {
            return <Box width="2px" height="10px" backgroundColor={Colors.SILVER}></Box>
          })}
        </Flex>
      )}

      <Flex
        flexDirection="column"
        gap={4}
        padding={4}
        borderRadius="12px"
        width="100%"
        backgroundColor={Colors.SNOW_WHITE_ALPHA_08}
      >
        <Text fontFamily="orb" fontSize="18px" fontWeight={700} color={Colors.DI_SERRIA}>
          {action.name}
        </Text>
        {map(get(action, 'data', []), (value, key) => {
          return (
            <Flex
              width="100%"
              key={v4()}
              gap={4}
              justifyContent="space-between"
              flexDirection={lowerCase(key) === 'memo' ? 'column' : 'row'}
            >
              <Text fontFamily="tlm" fontSize="16px" fontWeight={700}>
                {startCase(key)}
              </Text>

              <Text fontFamily="tlm" fontWeight={400} fontSize="16px" color={Colors.SILVER}>
                {lowerCase(key) === 'quantity' ? formatNumber(value, 4, 4) + ' TLM' : value}
              </Text>
            </Flex>
          )
        })}
      </Flex>
    </Flex>
  )
}

export const ProposalDrawer = ({ proposal, isOpen, onClose }: ProposalDrawerType) => {
  const {
    wax: { walletId, selectedDacId },
  } = useAppState()
  const {
    wax: { setDacCustodianProposalPayload, tryApproveProposal, tryExecuteProposal },
    modal: { setPrimaryModalActive },
  } = useActions()

  const isCustodianDashboardPage = useMatch(PagePath.GovernanceCustodianDashboard)
  const {
    walletDaoDetails,
    loading: walletDaoDetailsLoading,
  }: { walletDaoDetails: DaoWalletDetailsResponse; loading: boolean } = useWalletDaoDetails({
    dacId: selectedDacId,
    walletId,
  })
  function cancelProposal(custProposal: FlattenedProposal) {
    const cancelCustodianProposal: ProposalType = {
      proposalTitle: custProposal.proposalName,
      proposalStatus: getProposalDashboardActionTextAndState(custProposal, walletId).state,
      statusCount: custProposal.votes,
      from: get(proposal, 'unpacked.actions[0].data.from', ''),
      to: get(proposal, 'unpacked.actions[0].data.to', ''),
      item: get(proposal, 'unpacked.actions[0].data.quantity', ''),
      description: proposal.description,
      memo: head(custProposal.unpacked.actions)?.data?.memo,
      uniqueID: toNumber(custProposal.id),
    }

    setDacCustodianProposalPayload(cancelCustodianProposal)
    setPrimaryModalActive({ modalName: 'CancelProposalModal', value: true })
  }
  function approveProposal(proposal: FlattenedProposal) {
    const data: ProposalApprovalPayload = {
      approver: walletId,
      dac_id: selectedDacId,
      proposal_name: proposal.proposalName,
    }
    tryApproveProposal(data)
  }
  function executeProposal(proposal: FlattenedProposal) {
    const data: ProposalExecutionPayload = {
      executer: walletId,
      dac_id: selectedDacId,
      proposal_name: proposal.proposalName,
    }
    tryExecuteProposal(data)
  }
  if (walletDaoDetailsLoading) return <LoadingSpinner />
  const userStatus = get(walletDaoDetails, 'user_status', 'explorer')

  return (
    <>
      <Drawer size="lg" placement="right" preserveScrollBarGap onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay onClick={onClose} />

        <DrawerContent
          style={{
            background: 'black',
          }}
        >
          <DrawerCloseButton />
          <DrawerBody
            css={css({
              scrollbarWidth: 'none',
              overflowY: 'scroll',
              '::-webkit-scrollbar': { display: 'none' },
              overflowScrolling: 'touch',
              boxShadow: 'inset 0 -2px 0 rgba(0, 0, 0, 0.1)',
            })}
            paddingTop={4}
          >
            <Flex pl="30px">
              <Text color={Colors.DI_SERRIA} fontSize="24px" fontWeight={600}>
                Proposal
              </Text>
            </Flex>
            <Flex flexDirection="column" background="transparent" marginTop="50px">
              <Box w="full" mx="auto" position="relative" paddingX="30px" top="-30px">
                <VStack spacing={4} alignItems="start">
                  {/* PROPOSAL TITLE */}
                  {proposal.hasClaimBudget ? (
                    <Text
                      fontSize={20}
                      maxWidth="400px"
                      fontWeight={400}
                      letterSpacing="0.1em"
                      textTransform="uppercase"
                      fontFamily="Titillium Web"
                      color={Colors.DODGE_BLUE}
                    >
                      Budget Claim
                    </Text>
                  ) : (
                    <Text
                      fontSize={20}
                      maxWidth="400px"
                      fontWeight={400}
                      letterSpacing="0.1em"
                      fontFamily="orb"
                      color={Colors.SNOW_WHITE}
                    >
                      {proposal.title}
                    </Text>
                  )}
                  <Flex flexDirection="column" width="100%" gap={4}>
                    <Flex width="100%" justifyContent="space-between">
                      <Text fontFamily="tlm" fontSize="16px" fontWeight={700}>
                        ID:
                      </Text>
                      <Text fontFamily="tlm" fontWeight={400} fontSize="16px" color={Colors.SILVER}>
                        {proposal?.id}
                      </Text>
                    </Flex>
                    <Flex width="100%" justifyContent="space-between">
                      <Text fontFamily="tlm" fontSize="16px" fontWeight={700}>
                        Status:
                      </Text>
                      <Text
                        fontSize="14px"
                        textAlign="center"
                        fontWeight={600}
                        whiteSpace="nowrap"
                        letterSpacing="0.1em"
                        fontFamily="Titillium Web"
                        color={getProposalDetailsTextColor(proposal.status)}
                      >
                        {proposal.status}
                      </Text>
                    </Flex>
                    <Flex width="100%" justifyContent="space-between">
                      <Text fontFamily="tlm" fontSize="16px" fontWeight={700}>
                        Votes:
                      </Text>
                      <Text
                        fontFamily="tlm"
                        fontWeight={400}
                        fontSize="16px"
                        color={getProposalDetailsVotesColor(proposal.status)}
                      >
                        {proposal.votes} / 3
                      </Text>
                    </Flex>
                    <Flex width="100%" justifyContent="space-between">
                      <Text fontFamily="tlm" fontSize="16px" fontWeight={700}>
                        Created By:
                      </Text>
                      <Text fontFamily="tlm" fontWeight={400} fontSize="16px" color={Colors.SILVER}>
                        {proposal.createdBy}
                      </Text>
                    </Flex>
                    <Text fontFamily="tlm" fontSize="16px" fontWeight={700}>
                      Description:
                    </Text>
                    {proposal.hasClaimBudget ? (
                      <Text
                        fontSize="16px"
                        fontWeight={600}
                        whiteSpace="nowrap"
                        letterSpacing="0.1em"
                        fontFamily="Titillium Web"
                        color={Colors.DODGE_BLUE}
                      >
                        N/A
                      </Text>
                    ) : (
                      <Text fontFamily="tlm" fontWeight={400} fontSize="16px" color={Colors.SILVER}>
                        {proposal.description}
                      </Text>
                    )}
                  </Flex>

                  {/* PROPOSAL VOTES AND STATUS */}
                  {map(proposal?.unpacked?.actions, (action, index) => (
                    <ProposalCard
                      action={action}
                      key={v4()}
                      index={index + 1}
                      total={proposal?.unpacked?.actions?.length}
                      lastIndex={index === proposal?.unpacked?.actions?.length - 1}
                    />
                  ))}

                  {/* PROPOSAL ID */}
                  {/* <Flex flexDirection="column">
                    <Text
                      fontSize="14px"
                      textAlign="start"
                      fontWeight={600}
                      letterSpacing="0.1em"
                      fontFamily="Titillium Web"
                      color={Colors.GRAY}
                    >
                      ID:
                    </Text>
                    <Text
                      fontSize="14px"
                      textAlign="start"
                      fontWeight={600}
                      letterSpacing="0.1em"
                      fontFamily="Titillium Web"
                      color={Colors.SNOW_WHITE}
                    >
                      {proposal?.id}
                    </Text>
                  </Flex> */}

                  {/* PROPOSAL CREATED BY */}
                  {/* <Flex flexDirection="column">
                    <Text
                      fontSize="14px"
                      textAlign="start"
                      fontWeight={600}
                      letterSpacing="0.1em"
                      fontFamily="Titillium Web"
                      color={Colors.GRAY}
                    >
                      Created by:
                    </Text>
                    <Text
                      fontSize="14px"
                      textAlign="start"
                      fontWeight={600}
                      letterSpacing="0.1em"
                      fontFamily="Titillium Web"
                      color={Colors.SNOW_WHITE}
                    >
                      {proposal?.proposer}
                    </Text>
                  </Flex> */}

                  {/* PROPOSAL FROM */}
                  {/* <Flex flexDirection="column">
                    <Text
                      fontSize="14px"
                      textAlign="start"
                      fontWeight={600}
                      whiteSpace="nowrap"
                      letterSpacing="0.1em"
                      fontFamily="Titillium Web"
                      color={Colors.GRAY}
                    >
                      From
                    </Text>
                    <Text
                      fontSize="14px"
                      textAlign="start"
                      fontWeight={600}
                      whiteSpace="nowrap"
                      letterSpacing="0.1em"
                      fontFamily="Titillium Web"
                      color={Colors.DI_SERRIA}
                    >
                      {currentDac?.owner}
                    </Text>
                  </Flex> */}

                  {/* PROPOSAL TO */}
                  {/* <Flex flexDirection="column">
                    <Text
                      fontSize="14px"
                      textAlign="start"
                      fontWeight={600}
                      whiteSpace="nowrap"
                      letterSpacing="0.1em"
                      fontFamily="Titillium Web"
                      color={Colors.GRAY}
                    >
                      To
                    </Text>
                    {proposal?.isBudgetClaim ? (
                      <Text
                        fontSize="16px"
                        fontWeight={600}
                        whiteSpace="nowrap"
                        letterSpacing="0.1em"
                        fontFamily="Titillium Web"
                        color={Colors.DODGE_BLUE}
                      >
                        {currentDac?.owner}
                      </Text>
                    ) : (
                      <Text
                        fontSize="14px"
                        fontWeight={400}
                        whiteSpace="nowrap"
                        letterSpacing="0.1em"
                        fontFamily="Titillium Web"
                        color={Colors.SNOW_WHITE}
                      >
                        {proposal?.actions[0]?.data?.to}
                      </Text>
                    )}
                  </Flex> */}

                  {/* PROPOSAL ITEM */}
                  {/* <Flex flexDirection="column">
                    <Text
                      fontSize="14px"
                      textAlign="start"
                      fontWeight={600}
                      whiteSpace="nowrap"
                      letterSpacing="0.1em"
                      fontFamily="Titillium Web"
                      color={Colors.GRAY}
                    >
                      Item
                    </Text>
                    {proposal?.isBudgetClaim ? (
                      <Text
                        fontSize="16px"
                        fontWeight={600}
                        whiteSpace="nowrap"
                        letterSpacing="0.1em"
                        fontFamily="Titillium Web"
                        color={Colors.DODGE_BLUE}
                      >
                        BUDGET
                      </Text>
                    ) : (
                      <Text
                        fontSize="14px"
                        textAlign="center"
                        fontWeight={600}
                        whiteSpace="nowrap"
                        letterSpacing="0.1em"
                        fontFamily="Titillium Web"
                        color={Colors.SNOW_WHITE}
                      >
                        {formatNumber(proposal?.actions[0]?.data?.quantity, 4, 4)} TLM
                      </Text>
                    )}
                  </Flex> */}

                  {/* PROPOSAL DESCRIPTION */}
                  {/* <Flex flexDirection="column">
                    <Text
                      fontSize="14px"
                      textAlign="start"
                      fontWeight={600}
                      whiteSpace="nowrap"
                      letterSpacing="0.1em"
                      fontFamily="Titillium Web"
                      color={Colors.GRAY}
                    >
                      Description
                    </Text>
                    {proposal?.isBudgetClaim ? (
                      <Text
                        fontSize="16px"
                        fontWeight={600}
                        whiteSpace="nowrap"
                        letterSpacing="0.1em"
                        fontFamily="Titillium Web"
                        color={Colors.DODGE_BLUE}
                      >
                        N/A
                      </Text>
                    ) : (
                      <Text
                        fontSize="14px"
                        fontWeight={600}
                        maxWidth="full"
                        textAlign="start"
                        letterSpacing="0.1em"
                        fontFamily="Titillium Web"
                        color={Colors.SNOW_WHITE}
                      >
                        {head(filter(proposal?.metadata, ['key', 'description']))?.value}
                      </Text>
                    )}
                  </Flex> */}

                  {/* PROPOSAL MEMO */}
                  {/* <Flex flexDirection="column">
                    <Text
                      fontSize="14px"
                      textAlign="start"
                      fontWeight={600}
                      whiteSpace="nowrap"
                      letterSpacing="0.1em"
                      fontFamily="Titillium Web"
                      color={Colors.GRAY}
                    >
                      Memo
                    </Text>
                    {proposal?.isBudgetClaim ? (
                      <Text
                        fontSize="16px"
                        fontWeight={600}
                        whiteSpace="nowrap"
                        letterSpacing="0.1em"
                        fontFamily="Titillium Web"
                        color={Colors.DODGE_BLUE}
                      >
                        N/A
                      </Text>
                    ) : (
                      <Text
                        fontSize="14px"
                        fontWeight={600}
                        maxWidth="400px"
                        textAlign="start"
                        letterSpacing="0.1em"
                        fontFamily="Titillium Web"
                        color={Colors.SNOW_WHITE}
                      >
                        {proposal?.actions[0]?.data?.memo?.substring(0, 256)}
                      </Text>
                    )}
                  </Flex> */}

                  <Flex flexDirection="column" mt="20px" width="100%" justifyItems="center">
                    {/* note: button not scoped until further notice */}
                    {/* <Button
                      mt="10px"
                      size="sm"
                      variant="info"
                      bg={Colors.SECONDARY_RED}
                      onClick={() => null}
                    >
                      View Tx on Chain
                    </Button> */}

                    <Flex flexDirection="column" gap={2}>
                      {userStatus === toLower(DACUserStatusType.CUSTODIAN) &&
                        (proposal.status === toLower(ProposalStatus.APPROVABLE) ||
                          proposal.status === toLower(ProposalStatus.PENDING)) && (
                          <Button
                            variant="negative"
                            size="sm"
                            onClick={() => approveProposal(proposal)}
                          >
                            Approve Proposal
                          </Button>
                        )}
                      {userStatus === toLower(DACUserStatusType.CUSTODIAN) &&
                        proposal.status === toLower(ProposalStatus.PENDING) && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => {
                              executeProposal(proposal)
                            }}
                          >
                            Execute Proposal
                          </Button>
                        )}
                    </Flex>

                    {isCustodianDashboardPage && isCancelableProposal(proposal, walletId) && (
                      <Button
                        marginTop="10px"
                        size="sm"
                        variant="alert"
                        backgroundColor={Colors.SECONDARY_RED}
                        onClick={() => cancelProposal(proposal)}
                        leftIcon={
                          <Box
                            bg={Colors.SNOW_WHITE}
                            zIndex={1300}
                            cursor="pointer"
                            style={{
                              width: 20,
                              height: 20,
                              right: '5px',
                              borderRadius: '50px',
                              position: 'relative',
                            }}
                          >
                            <CanceledIcon
                              color={Colors.RADICAL_RED}
                              style={{
                                width: 30,
                                height: 30,
                                top: '-5px',
                                left: '-5px',
                                position: 'relative',
                                zIndex: 2,
                              }}
                            />
                          </Box>
                        }
                      >
                        Cancel Proposal
                      </Button>
                    )}
                  </Flex>
                </VStack>
              </Box>
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
