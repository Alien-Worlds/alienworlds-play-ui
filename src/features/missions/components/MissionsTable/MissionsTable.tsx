import { useEffect, useMemo, useState } from 'react'

import { BSCIcon, MissionCraftIcon, DropDownIcon } from '@alien-worlds/icons'
import {
  Box,
  chakra,
  Flex,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useMediaQuery,
} from '@chakra-ui/react'
import { ClaimRewards } from 'features/missions/components/ClaimRewards/ClaimRewards'
import { MissionInfo } from 'features/missions/components/MissionInfo'
import { MissionTimer } from 'features/missions/components/MissionTimer/MissionTimer'
import { useMissionsStore } from 'features/missions/store/missionsStore'
import { Mission, MissionStatus, SortBy } from 'features/missions/types/missionsTypes'
import {
  MissionTypeIcon,
  getMissionReward,
  getMissionRarityIcon,
  getMissionSpacecrafts,
} from 'features/missions/utils/missionHelpers'
import { motion } from 'framer-motion'
import { map } from 'lodash'
import InfiniteScroll from 'react-infinite-scroll-component'
import { useNavigate } from 'react-router-dom'
import { AppModal } from 'shared/layouts'
import { Colors } from 'shared/util/colors'
import { formatNumber } from 'shared/util/numbers'
import { PagePath } from 'store/main/types'

const MotionTr = motion(Tr)
const MotionTbody = motion(Tbody)

const SortByTh = ({ sortBy, width }) => {
  const setMissionsFilter = useMissionsStore((state) => state.setMissionsFilter)
  const missionsFilter = useMissionsStore((state) => state.missionsFilter)

  const onSelectSortBy = (value: SortBy) => {
    if (value === missionsFilter.sortBy) {
      setMissionsFilter({ ...missionsFilter, reversed: !missionsFilter?.reversed })
      return
    }

    setMissionsFilter({ ...missionsFilter, sortBy: value })
  }

  if (!missionsFilter) return <></>

  return (
    <Th onClick={() => onSelectSortBy(sortBy)} width={width} padding={{ base: '10px', lg: '0px' }}>
      <chakra.span display="flex">
        <Text
          fontWeight="bold"
          fontFamily="Titillium Web"
          color={missionsFilter.sortBy === sortBy ? 'white' : '#959595'}
          textTransform="capitalize"
          fontSize="sm"
          mr={2}
          mb={4}
          pl={10}
        >
          {SortBy[sortBy]}
        </Text>
        {missionsFilter.sortBy === sortBy && (
          <>
            {missionsFilter.reversed ? (
              <motion.div
                initial={{ rotate: '180deg' }}
                animate={{ rotate: '0deg' }}
                exit={{
                  rotate: '180deg',
                  transition: { duration: 0.3 },
                }}
                transition={{ duration: 0.3 }}
              >
                <DropDownIcon boxSize={18} />
              </motion.div>
            ) : (
              <motion.div
                initial={{ rotate: '0deg' }}
                animate={{ rotate: '180deg', translateY: '-15px' }}
                exit={{
                  rotate: '0deg',
                  transition: { duration: 0.3 },
                }}
                transition={{ duration: 0.3 }}
              >
                <DropDownIcon boxSize={18} />
              </motion.div>
            )}
          </>
        )}
      </chakra.span>
    </Th>
  )
}

const PAGE_SIZE = 30

