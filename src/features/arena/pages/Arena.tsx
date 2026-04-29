import { useEffect, useState } from 'react'

import { AlienWorldsIcon, ArenaIcon } from '@alien-worlds/icons'
import { BUTTON_VARIANT } from '@alien-worlds/uikit'
import {
  Flex,
  Grid,
  Hide,
  TabPanel,
  TabPanels,
  Text,
  VStack,
  useBreakpointValue,
} from '@chakra-ui/react'
import { TabList, Tab, Tabs } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { ArenaItem } from 'features/arena/components/ArenaItem'
import { ArenaSelect } from 'features/arena/components/ArenaSelect'
import { useArenaPortal, useArenaCategories } from 'features/arena/hooks/useArenaPortal'
import { filter, get, includes, map, some, toLower } from 'lodash'
import { Colors } from 'shared/util/colors'
import { useActions } from 'store'
import { v4 as uuidv4 } from 'uuid'

export type ArenaPortalItemResponseType = {
  id: number
  attributes: ArenaPortalItemType
}
export type ArenaCategoriesResponseType = {
  id: number
  attributes: ArenaCategoriesAttributesType
}

export type ArenaCategoriesAttributesType = {
  name: string
  description: string
  createdAt: string
  updatedAt: string
  publishedAt: string
}
export type ArenaPortalButtonType = {
  label: string
  url: string
  style: BUTTON_VARIANT
  trackingID: string
}

export type ArenaPortalImageType = {
  data: {
    id: number
    attributes: {
      url: string
    }
  }
}

export type ArenaPortalSocialLinkType = {
  id: number
  name: string
  url: string
}

export type ArenaPortalItemType = {
  url: string
  description: string
  creator: string
  platform: string
  releaseDate?: string
  video?: string
  version?: string
  image: ArenaPortalImageType
  socialLinks: ArenaPortalSocialLinkType[]
  title: string
  creatorUrl?: string
  action: ArenaPortalButtonType
  sashlabel: string
  sortOrder: number
  categories: arenaCategoriesType
  isAlienWorldsApp: boolean
}

type ArenaCategoryType = {
  id: number
  attributes: {
    name: string
    description: string
    createdAt: string // ISO 8601 date string
    updatedAt: string // ISO 8601 date string
    publishedAt: string // ISO 8601 date string
  }
}

type arenaCategoriesType = {
  data: ArenaCategoryType[]
}

export type ArenaPortalDevItemType = {
  url: string
  image: string
  title: string
  description: string
}

const StyledTab = styled(Tab)({
  width: '212px',
  height: '48px',
  backgroundColor: Colors.COD_GRAY,
  fontFamily: 'Orbitron',
  letterSpacing: '1.16px',
  fontSize: '14px',
  fontWeight: '700',
  color: Colors.SNOW_WHITE,
})

function findArenaItemsByCategory(
  portalItems: ArenaPortalItemResponseType[],
  searchString: string
): ArenaPortalItemResponseType[] {
  return filter(portalItems, (portalItem) => {
    const categories = get(portalItem, 'attributes.categories.data', [])
    return some(categories, (category) =>
      includes(toLower(get(category, 'attributes.name', '')), toLower(searchString))
    )
  }) as ArenaPortalItemResponseType[]
}

