import { useEffect, useState } from 'react'

import { PlanetIcon, PendingIcon, TriliumIcon, ProposalsIcon } from '@alien-worlds/icons'
import { Button, FormField } from '@alien-worlds/uikit'
import {
  Flex,
  Text,
  Textarea,
  HStack,
  Spacer,
  Slider,
  SliderFilledTrack,
  SliderTrack,
  SliderThumb,
  SliderMark,
} from '@chakra-ui/react'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { ProposalsTableVirtualised } from 'features/syndicates/components/ProposalsTableVirtualised/ProposalsTableVirtualised'
import {
  DaoChangeConfigs,
  DaoDTAPPayload,
  DaoElectionPeriodPayload,
  ProposalStatus,
} from 'features/syndicates/types/governanceTypes'
import { generateRandomProposalName } from 'features/syndicates/utils/GovernanceHelper'
import { Formik } from 'formik'
import { useDaoDetails } from 'graphql/hooks/useDaoDetails'
import { useMsigsProposals } from 'graphql/hooks/useMsigsProposals'
import { DaoDetailsResponse, MsigsResponse } from 'graphql/types'
import { every, filter, map, slice, some, trim } from 'lodash'
import { useParams } from 'react-router-dom'
import Select from 'react-select'
import { Colors } from 'shared/util/colors'
import { dacUnionIdToPlanet, isUnionDAO, unionDAOFinder } from 'shared/util/helpers'
import { useActions, useAppState } from 'store'

const proposalTypes: { value: string; label: string }[] = [
  { value: 'dtap_reward', label: 'DTAP Reward' },
  { value: 'claim_budget', label: 'Claim Budget' },
  { value: 'transfer_tlm', label: 'Transfer TLM' },
  { value: 'change_election_configs', label: 'Change Election Configs' },
  { value: 'election_period', label: 'Election Period' },
]

const proposalValidationSchema = {
  title: (value: string) => {
    if (!value || trim(value).length < 3) return 'Min. 3 characters required'
    return null
  },
  to: (value: string) => {
    if (!value || trim(value).length < 1) return 'Min. 1 character required'
    return null
  },
  item: (value: string) => {
    const numValue = parseFloat(value)
    if (isNaN(numValue) || numValue <= 0) return 'Item quantity must be positive'
    return null
  },
  memo: (value: string) => {
    if (!value || trim(value).length < 3) return 'Min. 3 characters required'
    return null
  },
  description: (value: string) => {
    if (!value || trim(value).length < 3) return 'Min. 3 characters required'
    return null
  },
  numCustodians: (value: number) => {
    if (value < 5 || value > 21) return 'Must be between 5 and 21'
    return null
  },
  threshold: (value: number, numCustodians: number) => {
    if (value < Math.floor(numCustodians / 2))
      return `Must be at least ${Math.floor(numCustodians / 2)}`
    if (value > numCustodians) return `Cannot exceed ${numCustodians}`
    return null
  },
  electionDuration: (value: number) => {
    if (value < 7 || value > 180) return 'Must be between 7 and 180 days'
    return null
  },
}

const customStyles = {
  control: (provided) => ({
    ...provided,
    border: `2px solid ${Colors.SILVER}`,
    borderRadius: '5px',
    minHeight: '42px',
    fontFamily: 'Titillium Web',
    fontSize: '16px',
    fontWeight: 500,
    backgroundColor: Colors.BLACK_NEUTRAL_80,
    color: Colors.SNOW_WHITE,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused
      ? Colors.GRAY_CHATEAU
      : state.isSelected
      ? Colors.BLACK_NEUTRAL
      : 'white',
    color: state.isFocused || state.isSelected ? 'white' : Colors.BLACK_NEUTRAL,
    padding: 10,
  }),
  singleValue: (provided) => ({
    ...provided,
    color: 'white',
  }),

  menu: (provided) => ({
    ...provided,
    zIndex: 9999,
  }),
  placeHolder: (provided) => ({
    ...provided,
    color: Colors.GRAY_CHATEAU,
    paddingLeft: '32px',
  }),
}

