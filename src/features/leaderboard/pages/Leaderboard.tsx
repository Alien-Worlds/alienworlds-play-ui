import { useEffect, useState } from 'react'

import { CrossIcon, Search2Icon } from '@alien-worlds/icons'
import { Dropdown, Paginator } from '@alien-worlds/uikit'
import {
  Box,
  Flex,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Text,
} from '@chakra-ui/react'
import { LeaderBoardTable } from 'features/leaderboard/components/LeaderBoardTable/LeaderBoardTable'
import { LeaderboardTimeSwitch } from 'features/leaderboard/components/LeaderboardTimeSwitch/LeaderboardTimeSwitch'
import { ReverseSortingFilter } from 'features/leaderboard/components/ReverseSortingFilter'
import {
  LAYOUT_BREAKPOINT,
  LeaderboardDefaultLimit,
  LeaderboardFilter,
  LeaderboardSortByOptions,
  LeaderboardSortOrder,
  LeaderboardResponse,
  LeaderboardItem,
} from 'features/leaderboard/types/leaderboardTypes'
import {
  useLeaderboardFindQuery,
  useLeaderboardListQuery,
} from 'features/leaderboard/utils/leaderboardQueries'
import { MiningSelect } from 'features/mining/components/MiningSelect/MiningSelect'
import { MiningTabPanelMotion, MiningTabs } from 'features/mining/components/MiningTabs/MiningTabs'
import { isEmpty, map, toLower } from 'lodash'
import { useParams } from 'react-router'
import { useNavigate } from 'react-router-dom'
import { Colors } from 'shared/util/colors'
import { useScreenSize } from 'shared/util/hooks'
import { getNftImage } from 'shared/util/nft'
import { useAppState, useEffects } from 'store'
import { PagePath } from 'store/main/types'
import { WaxPlayer } from 'store/wax/types'

