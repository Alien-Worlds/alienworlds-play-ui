import React, { useEffect, useState } from 'react'

import { Button, Dropdown, FormField, FormTextarea, Option } from '@alien-worlds/uikit'
import { useApolloClient } from '@apollo/client'
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Text,
  Flex,
  Box,
  ModalOverlay,
} from '@chakra-ui/react'
import { SerializedStyles, css } from '@emotion/react'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner'
import { Formik } from 'formik'
import { useLores } from 'graphql/hooks/useLoreProposals'
import { LORES_QUERY } from 'graphql/queries/loreProposals'
import { loresResponse } from 'graphql/types'
import { get } from 'lodash'
import { FormCheckbox } from 'shared/components/FormCheckbox'
import { Colors } from 'shared/util/colors'
import { validateEmpty } from 'shared/util/formhelper'
import { useActions, useAppState } from 'store'
import { PullRequest } from 'store/main/types'
import * as Yup from 'yup'

const checkboxStyles: SerializedStyles = css`
  box-shadow: none;

  .chakra-checkbox__control {
    border-color: ${Colors.SNOW_WHITE};
    background-color: ${Colors.BLACK_SOLID_100};
    border-width: 1px;
    border-radius: 4px;
    width: 20px;
    height: 20px;
  }

  .chakra-checkbox {
    align-items: flex-start;
  }

  .chakra-checkbox__label {
    font-size: 20px;
  }

  [data-checked] {
    color: ${Colors.SNOW_WHITE};
  }

  [data-checked].chakra-checkbox__control {
    background-color: ${Colors.WEB_ORANGE};
    color: ${Colors.SNOW_WHITE};
    fill: ${Colors.SNOW_WHITE};
    border-color: ${Colors.WEB_ORANGE};
  }

  [data-focus] {
    box-shadow: none;
  }
`