export const CustodianDashboard = () => {
  const {
    wax: { selectedDacId },
  } = useAppState()
  const {
    wax: {
      tryClaimBudget,
      tryCreateNewProposal,
      tryChangeDaoConfigs,
      trySetDtapConfigs,
      tryChangeElectionDuration,
    },
    modal: { setSecondaryModalActive },
    main: { showGovernanceCustodianDashboard },
  } = useActions()

  const { msigsProposals, loading }: { msigsProposals: MsigsResponse[]; loading: boolean } =
    useMsigsProposals(isUnionDAO(selectedDacId) ? unionDAOFinder(selectedDacId) : selectedDacId)
  const { planetId } = useParams()

  const {
    daoDetails,
    loading: daoDetailsLoading,
  }: { daoDetails: DaoDetailsResponse; loading: boolean } = useDaoDetails(selectedDacId)

  const [filteredOptions, setFilteredOptions] = useState<{ value: string; label: string }[]>()
  const [selectedOption, setSelectedOption] = useState<{ value: string; label: string }>({
    value: '',
    label: '',
  })
  const [formReady, setFormReady] = useState(false)
  const [proposalTo, setProposalTo] = useState<string>('')
  const [proposalMemo, setProposalMemo] = useState<string>('')
  const [proposalFrom, setProposalFrom] = useState<string>('')
  const [proposalItem, setProposalItem] = useState<string>('')
  const [proposalTitle, setProposalTitle] = useState<string>('')
  const [destination, setDestination] = useState<string>('')
  const [isBudgetPending, setIsBudgetPending] = useState<boolean>(false)
  const [isBudgetClaimed, setIsBudgetClaimed] = useState<boolean>(false)
  const [isBudgetAvailable, setIsBudgetAvailable] = useState<boolean>(true)
  const [proposalDescription, setProposalDescription] = useState<string>('')
  const [numofCustodian, setNumberOfCustodian] = useState<number>(5)
  const [maxVotes, setMaxVotes] = useState<number>(2)
  const [threshold, setThreshold] = useState<number>(2)
  const [sliderValue, setSliderValue] = useState(50)
  const [electionSliderValue, setElectionSliderValue] = useState(30)

  const labelStyles = {
    mt: '2',
    ml: '-2.5',
    fontSize: 'sm',
  }

  function setBudgetClaimStatus() {
    if (!loading) {
      const foundBudgetClaims = filter(msigsProposals, (proposal) =>
        some(proposal?.unpacked?.actions, { name: 'claimbudget' })
      )
      const filteredBudgetClaims = filter(
        foundBudgetClaims,
        (claim) =>
          claim.state !== ProposalStatus.CANCELED &&
          claim.state !== ProposalStatus.EXPIRED &&
          claim.state !== ProposalStatus.EXECUTED
      )
      const claimedBudgetClaims = filter(
        filteredBudgetClaims,
        (claim) => claim.state === ProposalStatus.EXECUTED
      )
      const pendingBudgetClaims = filter(
        filteredBudgetClaims,
        (claim) => claim.state === ProposalStatus.APPROVABLE
      )

      if (pendingBudgetClaims.length === 0 && claimedBudgetClaims.length === 0) {
        setIsBudgetAvailable(true)
        setIsBudgetPending(false)
        setIsBudgetClaimed(false)
      } else if (pendingBudgetClaims.length > 0 && claimedBudgetClaims.length === 0) {
        setIsBudgetAvailable(false)
        setIsBudgetPending(true)
        setIsBudgetClaimed(false)
      } else if (claimedBudgetClaims.length > 0) {
        setIsBudgetAvailable(false)
        setIsBudgetPending(false)
        setIsBudgetClaimed(true)
      }
    } else {
      setIsBudgetAvailable(true)
      setIsBudgetPending(false)
      setIsBudgetClaimed(false)
    }
  }

  function claimBudget() {
    const claimBudgetProposal = {
      metadata: [],
      expirationDays: 7,
      dac_id: selectedDacId,
      proposer: daoDetails.owner,
      proposal_name: generateRandomProposalName(),
    }
    tryClaimBudget(claimBudgetProposal)
  }

  const onConfirmCreateProposal = () => {
    const newCustodianProposal = {
      tx_actions: [],
      expirationDays: 7,
      dac_id: selectedDacId,
      proposal_to: proposalTo,
      proposal_memo: proposalMemo,
      proposer: daoDetails.owner,
      proposal_quantity: proposalItem,
      proposal_name: generateRandomProposalName(),
      metadata: [
        {
          key: 'title',
          value: proposalTitle,
        },
        {
          key: 'description',
          value: proposalDescription,
        },
      ],
    }
    tryCreateNewProposal(newCustodianProposal)
  }
  const onConfirmChangeConfigs = () => {
    const newDaoConfigs: DaoChangeConfigs = {
      dac_id: selectedDacId,
      maxvotes: maxVotes,
      auththreshold: threshold,
      numelected: numofCustodian,
      proposalName: generateRandomProposalName(),
      proposalTitle: proposalTitle,
      proposalDescription: proposalDescription,
      proposer: daoDetails.owner,
    }
    tryChangeDaoConfigs(newDaoConfigs)
  }
  const onConfirmDTAPProposal = () => {
    const newDTAP: DaoDTAPPayload = {
      dac_id: selectedDacId,
      claim_rate_perc_x100: sliderValue * 100,
      destination: destination,
      planet_name: dacUnionIdToPlanet[selectedDacId],
      proposer: daoDetails.owner,
      proposalTitle: proposalTitle,
      proposalDescription: proposalDescription,
      proposalName: generateRandomProposalName(),
    }

    trySetDtapConfigs(newDTAP)
  }
  const onConfirmElectionPeriodProposal = () => {
    const newElectionPeriod: DaoElectionPeriodPayload = {
      dac_id: selectedDacId,
      electionDuration: electionSliderValue,
      proposer: daoDetails.owner,
      proposalTitle: proposalTitle,
      proposalDescription: proposalDescription,
      proposalName: generateRandomProposalName(),
    }
    tryChangeElectionDuration(newElectionPeriod)
  }

  function createDTAPProposal() {
    setSecondaryModalActive({
      modalName: 'BlockchainDTAPDisclaimerModal',
      value: true,
      onConfirm: onConfirmDTAPProposal,
    })
  }
  function createElectionPeriodProposal() {
    setSecondaryModalActive({
      modalName: 'BlockchainSubmitDisclaimerModal',
      value: true,
      onConfirm: onConfirmElectionPeriodProposal,
    })
  }
  function createConfigsProposal() {
    setSecondaryModalActive({
      modalName: 'BlockchainChangeDaoConfigsDisclaimerModal',
      value: true,
      onConfirm: onConfirmChangeConfigs,
    })
  }
  function createProposal() {
    if (!formReady) {
      return
    }

    setSecondaryModalActive({
      modalName: 'BlockchainSubmitDisclaimerModal',
      value: true,
      onConfirm: onConfirmCreateProposal,
    })
  }

  function validateField(field: string, value: any) {
    let status: string

    switch (field) {
      case 'title':
      case 'memo':
      case 'description':
        if (trim(value).length < 3) {
          status = 'Min. 3 characters required'
        }
        break
      case 'to':
        if (trim(value).length < 1) {
          status = 'Min. 1 character required'
        }
        break
      case 'item':
        if (value <= 0) {
          status = 'Item quantity must be positive'
        }
        break
      case 'destination':
        if (trim(value).length < 3) {
          status = 'Min. 3 characters required'
        }
        if (trim(value).length > 12) {
          status = 'Max. 12 characters allowed'
        }
        break

      default:
        break
    }
    return status
  }

  useEffect(() => {
    setBudgetClaimStatus()
  }, [msigsProposals])

  useEffect(() => {
    const tempProposal = {
      a: proposalTo,
      b: proposalMemo,
      c: proposalTitle,
      d: proposalItem,
      e: proposalDescription,
    }
    const isCompletedForm = every(map(tempProposal, (val) => val.length > 0))
    if (isCompletedForm) {
      setFormReady(true)
    } else {
      setFormReady(false)
    }
    return () => {
      setFormReady(false)
    }
  }, [proposalTo, proposalMemo, proposalTitle, proposalItem, proposalDescription])

  useEffect(() => {
    if (daoDetails) {
      setProposalFrom(daoDetails.owner)
    }
    return () => {
      setProposalFrom('')
    }
  }, [daoDetails])

  useEffect(() => {
    showGovernanceCustodianDashboard(planetId)
    setProposalTo('')
    setProposalMemo('')
    setProposalItem('')
    setProposalTitle('')
    setProposalDescription('')
  }, [])
  useEffect(() => {
    if (isUnionDAO(selectedDacId)) {
      const slicedProposalTypes = proposalTypes.filter((_, index) => index !== 1 && index !== 3)
      setFilteredOptions(slicedProposalTypes)
      setSelectedOption(proposalTypes[0])
    } else {
      setFilteredOptions(slice(proposalTypes, 1, 5))
      setSelectedOption(proposalTypes[1])
    }
  }, [selectedDacId])
  if (daoDetailsLoading) {
    return <LoadingSpinner />
  }
  return (
    <>
      <Flex
        mt={6}
        gap={2}
        alignItems={{ base: 'center', xl: 'start' }}
        flexDirection={{ base: 'column', xl: 'row' }}
        justifyContent={{ base: 'center', xl: 'space-between' }}
      >
        {/* LEFT SECTION */}
        <Flex
          gap={4}
          pt="10px"
          maxW="400px"
          h="fit-content"
          flexDirection="column"
          bg={Colors.BLACK_SOLID_65}
          w={{ base: '99%', md: '50vw', xl: '30vw' }}
        >
          {/* NEW PROPOSAL FORM */}
          <Flex alignItems="center" gap={2} pt="10px" pl="10px">
            <ProposalsIcon style={{ width: 25, height: 25 }} color={Colors.DI_SERRIA} />
            <Text
              ml="5px"
              fontSize="20px"
              fontWeight={400}
              whiteSpace="nowrap"
              letterSpacing="0.1em"
              fontFamily="Orbitron"
              color={Colors.GRAY_CHATEAU}
            >
              New Proposal
            </Text>
          </Flex>
          <Flex flexDirection="column" p="25px" borderRadius="13px">
            <Flex w="100%" flexDirection="column" alignItems={{ base: 'center', lg: 'start' }}>
              <Formik
                initialValues={{
                  to: '',
                  item: '',
                  memo: '',
                  title: '',
                  description: '',
                  proposalType: proposalTypes[0].value,
                  numCustodians: 5,
                  numVotes: 2,
                  threshold: 2,
                  electionDuration: 30,
                }}
                validate={(values) => {
                  const errors: any = {}

                  if (selectedOption.value === 'transfer_tlm') {
                    const titleError = proposalValidationSchema.title(values.title)
                    if (titleError) errors.title = titleError

                    const toError = proposalValidationSchema.to(values.to)
                    if (toError) errors.to = toError

                    const itemError = proposalValidationSchema.item(values.item)
                    if (itemError) errors.item = itemError

                    const memoError = proposalValidationSchema.memo(values.memo)
                    if (memoError) errors.memo = memoError

                    const descError = proposalValidationSchema.description(values.description)
                    if (descError) errors.description = descError
                  }

                  if (selectedOption.value === 'change_election_configs') {
                    const custodiansError = proposalValidationSchema.numCustodians(
                      values.numCustodians
                    )
                    if (custodiansError) errors.numCustodians = custodiansError

                    const thresholdError = proposalValidationSchema.threshold(
                      values.threshold,
                      values.numCustodians
                    )
                    if (thresholdError) errors.threshold = thresholdError
                  }

                  if (selectedOption.value === 'election_period') {
                    const titleError = proposalValidationSchema.title(values.title)
                    if (titleError) errors.title = titleError

                    const descError = proposalValidationSchema.description(values.description)
                    if (descError) errors.description = descError

                    const electionDurationError = proposalValidationSchema.electionDuration(
                      values.electionDuration
                    )
                    if (electionDurationError) errors.electionDuration = electionDurationError
                  }

                  return errors
                }}
                onSubmit={() => {
                  createProposal()
                }}
              >
                {({ handleSubmit, setErrors, values, setFieldValue }) => (
                  <form onSubmit={handleSubmit} onChange={() => {}} style={{ width: '100%' }}>
                    <Flex width="100%" gap={5} flexDirection="column">
                      {/* PROPOSAL TYPE SELECT */}
                      <Flex flexDirection="column" width="100%">
                        <Text
                          w="100%"
                          mr={15}
                          minW={200}
                          fontSize={16}
                          fontWeight={600}
                          color={Colors.LOBLOLLY}
                          fontFamily="Titillium Web"
                        >
                          Proposal Type
                        </Text>
                        <Select
                          options={filteredOptions}
                          defaultValue={
                            filteredOptions ? filteredOptions[0] : { value: '', label: '' }
                          }
                          value={selectedOption}
                          onChange={(selectedOption) => {
                            if (selectedOption.value) setSelectedOption(selectedOption)
                            setFieldValue('proposalType', selectedOption.value)
                            setErrors({})
                          }}
                          styles={customStyles}
                          // {
                          // control: (base) => ({
                          //   ...base,

                          // }),
                          // placeholder: (base) => ({
                          //   ...base,
                          //   color: Colors.GRAY_CHATEAU,
                          //   paddingLeft: '32px',
                          // }),
                          // singleValue: (base) => ({
                          //   ...base,
                          //   color: Colors.GRAY_CHATEAU,
                          //   paddingLeft: '32px',
                          // }),
                          // input: (base) => ({
                          //   ...base,
                          //   paddingLeft: '32px',
                          // }),
                          //}

                          placeholder="Select proposal type"
                        />
                      </Flex>

                      {/* TITLE - Common for all proposal types */}
                      {(selectedOption.value === 'transfer_tlm' ||
                        selectedOption.value === 'change_election_configs' ||
                        selectedOption.value === 'dtap_reward' ||
                        selectedOption.value === 'election_period') && (
                        <Flex flexDirection="column" width="100%">
                          <Text
                            w="100%"
                            mr={15}
                            minW={200}
                            fontSize={16}
                            fontWeight={600}
                            color={Colors.LOBLOLLY}
                            fontFamily="Titillium Web"
                          >
                            Title
                          </Text>
                          <FormField
                            name="title"
                            size="lg"
                            placeholder=""
                            fontSize={16}
                            marginTop={0}
                            minHeight={42}
                            borderWidth={2}
                            borderRadius={5}
                            fontWeight={500}
                            paddingLeft="32px"
                            fontFamily="Titillium Web"
                            value={proposalTitle ?? ''}
                            borderColor={Colors.SILVER}
                            color={Colors.GRAY_CHATEAU}
                            width="100%"
                            validate={() => validateField('title', proposalTitle)}
                            onChange={({ target: { value } }) => {
                              setProposalTitle(value)
                              setErrors({})
                            }}
                          />
                        </Flex>
                      )}

                      {/* CLAIM BUDGET - Just a button */}
                      {selectedOption.value === 'claim_budget' && (
                        <Flex justifyContent="center" mt={4}>
                          <Button
                            size="sm"
                            variant="primary"
                            isDisabled={!isBudgetAvailable}
                            onClick={() => claimBudget()}
                            leftIcon={<PlanetIcon w="20px" h="20px" color={Colors.SNOW_WHITE} />}
                          >
                            Claim Budget
                          </Button>
                        </Flex>
                      )}

                      {/* TRANSFER TLM - Original form */}
                      {selectedOption.value === 'transfer_tlm' && (
                        <>
                          <Flex flexDirection="column">
                            <Text
                              w="100%"
                              mr={15}
                              minW={200}
                              fontSize={16}
                              fontWeight={600}
                              color={Colors.LOBLOLLY}
                              fontFamily="Titillium Web"
                            >
                              From
                            </Text>
                            <FormField
                              size="lg"
                              name="from"
                              disabled
                              type="string"
                              placeholder=""
                              margin="auto"
                              fontSize={16}
                              marginTop={0}
                              minHeight={42}
                              borderWidth={2}
                              borderRadius={5}
                              fontWeight={500}
                              paddingLeft="32px"
                              width="100%"
                              color={Colors.DI_SERRIA}
                              fontFamily="Titillium Web"
                              value={proposalFrom ?? ''}
                              borderColor={Colors.SILVER}
                              validate={() => validateField('from', proposalFrom)}
                              onChange={({ target: { value } }) => {
                                setProposalFrom(value)
                                setErrors({})
                              }}
                            />
                          </Flex>

                          <Flex flexDirection="column">
                            <Text
                              w="100%"
                              mr={15}
                              minW={200}
                              fontSize={16}
                              fontWeight={600}
                              color={Colors.LOBLOLLY}
                              fontFamily="Titillium Web"
                            >
                              To
                            </Text>
                            <FormField
                              size="lg"
                              name="to"
                              type="string"
                              placeholder=""
                              margin="auto"
                              fontSize={16}
                              marginTop={0}
                              minHeight={42}
                              borderWidth={2}
                              borderRadius={5}
                              fontWeight={500}
                              width="100%"
                              paddingLeft="32px"
                              value={proposalTo ?? ''}
                              fontFamily="Titillium Web"
                              borderColor={Colors.SILVER}
                              color={Colors.GRAY_CHATEAU}
                              validate={() => validateField('to', proposalTo)}
                              onChange={({ target: { value } }) => {
                                setProposalTo(value)
                                setErrors({})
                              }}
                            />
                          </Flex>

                          <Flex flexDirection="column">
                            <Text
                              w="100%"
                              mr={15}
                              minW={200}
                              fontSize={16}
                              fontWeight={600}
                              color={Colors.LOBLOLLY}
                              fontFamily="Titillium Web"
                            >
                              Item
                            </Text>
                            <Flex width="100%">
                              <FormField
                                size="lg"
                                name="item"
                                type="number"
                                placeholder="Quantity"
                                margin="auto"
                                fontSize={16}
                                marginTop={0}
                                minHeight={42}
                                borderWidth={2}
                                borderRadius={5}
                                fontWeight={500}
                                paddingLeft="32px"
                                width="100%"
                                fontFamily="Titillium Web"
                                value={proposalItem ?? ''}
                                borderColor={Colors.SILVER}
                                color={Colors.GRAY_CHATEAU}
                                validate={() => validateField('item', proposalItem)}
                                onChange={({ target: { value } }) => {
                                  setProposalItem(value)
                                  setErrors({})
                                }}
                              />
                              <Flex
                                position="relative"
                                alignItems="center"
                                ml="-65px"
                                h="40px"
                                mt="10px"
                              >
                                <TriliumIcon
                                  style={{ width: 15, height: 15, color: Colors.SNOW_WHITE }}
                                />
                                <Text
                                  w="40px"
                                  fontSize={20}
                                  fontWeight={700}
                                  letterSpacing={0.08}
                                  color={Colors.SNOW_WHITE}
                                  fontFamily="Titillium Web"
                                >
                                  TLM
                                </Text>
                              </Flex>
                            </Flex>
                          </Flex>
                          <Flex flexDirection="column">
                            <Text
                              w="100%"
                              mr={15}
                              minW={200}
                              fontSize={16}
                              fontWeight={600}
                              color={Colors.LOBLOLLY}
                              fontFamily="Titillium Web"
                            >
                              Memo
                            </Text>
                            <FormField
                              size="lg"
                              name="memo"
                              type="string"
                              placeholder=""
                              margin="auto"
                              fontSize={16}
                              marginTop={0}
                              minHeight={42}
                              borderWidth={2}
                              borderRadius={5}
                              fontWeight={500}
                              paddingLeft="32px"
                              width="100%"
                              fontFamily="Titillium Web"
                              value={proposalMemo ?? ''}
                              borderColor={Colors.SILVER}
                              color={Colors.GRAY_CHATEAU}
                              validate={() => validateField('memo', proposalMemo)}
                              onChange={({ target: { value } }) => {
                                setProposalMemo(value)
                                setErrors({})
                              }}
                            />
                          </Flex>
                        </>
                      )}

                      {/* CHANGE ELECTION CONFIGS */}
                      {selectedOption.value === 'dtap_reward' && (
                        <>
                          <Flex flexDirection="column" width="100%" gap={2}>
                            <Text
                              w="100%"
                              mr={15}
                              minW={200}
                              fontSize={16}
                              fontWeight={600}
                              color={Colors.LOBLOLLY}
                              fontFamily="Titillium Web"
                            >
                              Claim Rate Percentage
                            </Text>
                            <Slider
                              aria-label="slider-ex-6"
                              defaultValue={5}
                              min={0}
                              max={10}
                              step={0.01}
                              onChange={(val) => setSliderValue(val)}
                            >
                              <SliderMark value={2} {...labelStyles}>
                                2%
                              </SliderMark>
                              <SliderMark value={5} {...labelStyles}>
                                5%
                              </SliderMark>
                              <SliderMark value={9} {...labelStyles}>
                                9%
                              </SliderMark>
                              <SliderMark
                                value={sliderValue}
                                textAlign="center"
                                bg="blue.500"
                                color="white"
                                mt="-10"
                                ml="-5"
                                w="12"
                              >
                                {sliderValue}%
                              </SliderMark>
                              <SliderTrack>
                                <SliderFilledTrack />
                              </SliderTrack>
                              <SliderThumb />
                            </Slider>
                          </Flex>
                          <Flex flexDirection="column" width="100%">
                            <Text
                              w="100%"
                              mr={15}
                              minW={200}
                              fontSize={16}
                              fontWeight={600}
                              color={Colors.LOBLOLLY}
                              fontFamily="Titillium Web"
                            >
                              Destination Account
                            </Text>
                            <FormField
                              name="destination"
                              size="lg"
                              placeholder=""
                              fontSize={16}
                              marginTop={0}
                              minHeight={42}
                              borderWidth={2}
                              borderRadius={5}
                              fontWeight={500}
                              paddingLeft="32px"
                              fontFamily="Titillium Web"
                              value={destination ?? ''}
                              borderColor={Colors.SILVER}
                              color={Colors.GRAY_CHATEAU}
                              width="100%"
                              validate={() => validateField('destination', destination)}
                              onChange={({ target: { value } }) => {
                                setDestination(value)
                                setErrors({})
                              }}
                            />
                          </Flex>
                        </>
                      )}
                      {selectedOption.value === 'change_election_configs' && (
                        <>
                          <Flex flexDirection="column">
                            <Text
                              w="100%"
                              mr={15}
                              minW={200}
                              fontSize={16}
                              fontWeight={600}
                              color={Colors.LOBLOLLY}
                              fontFamily="Titillium Web"
                            >
                              Select Number of Custodians (5-21)
                            </Text>
                            <Select
                              options={Array.from({ length: 17 }, (_, i) => ({
                                value: i + 5,
                                label: (i + 5).toString(),
                              }))}
                              value={{
                                value: values.numCustodians,
                                label: values.numCustodians.toString(),
                              }}
                              onChange={(selectedOption) => {
                                const numCustodians = selectedOption.value
                                const numVotes = Math.floor(numCustodians / 2)

                                setFieldValue('numCustodians', numCustodians)
                                setFieldValue('numVotes', numVotes)
                                setFieldValue('threshold', numVotes)
                                setNumberOfCustodian(numCustodians)
                                setMaxVotes(numVotes)
                                setThreshold(numVotes)
                                setErrors({})
                              }}
                              styles={customStyles}
                              placeholder="Select number of custodians"
                            />
                          </Flex>

                          <Flex flexDirection="column">
                            <Text
                              w="100%"
                              mr={15}
                              minW={200}
                              fontSize={16}
                              fontWeight={600}
                              color={Colors.LOBLOLLY}
                              fontFamily="Titillium Web"
                            >
                              Number of Votes (auto-calculated)
                            </Text>
                            <FormField
                              size="lg"
                              name="numVotes"
                              type="number"
                              placeholder=""
                              margin="auto"
                              fontSize={16}
                              marginTop={0}
                              minHeight={42}
                              borderWidth={2}
                              borderRadius={5}
                              fontWeight={500}
                              paddingLeft="32px"
                              width="100%"
                              fontFamily="Titillium Web"
                              value={values.numVotes}
                              borderColor={Colors.SILVER}
                              color={Colors.GRAY_CHATEAU}
                              disabled
                            />
                          </Flex>

                          <Flex flexDirection="column">
                            <Text
                              w="100%"
                              mr={15}
                              minW={200}
                              fontSize={16}
                              fontWeight={600}
                              color={Colors.LOBLOLLY}
                              fontFamily="Titillium Web"
                            >
                              Select Threshold
                            </Text>
                            <Select
                              options={Array.from(
                                { length: values.numCustodians - values.numVotes + 1 },
                                (_, i) => ({
                                  value: values.numVotes + i,
                                  label: (values.numVotes + i).toString(),
                                })
                              )}
                              value={{
                                value: values.threshold,
                                label: values.threshold.toString(),
                              }}
                              onChange={(selectedOption) => {
                                setFieldValue('threshold', selectedOption.value)
                                setThreshold(selectedOption.value)
                                setErrors({})
                              }}
                              styles={customStyles}
                              placeholder="Select threshold"
                            />
                          </Flex>
                        </>
                      )}

                      {/* ELECTION PERIOD */}
                      {selectedOption.value === 'election_period' && (
                        <>
                          <Flex flexDirection="column" width="100%">
                            <Text
                              w="100%"
                              mr={15}
                              minW={200}
                              fontSize={16}
                              fontWeight={600}
                              color={Colors.LOBLOLLY}
                              fontFamily="Titillium Web"
                            >
                              Election Duration (Days)
                            </Text>
                            <Slider
                              aria-label="election-duration-slider"
                              defaultValue={30}
                              min={7}
                              max={180}
                              step={1}
                              onChange={(val) => {
                                setElectionSliderValue(val)
                                setFieldValue('electionDuration', val)
                                setErrors({})
                              }}
                              value={values.electionDuration}
                            >
                              <SliderMark value={7} {...labelStyles}>
                                7 days
                              </SliderMark>
                              <SliderMark value={90} {...labelStyles}>
                                90 days
                              </SliderMark>
                              <SliderMark value={180} {...labelStyles}>
                                180 days
                              </SliderMark>
                              <SliderMark
                                value={values.electionDuration}
                                textAlign="center"
                                bg="blue.500"
                                color="white"
                                mt="-10"
                                ml="-5"
                                w="12"
                              >
                                {values.electionDuration}
                              </SliderMark>
                              <SliderTrack>
                                <SliderFilledTrack />
                              </SliderTrack>
                              <SliderThumb />
                            </Slider>
                          </Flex>
                        </>
                      )}

                      {/* DESCRIPTION - Common for all proposal types */}
                      {(selectedOption.value === 'transfer_tlm' ||
                        selectedOption.value === 'change_election_configs' ||
                        selectedOption.value === 'dtap_reward' ||
                        selectedOption.value === 'election_period') && (
                        <Flex flexDirection="column">
                          <Text
                            w="100%"
                            mr={15}
                            minW={200}
                            fontSize={16}
                            fontWeight={600}
                            color={Colors.LOBLOLLY}
                            fontFamily="Titillium Web"
                          >
                            Description
                          </Text>
                          <Textarea
                            size="lg"
                            margin="auto"
                            minH="200px"
                            height="200px"
                            name="description"
                            placeholder=""
                            marginTop="10px"
                            fontSize={16}
                            minHeight={42}
                            borderWidth={2}
                            borderRadius={5}
                            fontWeight={500}
                            paddingLeft="32px"
                            style={{ width: '100%' }}
                            fontFamily="Titillium Web"
                            borderColor={Colors.SILVER}
                            textColor={Colors.GRAY_CHATEAU}
                            value={proposalDescription ?? ''}
                            onChange={({ target: { value } }) => {
                              setProposalDescription(value)
                              setErrors({})
                            }}
                          />
                        </Flex>
                      )}

                      {/* SUBMIT BUTTON - Not shown for claim_budget */}
                      {selectedOption.value === 'transfer_tlm' && (
                        <HStack gap={4} pt="0px" display="flex" justifyContent="end">
                          <Button
                            size="sm"
                            variant="helium"
                            onClick={() => createProposal()}
                            disabled={!formReady}
                            leftIcon={
                              <ProposalsIcon
                                style={{ margin: '5px' }}
                                width="20px"
                                height="20px"
                                color={formReady ? Colors.DI_SERRIA : 'grey'}
                              />
                            }
                          >
                            Create New
                          </Button>
                        </HStack>
                      )}
                      {selectedOption.value === 'change_election_configs' && (
                        <HStack gap={4} pt="0px" display="flex" justifyContent="end">
                          <Button
                            size="sm"
                            variant="helium"
                            onClick={() => createConfigsProposal()}
                            isDisabled={
                              proposalTitle.length < 3 || proposalDescription.length === 0
                            }
                            leftIcon={
                              <ProposalsIcon
                                style={{ margin: '5px' }}
                                width="20px"
                                height="20px"
                                color={formReady ? Colors.DI_SERRIA : 'grey'}
                              />
                            }
                          >
                            Change Configs
                          </Button>
                        </HStack>
                      )}
                      {selectedOption.value === 'dtap_reward' && (
                        <HStack gap={4} pt="0px" display="flex" justifyContent="end">
                          <Button
                            size="sm"
                            variant="helium"
                            onClick={() => createDTAPProposal()}
                            isDisabled={
                              proposalTitle.length < 3 || proposalDescription.length === 0
                            }
                            leftIcon={
                              <ProposalsIcon
                                style={{ margin: '5px' }}
                                width="20px"
                                height="20px"
                                color={formReady ? Colors.DI_SERRIA : 'grey'}
                              />
                            }
                          >
                            Create Proposal
                          </Button>
                        </HStack>
                      )}
                      {selectedOption.value === 'election_period' && (
                        <HStack gap={4} pt="0px" display="flex" justifyContent="end">
                          <Button
                            size="sm"
                            variant="helium"
                            onClick={() => createElectionPeriodProposal()}
                            isDisabled={
                              proposalTitle.length < 3 || proposalDescription.length === 0
                            }
                            leftIcon={
                              <ProposalsIcon
                                style={{ margin: '5px' }}
                                width="20px"
                                height="20px"
                                color={formReady ? Colors.DI_SERRIA : 'grey'}
                              />
                            }
                          >
                            Create Proposal
                          </Button>
                        </HStack>
                      )}
                    </Flex>
                  </form>
                )}
              </Formik>
            </Flex>
          </Flex>
        </Flex>

        {/* RIGHT SECTION */}
        <Flex
          p="10px"
          flexDirection="column"
          bg={Colors.BLACK_SOLID_65}
          width={{ base: '99%', xl: 'calc(100% - 20vw)' }}
        >
          {/* TITLE */}
          <Flex wrap="wrap" pt="10px" pl="10px" width="full">
            <Flex alignItems="center" gap={2}>
              <PendingIcon style={{ width: 25, height: 25 }} color={Colors.DI_SERRIA} />
              <Text
                as="span"
                fontSize="20px"
                fontWeight={400}
                whiteSpace="nowrap"
                letterSpacing="0.1em"
                fontFamily="Orbitron"
                color={Colors.GRAY_CHATEAU}
              >
                Proposals Status
              </Text>
            </Flex>
            <Spacer />

            <Flex justifyContent="flex-end" mb="-25px" h={50}>
              {/* <Button
                size="sm"
                variant="primary"
                onClick={() => claimBudget()}
                isDisabled={!isBudgetAvailable}
                leftIcon={<PlanetIcon w="20px" h="20px" color={Colors.SNOW_WHITE} />}
              >
                Claim Budget
              </Button> */}

              {isBudgetPending && (
                <Flex
                  w="210px"
                  pr="20px"
                  height="35px"
                  borderRadius="50px"
                  alignItems="center"
                  justifyContent="center"
                  bg={Colors.ENERGY_YELLOW}
                >
                  <PlanetIcon style={{ margin: '5px' }} width="20px" height="20px" color="black" />
                  <Text fontSize={18} fontWeight={400} fontFamily="Titillium Web" color="black">
                    Budget Pending
                  </Text>
                </Flex>
              )}

              {isBudgetClaimed && (
                <Flex
                  w="210px"
                  pr="20px"
                  height="35px"
                  borderRadius="50px"
                  alignItems="center"
                  justifyContent="center"
                  bg={Colors.SECONDARY_GREEN}
                >
                  <PlanetIcon
                    style={{ margin: '5px' }}
                    width="20px"
                    height="20px"
                    color={Colors.SNOW_WHITE}
                  />
                  <Text
                    fontSize={18}
                    fontWeight={400}
                    fontStyle="normal"
                    fontFamily="Titillium Web"
                    color={Colors.SNOW_WHITE}
                  >
                    Budget Claimed
                  </Text>
                </Flex>
              )}
            </Flex>
          </Flex>

          {/* PROPOSALS TABLE */}
          <ProposalsTableVirtualised />
        </Flex>
      </Flex>
    </>
  )
}
