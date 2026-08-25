import { useEffect, useState } from 'react'

import { AlienWorldsIcon, ArenaIcon } from '@alien-worlds/icons'
import { BUTTON_VARIANT } from '@alien-worlds/uikit'
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react'
import { ArenaItem } from 'features/arena/components/ArenaItem'
import { ArenaSelect } from 'features/arena/components/ArenaSelect'
import { useArenaPortal, useArenaCategories } from 'features/arena/hooks/useArenaPortal'
import { filter, get, includes, map, some, toLower } from 'lodash'
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
    arena: { showArenaPortalPage },
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
    <div className="flex w-full flex-col items-center px-[18px] sm:px-8">
      <div className="flex w-full flex-col-reverse gap-5 pb-5 text-left md:flex-row md:pb-8">
        <div className="flex w-full items-center justify-between">
          <div className="hidden gap-[30px] md:flex">
            <div className="flex flex-col items-center justify-start gap-[15px]">
              <AlienWorldsIcon width="130px" height="45px" style={{ marginBottom: -20 }} />
              <p className="mt-[19px] font-orb text-sm font-medium tracking-[0.2em]">COMMUNITY</p>
            </div>
            <div className="flex flex-col gap-[5px]">
              <div className="flex items-center gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
                  <ArenaIcon boxSize={24} color="black" />
                </div>
                <p className="font-orb text-3xl">Arena Portal</p>
              </div>

              <p className="px-[10px] font-tlm text-[rgba(166,168,170,1)] md:px-0">
                Welcome to the Arena - Your Hub for Alien Worlds Community Projects. Let's Explore &
                Play!
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 md:hidden">
            <div className="flex w-full justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                  <ArenaIcon boxSize="20px" color="black" />
                </div>
                <p className="font-orb text-2xl">Arena Portal</p>
              </div>

              <div className="flex flex-col items-center justify-start">
                <AlienWorldsIcon width="64px" />
                <p className="font-orb text-[7px] font-medium tracking-[0.2em]">COMMUNITY</p>
              </div>
            </div>
            <p className="text-sm text-[rgba(166,168,170,1)] md:text-base">
              Welcome to the Arena - Your Hub for Alien Worlds Community Projects. Let's Explore &
              Play!
            </p>
          </div>
        </div>
      </div>
      <div className="flex w-full flex-col gap-8 md:hidden">
        <ArenaSelect options={selectOptions} onChange={(option) => setSelectedOption(option)} />
        <div className="flex w-full flex-col items-center justify-items-center gap-3">
          <div className="grid w-full grid-cols-3 justify-items-center gap-5">
            {map(filteredArenaItems, (item, index) => {
              return <ArenaItem data={item.attributes} key={arenaItemId + index} />
            })}
          </div>
        </div>
      </div>
      <div className="hidden w-full mb-8 justify-center md:flex lg:justify-start">
        <TabGroup className="flex w-4/5 min-w-[80%] flex-col lg:min-w-0">
          <div className="flex w-full flex-col items-center justify-between gap-4 lg:flex-row">
            <TabList className="flex min-w-[80%] max-w-max items-center rounded-[20px] bg-[rgb(17,17,17)]">
              {map(tabOptions, (tab, index) => (
                <Tab
                  key={styledTabId + index}
                  className={({ selected }) =>
                    `h-12 min-w-full font-orb text-sm font-bold tracking-[1.16px] outline-none lg:min-w-max lg:w-[212px] ${
                      selected ? 'rounded-full bg-[rgb(0,186,255)] text-white' : 'text-white'
                    }`
                  }
                >
                  {tab}
                </Tab>
              ))}
            </TabList>
          </div>
          <TabPanels className="mt-8 p-0">
            {tabOptions.map((tab, index) => {
              let arenaFilteredItems: ArenaPortalItemResponseType[] = arenaItems
              if (tab !== 'All') arenaFilteredItems = findArenaItemsByCategory(arenaItems, tab)

              return (
                <TabPanel className="w-full p-0" key={tabPanelId + index}>
                  <div className="flex w-full flex-col gap-12">
                    <div className="grid w-full grid-cols-[repeat(auto-fill,minmax(140px,1fr))] justify-items-center gap-x-10 gap-y-6">
                      {map(arenaFilteredItems, (item, index) => {
                        return <ArenaItem data={item.attributes} key={arenaItemId + index} />
                      })}
                    </div>
                  </div>
                </TabPanel>
              )
            })}
          </TabPanels>
        </TabGroup>
      </div>
    </div>
  )
}
