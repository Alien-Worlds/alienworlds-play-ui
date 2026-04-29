import { FC, useEffect, useState, VFC } from 'react'

import { Button } from '@alien-worlds/uikit'
import { Box, Flex, FormControl, Image, Text, VStack, Link } from '@chakra-ui/react'
import { css, SerializedStyles } from '@emotion/react'
import { InputField, InputFieldLabel } from 'features/onboarding/components/InputField'
import { replace } from 'lodash'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { FormCheckbox } from 'shared/components/FormCheckbox/FormCheckbox'
import { Colors } from 'shared/util/colors'
import { config } from 'shared/util/config'
import { femaleHumanAvatar, maleHumanAvatar } from 'shared/util/nft'
import { useActions, useAppState } from 'store'
import { PagePath } from 'store/main/types'

import { Constants } from '../../../shared/util/constants'

interface PlayerCardProps {
  avatarImageSrc: string
  titleText: string
  detailsText: string
  selected: boolean
}

const PlayerCard: FC<PlayerCardProps> = ({ avatarImageSrc, titleText, detailsText, selected }) => {
  return (
    <Flex
      flexDir="column"
      background={Colors.BLACK_ALPHA_40}
      borderRadius="12"
      w="40"
      h="full"
      flex="0"
      justifyContent="center"
      alignItems="stretch"
      py={0}
      overflow="hidden"
      position="relative"
    >
      {/* rounded gradient border */}
      <Flex
        position="absolute"
        top={0}
        left={0}
        w="full"
        h="full"
        boxSizing="border-box"
        zIndex="0"
        css={{
          ...(selected
            ? {
                borderImage: `${Colors.ONBOARDING_CARD_BORDER_GRADIENT} 1`,
                borderStyle: 'solid',
                borderWidth: '5px',
              }
            : null),
        }}
      ></Flex>

      {/* Card content wrapper */}
      <Flex
        flexDir="column"
        borderRadius="12"
        w="38"
        h="full"
        flex="1 1 auto"
        justifyContent="center"
        alignItems="flex-start"
        py={0}
        overflow="hidden"
        m="1px"
        zIndex="1"
        backgroundColor={Colors.BLACK_ALPHA_40}
        borderWidth={6}
        borderStyle="solid"
        borderColor={Colors.BLACK_SOLID_100}
      >
        {/* Avatar container */}
        <Flex
          maxW="28"
          maxH="28"
          w="fit-content"
          h="fit-content"
          maxHeight="fit-content"
          justifyContent="center"
          alignItems="center"
          p="0"
          m="0 auto"
          borderRadius="100%"
          background={selected === true ? Colors.ONBOARDING_AVATAR_GRADIENT : Colors.DARK_GRAY}
          overflow="hidden"
          _hover={{
            background: Colors.ONBOARDING_AVATAR_GRADIENT,
          }}
          position="relative"
        >
          <Flex
            w="20"
            h="20"
            justifyContent="center"
            alignItems="center"
            m="3"
            borderRadius="100%"
            overflow="hidden"
          >
            <Image src={avatarImageSrc} />
          </Flex>
        </Flex>

        {/* Details container */}
        <Flex flex="1 0 auto" direction="column" w="80%" p={0} mx="auto">
          <Text fontFamily="tlm" fontWeight="bold" fontSize="sm" w="full" my="2">
            {titleText}
          </Text>
          <Text fontFamily="tlm" fontWeight="normal" fontSize="xs" w="full" mb="2">
            {detailsText}
          </Text>
        </Flex>
      </Flex>
    </Flex>
  )
}