export const Arena = () => {
  // const navigate = useNavigate()
  const { data: arenaItems } = useArenaPortal()
  const { data: arenaCategories } = useArenaCategories()
  const tabOptions = map(arenaCategories, 'attributes.name')
  const [selectedOption, setSelectedOption] = useState('All')
  const [filteredArenaItems, setFilteredArenaItems] = useState<ArenaPortalItemResponseType[]>([])
  tabOptions.unshift('All')
  const [arenaItemId] = useState(() => uuidv4())
  const [styledTabId] = useState(() => uuidv4())
  const [tabPanelId] = useState(() => uuidv4())
  const oreintationValue: 'horizontal' | 'vertical' = useBreakpointValue({
    base: 'vertical',
    lg: 'horizontal',
  })
  const selectOptions = map(arenaCategories, (category) => ({
    value: category.attributes.name,
    label: category.attributes.name,
  }))
  const allOption = {
    value: 'All',
    label: 'All',
  }
  selectOptions.unshift(allOption)

  const {
    main: { showArenaPortalPage },
  } = useActions()

  useEffect(() => {
    if (!arenaItems) return

    if (selectedOption === 'All') {
      setFilteredArenaItems(arenaItems)
    } else {
      const filteredItems = findArenaItemsByCategory(arenaItems, selectedOption)
      setFilteredArenaItems(filteredItems)
    }
  }, [selectedOption, arenaItems])

  useEffect(() => {
    showArenaPortalPage()
  }, [])

  return (
    <VStack px={{ base: '18px', sm: 8 }}>
      <Flex
        pb={{ base: '20px', md: 8 }}
        w="full"
        gap="20px"
        textAlign="start"
        direction={{
          base: 'column-reverse',
          md: 'row',
        }}
      >
        <Flex width="100%" justifyContent="space-between" alignItems="center">
          <Hide below="md">
            {' '}
            <Flex gap="30px">
              <Flex direction="column" gap="15px" alignItems="center" justifyContent="start">
                <AlienWorldsIcon width="130px" height="45px" style={{ marginBottom: -20 }} />
                <Text fontFamily="orb" fontSize={14} letterSpacing="0.2em" fontWeight={500} mt={19}>
                  COMMUNITY
                </Text>
              </Flex>
              <Flex direction="column" gap="5px">
                <Flex alignItems="center" gap={4}>
                  <Flex
                    width={10}
                    height={10}
                    borderRadius="full"
                    justifyContent="center"
                    alignItems="center"
                    bg={Colors.SNOW_WHITE}
                  >
                    <ArenaIcon boxSize={24} color="black" />
                  </Flex>
                  <Text fontFamily="orb" fontSize="3xl">
                    Arena Portal
                  </Text>
                </Flex>

                <Text fontFamily="tlm" color={Colors.GRAY_CHATEAU} px={{ base: '10px', md: 0 }}>
                  Welcome to the Arena - Your Hub for Alien Worlds Community Projects. Let's Explore
                  & Play!
                </Text>
              </Flex>
            </Flex>
          </Hide>
          <Hide above="md">
            <Flex flexDirection="column" gap={2}>
              <Flex justifyContent="space-between" width="100%">
                <Flex alignItems="center" gap={4}>
                  <Flex
                    width={8}
                    height={8}
                    borderRadius="full"
                    justifyContent="center"
                    alignItems="center"
                    bg={Colors.SNOW_WHITE}
                  >
                    <ArenaIcon boxSize="20px" color="black" />
                  </Flex>
                  <Text fontFamily="orb" fontSize="24px">
                    Arena Portal
                  </Text>
                </Flex>

                <Flex direction="column" alignItems="center" justifyContent="start">
                  <AlienWorldsIcon width="64px" />
                  <Text fontFamily="orb" fontSize="7px" letterSpacing="0.2em" fontWeight={500}>
                    COMMUNITY
                  </Text>
                </Flex>
              </Flex>
              <Text fontSize={{ base: '14px', md: '16px' }} color={Colors.GRAY_CHATEAU}>
                Welcome to the Arena - Your Hub for Alien Worlds Community Projects. Let's Explore &
                Play!
              </Text>
            </Flex>
          </Hide>
        </Flex>
      </Flex>
      <Hide above="md">
        <Flex direction="column" width="100%" gap={8}>
          <ArenaSelect options={selectOptions} onChange={(option) => setSelectedOption(option)} />
          <Flex width="100%" direction="column" gap={3} alignItems="center" justifyItems="center">
            <Grid
              width="100%"
              gridTemplateColumns={{
                base: 'repeat(3,1fr)',

                sm: 'repeat(3,1fr)',
                md: 'repeat(3,1fr)',
              }}
              gap="20px"
              justifyItems="center"
            >
              {map(filteredArenaItems, (item, index) => {
                return <ArenaItem data={item.attributes} key={arenaItemId + index} />
              })}
            </Grid>
          </Flex>
        </Flex>
      </Hide>
      <Hide below="md">
        {' '}
        <Flex width="100%" mb={8} justifyContent={{ md: 'center', lg: 'start' }}>
          <Tabs
            variant="soft-rounded"
            width="80%"
            minW={{ base: '80%', lg: 'auto' }}
            flexDirection="column"
            orientation={oreintationValue}
          >
            <Flex
              width="100%"
              justifyContent="space-between"
              flexDirection={{ base: 'column', lg: 'row' }}
              gap={4}
              alignItems="center"
            >
              <TabList
                backgroundColor={Colors.COD_GRAY}
                borderRadius="20px"
                minW={{ base: '80%', lg: 'max-content' }}
                alignItems="center"
                maxW="max-content"
              >
                {map(tabOptions, (tab, index) => (
                  <StyledTab
                    key={styledTabId + index}
                    minW={{ base: '100%', lg: 'max-content' }}
                    _selected={{ color: Colors.SNOW_WHITE, bg: Colors.DODGE_BLUE }}
                  >
                    {tab}
                  </StyledTab>
                ))}
              </TabList>
            </Flex>
            <TabPanels mt={8} padding={0}>
              {tabOptions.map((tab, index) => {
                let arenaFilteredItems: ArenaPortalItemResponseType[] = arenaItems
                if (tab !== 'All') arenaFilteredItems = findArenaItemsByCategory(arenaItems, tab)

                return (
                  <TabPanel padding={0} width="100%" key={tabPanelId + index}>
                    <Flex width="100%" direction="column" gap={12}>
                      <Grid
                        width="100%"
                        gridTemplateColumns={{
                          base: 'repeat(3,1fr)',

                          sm: 'repeat(3,1fr)',
                          md: 'repeat(4,1fr)',
                          lg: 'repeat(4,1fr)',
                          xl: 'repeat(6,1fr)',
                        }}
                        gap={16}
                      >
                        {map(arenaFilteredItems, (item, index) => {
                          return <ArenaItem data={item.attributes} key={arenaItemId + index} />
                        })}
                      </Grid>
                    </Flex>
                  </TabPanel>
                )
              })}
            </TabPanels>
          </Tabs>
        </Flex>
      </Hide>
    </VStack>
  )
}