const MissionsTable = () => {
  const filteredAndSortedMissions = useMissionsStore((state) => state.filteredAndSortedMissions)
  const missionsFilter = useMissionsStore((state) => state.missionsFilter)

  const navigate = useNavigate()
  const claimDisclosure = useDisclosure()
  const [isLargerThanMobile] = useMediaQuery('(min-width: 640px)')
  const [isLargerThanTablet] = useMediaQuery('(min-width: 1280px)')
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE)
  const [missionToClaimRewards, setMissionToClaimRewards] = useState<Mission>(null)

  // The missions' timers refresh every second, so only a different list (new missions or a new
  // order) or filter goes back to the first page.
  const listKey = useMemo(
    () => filteredAndSortedMissions?.map((mission) => mission.id).join(',') ?? null,
    [filteredAndSortedMissions]
  )
  const visibleMissions = filteredAndSortedMissions?.slice(0, visibleCount) ?? []
  const hasMore = visibleMissions.length < (filteredAndSortedMissions?.length ?? 0)

  const onClaimRewards = (mission: Mission) => {
    setMissionToClaimRewards(mission)
    claimDisclosure.onOpen()
  }

  const renderMore = () => {
    setVisibleCount((count) => count + PAGE_SIZE)
  }

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [listKey, missionsFilter])

  return (
    <>
      <TableContainer
        width={{ base: '90%', md: '95%', xl: '98%' }}
        userSelect="none"
        position="absolute"
        style={{
          marginTop: isLargerThanMobile ? '20px' : '',
        }}
      >
        <InfiniteScroll
          dataLength={visibleMissions.length}
          next={renderMore}
          hasMore={hasMore}
          loader={
            <Flex w="90%" alignItems="center" justifyContent="center" py="20px">
              <Spinner size="md" />
            </Flex>
          }
        >
          <Table variant="unstyled" mx="auto">
            <Thead>
              <Tr
                cursor="pointer"
                pt={6}
                fontWeight="bold"
                fontFamily="Titillium Web"
                fontSize="sm"
              >
                <SortByTh sortBy={SortBy.Type} width="7%" />
                <SortByTh sortBy={SortBy.Id} width="7%" />
                <SortByTh sortBy={SortBy.Name} width="15%" />
                <SortByTh sortBy={SortBy.Series} width="5%" />
                <SortByTh sortBy={SortBy.Duration} width="7%" />
                <SortByTh sortBy={SortBy.Rewards} width="12%" />
                <SortByTh sortBy={SortBy.Rarity} width="8%" />
                <SortByTh sortBy={SortBy.Spacecrafts} width="10%" />
                <SortByTh sortBy={SortBy.Time} width="14%" />
                <SortByTh sortBy={SortBy.Status} width="10%" />
              </Tr>
            </Thead>
            {visibleMissions !== null && (
              <MotionTbody>
                {map(visibleMissions, (mission, index) => {
                  const {
                    id,
                    attributes: { reward, missionType, name, totalShips, investInfo },
                    view: { status, duration, series, hoverColor, textColor, rarity, rarityColor },
                  } = mission

                  return (
                    <MotionTr
                      key={index}
                      cursor="pointer"
                      bg="transparent"
                      _hover={{
                        backgroundColor: hoverColor,
                        transition: 'background-color 0.07s ease',
                      }}
                      transition="background-color 0.07s ease"
                      color={textColor}
                      fill={textColor === Colors.SNOW_WHITE ? Colors.DI_SERRIA : textColor}
                      height="80px"
                      fontFamily="Orbitron"
                      fontSize="18px"
                      fontWeight={300}
                      onClick={() => {
                        if (
                          investInfo &&
                          !investInfo.withdrawn &&
                          status === MissionStatus.Completed
                        ) {
                          onClaimRewards(mission)
                        } else {
                          navigate(`${PagePath.Missions}/${id}`)
                        }
                      }}
                    >
                      <Td padding={isLargerThanTablet ? '0px' : ''} pl={10}>
                        <Box w="40px">
                          <MissionTypeIcon
                            type={missionType}
                            boxSize={40}
                            color={
                              status === MissionStatus.Boarding ? rarityColor : Colors.RADICAL_RED
                            }
                          />
                        </Box>
                      </Td>
                      <Td padding={isLargerThanTablet ? '0px' : ''} pl={10}>
                        <Text
                          fontWeight={400}
                          whiteSpace="nowrap"
                          letterSpacing="0.05em"
                          fontSize="16px"
                        >
                          {id}
                        </Text>
                      </Td>
                      <Td padding={isLargerThanTablet ? '0px' : ''} pl={10}>
                        <Text
                          fontWeight={400}
                          whiteSpace="nowrap"
                          letterSpacing="0.05em"
                          fontSize="16px"
                        >
                          {name}
                        </Text>
                      </Td>
                      <Td padding={isLargerThanTablet ? '0px' : ''} pl={10}>
                        <Text
                          fontSize="16px"
                          fontWeight={400}
                          whiteSpace="nowrap"
                          letterSpacing="0.05em"
                          fontFamily="orb"
                        >
                          {series}
                        </Text>
                      </Td>
                      <Td padding={isLargerThanTablet ? '0px' : ''} pl={10}>
                        <Text
                          fontSize="16px"
                          fontWeight={400}
                          whiteSpace="nowrap"
                          letterSpacing="0.05em"
                          fontFamily="orb"
                        >
                          {duration}
                        </Text>
                      </Td>
                      <Td padding={isLargerThanTablet ? '0px' : ''} pl={10}>
                        <Flex align="center">
                          <BSCIcon boxSize={30} />

                          <Text
                            ml={4}
                            fontWeight="bold"
                            fontSize="16px"
                            whiteSpace="nowrap"
                            letterSpacing="0.05em"
                          >
                            {getMissionReward(totalShips, reward)}
                          </Text>
                        </Flex>
                      </Td>
                      <Td padding={isLargerThanTablet ? '0px' : ''} pl={10}>
                        {getMissionRarityIcon(rarity)}
                      </Td>
                      <Td padding={isLargerThanTablet ? '0px' : ''} pl={10}>
                        <Flex alignItems="center">
                          <Box w="35px" mr={2} fill="white">
                            <MissionCraftIcon boxSize={35} color={Colors.SNOW_WHITE} />
                          </Box>

                          {mission.attributes.investInfo ? (
                            <>
                              <Text
                                textAlign="left"
                                fontFamily="Orbitron"
                                fontSize="16px"
                                whiteSpace="nowrap"
                                letterSpacing="0.05em"
                                fontWeight={300}
                                color="white"
                              >
                                <chakra.span color="#0ed4a8">
                                  {formatNumber(mission.attributes.investInfo.numberOfShips)}
                                </chakra.span>
                                <chakra.span mx={1} color="#959595" fontSize="18px">
                                  /
                                </chakra.span>
                                <chakra.span fontSize="16px">
                                  {getMissionSpacecrafts(totalShips)}
                                </chakra.span>
                              </Text>
                            </>
                          ) : (
                            <Text
                              textAlign="left"
                              fontFamily="Orbitron"
                              fontSize="16px"
                              color="white"
                              whiteSpace="nowrap"
                              letterSpacing="0.05em"
                            >
                              {getMissionSpacecrafts(totalShips)}
                            </Text>
                          )}
                        </Flex>
                      </Td>
                      <Td padding={isLargerThanTablet ? '0px' : ''} pl={10}>
                        {status === MissionStatus.Completed ? (
                          <Text fontWeight={400} fontFamily="Titillium Web">
                            <chakra.span>
                              <>--</>
                            </chakra.span>
                          </Text>
                        ) : (
                          <MissionTimer mission={mission} />
                        )}
                      </Td>
                      <Td padding={isLargerThanTablet ? '0px' : ''} pl={10}>
                        <MissionInfo mission={mission} />
                      </Td>
                    </MotionTr>
                  )
                })}
              </MotionTbody>
            )}
          </Table>
        </InfiniteScroll>
      </TableContainer>
      {missionToClaimRewards && (
        <AppModal onClose={() => {}} isOpen={claimDisclosure.isOpen}>
          <ClaimRewards onClose={claimDisclosure.onClose} mission={missionToClaimRewards} />
        </AppModal>
      )}
    </>
  )
}

export { MissionsTable }