const SubmitLoreModal = () => {
  const {
    modal: { secondaryModals },
    main: { lorePullRequests },
  } = useAppState()
  const client = useApolloClient()
  const {
    modal: { setSecondaryModalActive },
    main: { getLorePullRequestCommit },
    wax: { trySubmitLore },
  } = useActions()
  const { lores, loading: loadingLores }: { lores: loresResponse; loading: boolean } = useLores()
  const globals = lores?.globals
  const handleClose = () => {
    setSecondaryModalActive({ modalName: 'SubmitLoreModal', value: false })
  }
  const validationSchema = Yup.object({
    githubUrl: Yup.string().required('Github url is required').nullable(),
    title: Yup.string().required('Title is required').nullable(),
    description: Yup.string().required('Description is required').nullable(),
  })

  const [options, setOptions] = useState<Option[]>([])
  const [urlError, setUrlError] = useState(false)
  useEffect(() => {
    setOptions(
      lorePullRequests.map((item: PullRequest) => ({
        value: item.html_url,
        label: item.html_url,
        number: item.number,
        title: item.title,
      }))
    )
  }, [lorePullRequests])

  if (loadingLores) return <LoadingSpinner />
  return (
    <Modal
      size="md"
      isOpen={secondaryModals.SubmitLoreModal}
      onClose={() => handleClose()}
      isCentered
    >
      <ModalOverlay />
      <ModalContent
        background={Colors.BLACK_SOLID_90}
        justifyContent="center"
        style={{
          border: 'double 1px transparent',

          borderRadius: '20px',
          backgroundImage:
            'linear-gradient(#100F10, #100F10), linear-gradient(to bottom, #9C33B6, #4F60BC,#4657A5, #009BD4)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'content-box, border-box',
        }}
      >
        <ModalCloseButton />
        <ModalBody padding="40px">
          <Flex flexDirection="column" gap={2}>
            <Text fontFamily="tlm" fontSize="24px" fontWeight={600}>
              Submit LORE
            </Text>
            <Text fontFamily="tlm" fontSize="16px" fontWeight={400} color={Colors.JUMBO}>
              The submission for the Lore Proposal will cost a 200 TLM fee
            </Text>
            <Formik
              initialValues={{
                githubUrl: '',
                title: '',
                description: '',
                termAndConditions: false,
              }}
              validationSchema={validationSchema}
              onSubmit={async ({ title, githubUrl, description, termAndConditions }) => {
                if (githubUrl.length > 0 && termAndConditions) {
                  await trySubmitLore({
                    title,
                    description: description,
                    url: githubUrl,
                    type: '',
                    fee: globals.fee,
                  })
                  await client.refetchQueries({ include: [LORES_QUERY] })
                  setUrlError(false)
                } else {
                  setUrlError(true)
                }
              }}
            >
              {({ handleSubmit, setFieldValue, values }) => (
                <form onSubmit={handleSubmit}>
                  <Flex
                    direction={{ base: 'column', md: 'row' }}
                    flexWrap="wrap"
                    w={{ base: 'full', md: 'auto' }}
                    gap={8}
                  >
                    <Flex direction="column" width="100%" gap={2} mt={4}>
                      <Box>
                        <Text fontFamily="Titillium Web" fontSize="14px" mb="8px" fontWeight={700}>
                          GitHub Pull Request URL
                        </Text>
                        <Dropdown
                          variant="modern"
                          options={options}
                          placeholder="Github Pull Request URL"
                          size="md"
                          onChange={async (opt: Option) => {
                            setFieldValue(
                              'description',
                              await getLorePullRequestCommit(get(opt, 'number'))
                            )

                            setFieldValue('title', get(opt, 'title'))
                            setFieldValue('githubUrl', opt.value)
                          }}
                        />

                        {urlError && (
                          <Text
                            fontFamily="Titillium Web"
                            color={Colors.RADICAL_RED}
                            fontSize="14px"
                            mb="8px"
                            fontWeight={700}
                          >
                            Github Pull Request URL is required
                          </Text>
                        )}
                      </Box>
                      <Box>
                        <Text fontFamily="Titillium Web" fontSize="14px" fontWeight={700}>
                          Title
                        </Text>
                        <FormField
                          size="md"
                          name="title"
                          minWidth="50px"
                          width="100%"
                          height="48px"
                          borderWidth="1px"
                          paddingInline={0}
                          borderRadius="8px"
                          textAlign="center"
                          placeholder="Type here..."
                          color={Colors.SNOW_WHITE}
                          fontFamily="Titillium Web"
                          borderColor={Colors.MID_GRAY}
                          backgroundColor={Colors.BLACK_ALPHA_50}
                          validate={() => validateEmpty(values.title)}
                        />
                      </Box>
                      <Flex flexDirection="column" width="100%" gap={2}>
                        <Text fontFamily="Titillium Web" fontSize="14px" fontWeight={700}>
                          Description
                        </Text>
                        <FormTextarea
                          name="description"
                          isFullWidth
                          placeholder="Enter a description..."
                          validate={() => validateEmpty(values.description)}
                        />
                      </Flex>

                      <FormCheckbox
                        name="termAndConditions"
                        checked={values.termAndConditions}
                        css={checkboxStyles}
                        onChange={() => {
                          setFieldValue('termAndConditions', !values.termAndConditions)
                        }}
                        alignItems="flex-start"
                      >
                        <Text fontFamily="tlm" fontSize="12">
                          By clicking Submit Lore you acknowledge, agree and warrant that: (a) you
                          are over 18 years of age (b) your Proposal does not infringe the
                          intellectual property rights, privacy rights, publicity rights, or other
                          legal rights of any third party (c) In consideration of and upon your
                          Proposal being incorporated into the Alien Worlds Lore, all the right,
                          title and interest to the Proposal and content therein, whether in words,
                          images, designs, videos etc., shall be and stand as irrevocably assigned
                          to Dacoco GmbH.
                        </Text>
                      </FormCheckbox>
                    </Flex>

                    <Button
                      size="lg"
                      type="submit"
                      fontSize={16}
                      variant="primary"
                      borderRadius="15px"
                      width="100%"
                      isDisabled={
                        values.description === '' ||
                        values.title === '' ||
                        values.githubUrl === '' ||
                        values.termAndConditions === false
                      }
                    >
                      Submit Lore
                    </Button>
                  </Flex>
                </form>
              )}
            </Formik>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
  return null
}

export { SubmitLoreModal }