const Onboarding: VFC = () => {
  const {
    wax: { setOnboarding, collectEvent },
    main: { logout },
  } = useActions()
  const {
    wax: { onboarding },
  } = useAppState()

  const [isLoading, setIsLoading] = useState(false)
  const { register, control, getValues, formState, setValue, watch } = useForm({
    defaultValues: {
      avatar: 0,
      name: '',
      email: '',
      age: onboarding ?? false,
      terms: onboarding ?? false,
    },
    mode: 'onChange',
  })

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

  const maleAvatarPrefill = {
    type: {
      name: 'Human',
      element: 1,
      styleConfig: {},
    },

    title: {
      name: 'Male Human',
      element: 1,
      styleConfig: {},
    },
    description: {
      name: "Mining on Alien Worlds ain't like mining on Earth, farm boy.",
      element: 1,
      styleConfig: {},
    },
    nftImage: {
      name: maleHumanAvatar,
      elementType: 1,
      styleConfig: {},
    },
  }

  const femaleAvatarPrefill = {
    type: {
      name: 'Human',
      element: 1,
      styleConfig: {},
    },

    title: {
      name: 'Female Human',
      element: 1,
      styleConfig: {},
    },
    description: {
      name: 'Adventure is worthwhile in itself.',
      element: 1,
      styleConfig: {},
    },
    nftImage: {
      name: femaleHumanAvatar,
      elementType: 1,
      styleConfig: {},
    },
  }

  const avatar = watch('avatar', 0)

  const navigate = useNavigate()

  useEffect(() => {
    // select one of the avatars by default
    const oneOrTwo = Math.random() > 0.5 ? 1 : 2
    setValue('avatar', oneOrTwo, { shouldDirty: true })
  }, [])

  // Click Ready button
  const ready = async () => {
    setIsLoading(true)
    setOnboarding({
      avatarId: getValues('avatar'),
      tagId: getValues('name'),
      landId: null,
    })

    collectEvent({ name: Constants.GA_AW_ONBOARDING_AVATAR })

    navigate(PagePath.OnboardingPlanet)
    setIsLoading(false)
  }

  // Use submitted form values when navigating back from Land page during Onboarding
  useEffect(() => {
    if (onboarding) {
      setValue('avatar', onboarding.avatarId, { shouldDirty: true })
      setValue('name', onboarding.tagId, { shouldDirty: true })
      setValue('age', true, { shouldValidate: true })
      setValue('terms', true, { shouldValidate: true })
    }
  }, [])

  return (
    <Flex
      px={{ base: 8, md: 24 }}
      py={8}
      flexDirection="column"
      m={0}
      textAlign="center"
      position="fixed"
      overflowX="hidden"
      overflowY="auto"
      alignItems="center"
      justifyContent="center"
      w="100vw"
      h="100vh"
      color={Colors.MID_ALTO}
      backgroundImage="/images/bg/bg-onboarding.jpg"
      backgroundAttachment="fixed"
      backgroundSize="cover"
      backgroundPosition="top center"
    >
      <Flex
        flexDirection="column"
        flexGrow={1}
        alignItems="center"
        justifyContent="center"
        w={{
          base: 'fit-content',
          md: 'xl',
        }}
        p={{ base: 2, md: 'auto' }}
        mx={{ base: 2, md: 'auto' }}
        fontFamily="tlm"
        borderRadius="16"
        background={Colors.BLACK_ALPHA_80}
      >
        <Image
          src="/images/alienworlds-db-logo_full_color.svg"
          alt="Alien Worlds Logo"
          w="225px"
          mb={4}
        />
        <Text
          fontFamily="orb"
          letterSpacing="wider"
          lineHeight="shorter"
          fontSize={{ base: '2xl', md: '3xl' }}
        >
          Set up Character
        </Text>
        <Text
          fontFamily="tlm"
          fontSize={{ base: 'sm', md: 'lg' }}
          color={Colors.MID_GRAY}
          fontWeight="normal"
          mb={4}
        >
          Discover others as you play
        </Text>

        <Flex direction="column">
          <Controller
            name="avatar"
            control={control}
            defaultValue={1}
            rules={{ required: true }}
            render={() => (
              <Flex
                direction="row"
                alignItems="stretch"
                align="center"
                w="fit-content"
                px="auto"
                mx="auto"
                h="72"
                gap={{ base: 2, md: 4 }}
              >
                <Box
                  onClick={() => setValue('avatar', 1, { shouldDirty: true })}
                  cursor="pointer"
                  mb={6}
                  flex="1 1 0"
                >
                  <PlayerCard
                    avatarImageSrc={maleAvatarPrefill.nftImage.name}
                    titleText={maleAvatarPrefill.type.name}
                    detailsText={maleAvatarPrefill.description.name}
                    selected={getValues('avatar') === 1}
                  />
                </Box>
                <Box
                  onClick={() => setValue('avatar', 2, { shouldDirty: true })}
                  cursor="pointer"
                  mb={6}
                  flex="1 1 0"
                >
                  <PlayerCard
                    avatarImageSrc={femaleAvatarPrefill.nftImage.name}
                    titleText={femaleAvatarPrefill.type.name}
                    detailsText={femaleAvatarPrefill.description.name}
                    selected={getValues('avatar') === 2}
                  />
                </Box>
              </Flex>
            )}
          />

          <VStack align="flex-start" spacing={4}>
            <FormControl id="name">
              <InputFieldLabel padding={0}>
                <Text color={Colors.SNOW_WHITE} fontSize="14" fontWeight="bold" fontFamily="tlm">
                  Username
                </Text>
              </InputFieldLabel>
              <InputField
                maxW={390}
                maxLength={10}
                type="text"
                placeholder="Type here..."
                {...register('name', {
                  pattern: /^[a-zA-Z0-9]+$/i,
                  minLength: 4,
                  maxLength: 10,
                  required: true,
                  onChange: (e) => {
                    setValue('name', replace(e.target.value, /[^a-zA-Z0-9]+/, ''), {
                      shouldDirty: true,
                    })
                  },
                })}
                backgroundColor={Colors.BLACK_SOLID_100}
                borderWidth={1}
                borderRadius={8}
                fontSize="sm"
                fontFamily="tlm"
                h="4"
                w="full"
              />
            </FormControl>

            <FormCheckbox
              name="age"
              {...register('age', {
                validate: { isTrue: (val) => val === true },
              })}
              pl={5}
              css={checkboxStyles}
            >
              <Text fontFamily="tlm" fontSize="12">
                I am 18+ years of age
              </Text>
            </FormCheckbox>
            <FormCheckbox
              name="terms"
              {...register('terms', {
                validate: { isTrue: (val) => val === true },
              })}
              pl={5}
              textAlign="left"
              css={checkboxStyles}
            >
              <Text fontFamily="tlm" fontSize="12">
                I Agree to the{' '}
                <Link
                  href={`${config.AlienWorldsUrl}/terms-and-conditions`}
                  target="_blank"
                  color={Colors.DARK_YELLOW}
                >
                  Terms of Use
                </Link>
              </Text>
            </FormCheckbox>

            <Flex w="full" flexDirection="column" justify={{ base: 'center' }}>
              <Button
                width="100%"
                isLoading={isLoading}
                disabled={!formState.isValid || avatar < 1}
                onClick={ready}
                size="md"
                variant={!formState.isValid || avatar < 1 ? 'tertiary' : 'primary'}
              >
                {!formState.isValid || avatar < 1 ? 'Not ready' : "I'm ready"}
              </Button>
              <Text
                my={4}
                mx="auto"
                fontFamily="tlm"
                color={Colors.GRAY_CHATEAU}
                fontSize="xl"
                fontWeight="bold"
                cursor="pointer"
                _hover={{ textDecoration: 'underline' }}
                onClick={() => {
                  setOnboarding(null)
                  logout()
                }}
              >
                cancel
              </Text>
            </Flex>
          </VStack>
        </Flex>
      </Flex>
    </Flex>
  )
}

export { Onboarding }