export const Leaderboard = () => {
  const {
    wax: {
      api: { getPlayer },
    },
    atomic: {
      api: { getAssetById },
    },
  } = useEffects()

  const {
    main: { isCompactSidebar },
  } = useAppState()
  const navigate = useNavigate()
  const { isMobile, isNotDesktop } = useScreenSize()
  const [gridData, setGridData] = useState([])
  const [offset, setOffset] = useState<number>(0)
  const { id: walletIdParam } = useParams<{ id: string }>()
  const [limit] = useState<number>(LeaderboardDefaultLimit)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [searchValue, setSearchValue] = useState<string>('')
  const [isSortReversed, setIsSortReversed] = useState<boolean>(false)
  const [sort, setSort] = useState<string>(LeaderboardSortByOptions[0].value)
  const [timeframe, setTimeframe] = useState<LeaderboardFilter | string>(LeaderboardFilter.DAILY)
  const [isLoadingNewPage, setIsLoadingNewPage] = useState<boolean>(false)

  const { data: searchData } = useLeaderboardFindQuery({
    timeframe,
    sort,
    user: searchValue,
  })

  const { data: listData } = useLeaderboardListQuery({
    timeframe,
    sort,
    offset,
    limit,
    order: isSortReversed ? LeaderboardSortOrder.ASC : LeaderboardSortOrder.DESC,
  })

  const mapAvatarAndTag = (searchDataRes: LeaderboardResponse) => {
    let mappedResults: LeaderboardItem[] = []
    if (!searchDataRes?.results || searchDataRes?.results.length === 0) {
      setGridData([])
    } else {
      map(searchDataRes?.results, async (r) => {
        const data: WaxPlayer = await getPlayer(r?.wallet_id)
        const imageAvatar: string = getNftImage(await getAssetById(data?.avatar))
        r.tag = data?.tag ?? null
        r.avatar = imageAvatar ?? null

        mappedResults.push(r)

        if (mappedResults?.length === searchDataRes?.results?.length) {
          mappedResults = mappedResults.sort((a, b) => a.position - b.position)

          setGridData(mappedResults)
          setIsLoadingNewPage(false)
        }
      })
    }
  }

  useEffect(() => {
    if (!isEmpty(searchValue)) {
      mapAvatarAndTag(searchData)
    } else {
      if (listData?.results) {
        mapAvatarAndTag(listData)
      }
    }
  }, [listData?.results, searchData?.results, searchValue])

  useEffect(() => {
    if (!isEmpty(searchValue)) {
      if (timeframe !== LeaderboardFilter.MONTHLY) {
        setTimeframe(LeaderboardFilter.MONTHLY)
      }
    }
  }, [searchValue])

  useEffect(() => {
    if (walletIdParam) {
      setTimeframe(LeaderboardFilter.MONTHLY)
      setSearchValue(walletIdParam)
    }
  }, [walletIdParam])

  return (
    <Flex
      direction="column"
      alignItems="start"
      w={{ base: 'full', md: 'auto' }}
      px={{ base: '18px', md: 6 }}
    >
      <Box w="full" mb={5} display={{ base: 'block', md: 'none' }}>
        <MiningSelect />
      </Box>
      <Box textAlign="start" mb={5} display={{ base: 'none', md: 'block' }}>
        <MiningTabs />
      </Box>

      <MiningTabPanelMotion>
        <Flex
          direction="column"
          w="full"
          m="0"
          h="fit-content"
          p="0"
          px={{ base: '10px', md: '0px' }}
        >
          {/* TITLE + SORT BY */}
          <Flex
            position="relative"
            direction={{
              base: 'column',
              [LAYOUT_BREAKPOINT]: 'row',
            }}
            w={{ base: 'full' }}
            justifyContent={{ base: 'flex-start', md: 'space-between' }}
            alignItems={{ base: 'center' }}
            gap={{ base: 5, [LAYOUT_BREAKPOINT]: 4 }}
            mb={{ base: '10px', xl: 0 }}
            maxWidth={{
              base: 'full',
              [LAYOUT_BREAKPOINT]: isCompactSidebar ? 'calc(100vw - 134px)' : 'calc(100vw - 384px)',
            }}
            flexWrap={{
              base: 'nowrap',
              [LAYOUT_BREAKPOINT]: 'wrap',
            }}
          >
            <Text
              as="h2"
              pt="10px"
              fontFamily="orb"
              display={{ base: 'none', md: 'initial' }}
              fontSize={{ base: '24px', md: '3xl' }}
              color="white"
              fontWeight="normal"
            >
              Mining Leaderboard
            </Text>

            {/* SORTING */}
            <Flex
              order={{ base: 1, [LAYOUT_BREAKPOINT]: 3 }}
              flexDirection="row"
              gap={3}
              w="100%"
              mb={{ base: '0', [LAYOUT_BREAKPOINT]: '-55px' }}
              alignItems={{ base: 'flex-start', [LAYOUT_BREAKPOINT]: 'center' }}
              justifyContent={{ base: 'flex-start', sm: 'space-between', lg: 'end' }}
            >
              <Flex
                gap={3}
                width={{ base: '100%', md: 'fit-content' }}
                direction={{ base: 'column', md: 'row' }}
              >
                <Text minW="50px" color={Colors.SNOW_WHITE} my="auto" mr={{ base: 'auto', xl: 0 }}>
                  Sort by
                </Text>
                <Dropdown
                  defaultValue={LeaderboardSortByOptions[0]}
                  options={LeaderboardSortByOptions}
                  variant="simple"
                  onChange={(props: any) => setSort(props.value)}
                  size="md"
                  styles={{
                    container: () => {
                      return {
                        width: isMobile ? '100%' : '175px',
                        cursor: 'pointer',
                        textAlign: 'start',
                      }
                    },
                    dropdownIndicator: () => {
                      return {
                        right: 0,
                        cursor: 'pointer',
                      }
                    },
                    input: () => {
                      return {
                        cursor: 'pointer',
                      }
                    },
                    menu: () => {
                      return {
                        width: '100%',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }
                    },
                    option: () => {
                      return {
                        cursor: 'pointer',
                      }
                    },
                  }}
                />
              </Flex>

              {/* A-Z */}
              <Box
                p={1}
                position={{ base: 'absolute', sm: 'initial' }}
                right="0px"
                top={{ base: '-5px', sm: '55px' }}
              >
                <ReverseSortingFilter onToggle={(reversed) => setIsSortReversed(reversed)} />
              </Box>
            </Flex>
          </Flex>

          {/* GRID */}
          <Flex direction="column" gap={{ base: '10px', md: 0 }}>
            {/* ACCOUNT SEARCH */}
            <Flex alignItems="center" justifyContent="center" w="full" px={2}>
              <InputGroup w={{ base: '100%', sm: '250px' }}>
                {isEmpty(searchValue) ? (
                  <InputLeftElement pointerEvents="none" m={1} mt="10px">
                    <Search2Icon width="18px" height="18px" color={Colors.SECONDARY_GRAY} />
                  </InputLeftElement>
                ) : (
                  <InputRightElement
                    m={1}
                    cursor="pointer"
                    mt="10px"
                    onClick={() => {
                      setSearchValue('')
                      navigate(`${PagePath.MiningLeaderboard}`)
                    }}
                  >
                    <CrossIcon color={Colors.SECONDARY_GRAY} w={20} h={20} />
                  </InputRightElement>
                )}

                <Input
                  size="md"
                  name="name"
                  margin="auto"
                  type="string"
                  placeholder="WAM Account"
                  pl={10}
                  mt={2}
                  fontSize={16}
                  minWidth={120}
                  minHeight={42}
                  borderWidth="2px"
                  fontWeight={700}
                  fontFamily="Titillium Web"
                  value={searchValue ?? ''}
                  sx={{
                    '::placeholder': {
                      color: Colors.SECONDARY_GRAY,
                      opacity: 1,
                    },
                  }}
                  _focus={{
                    borderColor: Colors.DI_SERRIA,
                  }}
                  _hover={{
                    borderColor: Colors.DI_SERRIA,
                  }}
                  borderColor={Colors.SECONDARY_GRAY}
                  borderRadius="full"
                  textColor={Colors.SECONDARY_GRAY}
                  onChange={({ target: { value } }) => {
                    setSearchValue(toLower(value))
                  }}
                  autoComplete="off"
                />
              </InputGroup>
            </Flex>

            {/* TIME RANGE SELECTOR */}
            <LeaderboardTimeSwitch
              timeRange={timeframe}
              onChange={(timeRange) => setTimeframe(timeRange)}
            />
            {/* TABLE + PAGINATOR */}
            <Flex
              m={0}
              p={0}
              w="full"
              flexDirection="column"
              justifyContent="center"
              alignItems="flex-start"
            >
              {isNotDesktop && (
                <Flex
                  w="full"
                  alignItems="center"
                  justifyContent="center"
                  opacity={searchValue?.length > 0 ? 0.2 : 1}
                  cursor={searchValue?.length > 0 ? 'not-allowed' : 'default'}
                >
                  <Paginator
                    limit={limit}
                    displayedPagesNum={5}
                    page={currentPage || 1}
                    total={listData?.total || 0}
                    onPageSelected={(p) => {
                      if (searchValue?.length > 0) {
                        return
                      }
                      setIsLoadingNewPage(true)
                      setCurrentPage(p)
                      setOffset((p - 1) * limit)
                    }}
                  />
                </Flex>
              )}
              <LeaderBoardTable
                items={gridData}
                searchValue={searchValue}
                isLoadingNewPage={isLoadingNewPage}
              />

              <Flex
                w="full"
                alignItems="center"
                justifyContent="center"
                opacity={isNotDesktop && searchValue?.length > 0 ? 0.2 : 1}
                mt={!isEmpty(searchValue) || gridData?.length === 0 ? '0px' : 0}
                cursor={isNotDesktop && searchValue?.length > 0 ? 'not-allowed' : 'default'}
              >
                <Paginator
                  limit={limit}
                  displayedPagesNum={5}
                  page={currentPage || 1}
                  total={listData?.total || 0}
                  onPageSelected={(p) => {
                    setIsLoadingNewPage(true)
                    setCurrentPage(p)
                    setOffset((p - 1) * limit)
                    if (isNotDesktop) {
                      window.scrollTo({ top: isMobile ? 540 : 450, behavior: 'smooth' })
                    }
                  }}
                />
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      </MiningTabPanelMotion>
    </Flex>
  )
}
