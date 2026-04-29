import { LightIcon, MiningIcon, NFTOldIcon, ShardsIcon, TriliumIcon } from '@alien-worlds/icons'
import { LevelRing, PlaceRing } from '@alien-worlds/uikit'
import { Flex, Table, TableContainer, Tbody, Td, Text, Th, Thead, Tr } from '@chakra-ui/react'
import { LeaderboardItem, LeaderboardTableTypes } from 'features/leaderboard/types/leaderboardTypes'
import { motion } from 'framer-motion'
import { map } from 'lodash'
import { Colors } from 'shared/util/colors'
import {
  fallbackAvatarSrc,
  getLeaderboardPlaceRingVariantByRank,
  rankGradientColors,
  rankGradientHoverColors,
} from 'shared/util/helpers'
import { formatNumber } from 'shared/util/numbers'

const MotionTr = motion(Tr)
const MotionFlex = motion(Flex)
const MotionTbody = motion(Tbody)

const SortByTh = ({
  text,
  width,
  subtext,
  isHeader,
}: {
  text: string
  width: any
  subtext?: string
  isHeader?: boolean
}) => {
  return (
    <Th width={width} p={0} h="60px">
      <Flex direction="row" width="100%" p={0} alignItems="start" gap="2px">
        {isHeader ? (
          <Text
            minW="50px"
            width="100%"
            textAlign="center"
            color={Colors.JUMBO}
            textTransform="capitalize"
            fontFamily="Titillium Web"
          >
            {LeaderboardTableTypes.Rank}º
          </Text>
        ) : (
          <Flex direction={{ base: 'column', '2xl': 'row' }} alignItems="center">
            <Flex p={0} direction="column">
              <Text
                fontSize="sm"
                fontWeight="bold"
                width="fit-content"
                color={Colors.JUMBO}
                fontFamily="Titillium Web"
                pt={subtext ? '12px' : ''}
                textTransform="capitalize"
                whiteSpace="break-spaces"
              >
                {text}
              </Text>
              {subtext && (
                <Text
                  fontSize="sm"
                  width="fit-content"
                  fontWeight="light"
                  color={Colors.JUMBO}
                  fontFamily="Titillium Web"
                  textTransform="capitalize"
                >
                  {subtext}
                </Text>
              )}
            </Flex>
          </Flex>
        )}
      </Flex>
    </Th>
  )
}

export const LeaderBoardTable = ({
  items,
  searchValue,
  isLoadingNewPage,
}: {
  items: LeaderboardItem[]
  searchValue: string | null
  isLoadingNewPage: boolean
}) => {
  return (
    <>
      {/* DESKTOP */}
      <TableContainer width="100%" display={{ base: 'none', xl: 'inherit' }}>
        <Table mt="15px" width="100%" mb={items && items?.length === 1 ? '645px' : '15px'}>
          <Thead width="100%">
            <Tr
              width="100%"
              fontSize="sm"
              cursor="default"
              fontWeight="bold"
              fontFamily="Titillium Web"
              bg={Colors.BLACK_ALPHA_80}
            >
              <SortByTh isHeader width="6%" text={LeaderboardTableTypes.Rank} />
              <SortByTh text={LeaderboardTableTypes.Explorer} width={{ base: '2%', xl: '16%' }} />
              <SortByTh
                text={LeaderboardTableTypes.TlmMined}
                width={{ base: '1%', xl: '17%', '2xl': '22%' }}
                subtext="Total | Highest"
              />
              <SortByTh
                text={LeaderboardTableTypes.TotalShards}
                width={{ base: '10%', '2xl': '8%' }}
              />
              <SortByTh
                text={LeaderboardTableTypes.ChargeTime}
                width={{ base: '9%', '2xl': '8%' }}
                subtext="Average"
              />
              <SortByTh
                text={LeaderboardTableTypes.MiningPower}
                width={{ base: '7%', '2xl': '8%' }}
                subtext="Average"
              />
              <SortByTh
                text={LeaderboardTableTypes.NFTPower}
                width={{ base: '7%', '2xl': '8%' }}
                subtext="Average"
              />
              <SortByTh
                text={LeaderboardTableTypes.MinedLands}
                width={{ base: '6%', '2xl': '7%' }}
              />
              <SortByTh
                text={LeaderboardTableTypes.MinedPlanets}
                width={{ base: '6%', '2xl': '7%' }}
              />
              <SortByTh
                text={LeaderboardTableTypes.UniqueTools}
                width={{ base: '6%', '2xl': '7%' }}
              />
            </Tr>
          </Thead>

          <MotionTbody>
            <>
              {map(items, (explorer, index) => (
                <MotionTr
                  key={index}
                  cursor="default"
                  whileHover={{
                    backgroundColor: rankGradientHoverColors(explorer.position),
                    transition: {
                      duration: 0.03,
                    },
                  }}
                  height="70px"
                  fontSize="16px"
                  fontWeight={450}
                  fontFamily="Orbitron"
                  fill={rankGradientColors(explorer.position)}
                  color={rankGradientColors(explorer.position)}
                  bg={index % 2 === 0 ? Colors.BLACK_ALPHA_80 : Colors.DARK_BLACK_80}
                >
                  <Td p={0} pl={6} textAlign="center">
                    <Text w="40px">{explorer?.position}</Text>
                  </Td>
                  <Td p={0}>
                    <Flex p={0} m={0} gap={3} h="40px" alignItems="center" justifyContent="start">
                      <LevelRing
                        radius={3.7}
                        variant="level1A"
                        ringThickness={1.33}
                        src={explorer.avatar}
                        fallbackSrc={fallbackAvatarSrc}
                        solidColor={rankGradientColors(explorer.position)}
                      />
                      <Flex flexDirection="column" gap="0px">
                        <Text fontFamily="tlm" fontWeight={600} fontSize="18px">
                          {explorer?.tag}
                        </Text>
                        <Text fontFamily="tlm" fontWeight={500} fontSize="14px">
                          {explorer?.wallet_id}
                        </Text>
                      </Flex>
                    </Flex>
                  </Td>
                  <Td p={0}>
                    <Flex gap="7px" alignItems="center">
                      <TriliumIcon width="20px" height="20px" color={Colors.DARK_YELLOW} />
                      <Flex direction={{ base: 'column', '2xl': 'row' }}>
                        <Text>{formatNumber(explorer?.tlm_gains_total, 4, 4)}</Text>
                        <Flex mx="5px" display={{ base: 'none', '2xl': 'initial' }}>
                          <Text>|</Text>
                        </Flex>
                        <Text fontSize={{ base: 12, '2xl': 16 }}>
                          {formatNumber(explorer?.tlm_gains_highest, 4, 4)}
                        </Text>
                      </Flex>
                    </Flex>
                  </Td>
                  <Td p={0}>
                    <Flex gap="7px" justifyContent="start">
                      <ShardsIcon
                        width="20px"
                        height="20px"
                        clipPath="circle(50%)"
                        color={Colors.DARK_YELLOW}
                      />
                      <Text>{formatNumber(explorer?.total_nft_points / 10, 0, 1)}</Text>
                    </Flex>
                  </Td>
                  <Td p={0}>
                    <Flex gap="3px" alignItems="center" justifyContent="start">
                      <LightIcon height="20px" width="20px" color={Colors.NAVY_BLUE} />
                      <Text>{formatNumber(explorer?.avg_charge_time, 0, 1)}s</Text>
                    </Flex>
                  </Td>
                  <Td p={0}>
                    <Flex gap="7px" alignItems="center" justifyContent="start">
                      <MiningIcon width="16px" height="16px" color={Colors.GRAY_CHATEAU} />
                      <Text>{formatNumber(explorer?.avg_mining_power / 10, 0, 1)}</Text>
                    </Flex>
                  </Td>
                  <Td p={0}>
                    <Flex gap="7px" alignItems="center" justifyContent="start">
                      <NFTOldIcon width="20px" height="20px" color={Colors.GRAY_CHATEAU} />
                      <Text>{formatNumber(explorer?.avg_nft_power / 10, 0, 1)}</Text>
                    </Flex>
                  </Td>
                  <Td p={0}>
                    <Flex alignItems="center" justifyContent="center" ml="-30px">
                      <Text>{explorer?.lands_mined_on}</Text>
                    </Flex>
                  </Td>
                  <Td p={0}>
                    <Flex alignItems="center" justifyContent="center" ml="-30px">
                      <Text>{explorer?.planets_mined_on}</Text>
                    </Flex>
                  </Td>
                  <Td p={0}>
                    <Flex alignItems="center" justifyContent="center" ml="-30px">
                      <Text>{explorer?.unique_tools_used}</Text>
                    </Flex>
                  </Td>
                </MotionTr>
              ))}
            </>
          </MotionTbody>
        </Table>
      </TableContainer>

      {/* DESKTOP LOADING SCREEN */}
      <Flex
        w="100%"
        h="700px"
        zIndex={50000}
        alignItems="center"
        justifyContent="center"
        bg={Colors.DARK_BLACK_80}
        mt={items?.length !== 0 || isLoadingNewPage ? '-720px' : '-15px'}
        mb={items?.length === 0 ? '15px' : isLoadingNewPage ? '20px' : '0px'}
        display={{ base: 'none', xl: items?.length === 0 || isLoadingNewPage ? 'inherit' : 'none' }}
      >
        <Text
          fontSize={20}
          height="100%"
          display="flex"
          textAlign="center"
          alignItems="center"
          fontFamily="Orbitron"
          justifyContent="center"
        >
          {searchValue?.length > 0 ? 'Searching...' : 'Loading...'}
        </Text>
      </Flex>

      {/* MOBILE */}
      <Flex
        w="100%"
        my="15px"
        py="10px"
        gap="10px"
        direction="column"
        alignItems="center"
        bg="rgba(0,0,0,0.8)"
        minH={{ base: '570px', md: '700px' }}
        display={{ base: 'inherit', xl: 'none' }}
      >
        <>
          {map(items, (explorer, index) => (
            <MotionFlex
              key={index}
              cursor="default"
              whileHover={{
                backgroundColor: rankGradientHoverColors(explorer.position),
                transition: {
                  duration: 0.07,
                },
              }}
              fontWeight={450}
              border="1px solid"
              fontFamily="Orbitron"
              p={{ base: 3, lg: 6 }}
              w={{ base: '97%', md: '98%' }}
              pt={{ base: '25px', lg: '25px' }}
              gap={{ base: '10px', lg: '30px' }}
              direction={{ base: 'column', lg: 'row' }}
              fill={rankGradientColors(explorer.position)}
              color={rankGradientColors(explorer.position)}
              borderColor={rankGradientColors(explorer.position)}
              alignItems={{ base: 'center', sm: 'center', lg: 'start' }}
              height={{ base: '580px', sm: '550px', md: '510px', lg: '300px' }}
              bg={index % 2 === 0 ? Colors.BLACK_ALPHA_80 : Colors.DARK_BLACK_80}
            >
              {/* AVATAR + TAG + WALLETID */}
              <Flex
                gap={3}
                width="30%"
                direction="column"
                alignItems="center"
                justifyContent={{ base: 'center', lg: 'start' }}
              >
                <Flex mt="-30px" pl="10px">
                  <PlaceRing
                    animate
                    isOrnament
                    radius={9.5}
                    ringThickness={0}
                    animationDuration={5}
                    src={explorer.avatar}
                    fallbackSrc={fallbackAvatarSrc}
                    rankText={explorer.position.toString()}
                    variant={getLeaderboardPlaceRingVariantByRank(explorer.position)}
                  />
                </Flex>
                {/* TAG + WALLETID */}
                <Flex
                  gap="0px"
                  mt="-10px"
                  flexDirection="column"
                  justifyContent="center"
                  h={{ base: 'fit-content', lg: '100%' }}
                >
                  <Text
                    fontFamily="tlm"
                    fontWeight={600}
                    textAlign="center"
                    fontSize={{ base: 24, sm: 22 }}
                  >
                    {explorer?.tag}
                  </Text>
                  <Text
                    fontFamily="tlm"
                    fontWeight={500}
                    textAlign="center"
                    fontSize={{ base: 18, sm: 16 }}
                  >
                    {explorer?.wallet_id}
                  </Text>
                </Flex>
              </Flex>

              {/* RIGHT SECTION */}
              <Flex
                direction="column"
                justifyContent="center"
                w={{ base: '100%', sm: '90%' }}
                gap={{ base: '15px', sm: '15px', lg: 0 }}
              >
                {/* FIRST ROW */}
                <Flex
                  w="auto"
                  justifyContent="space-between"
                  gap={{ base: '10px', md: '0' }}
                  direction={{ base: 'column', md: 'row' }}
                >
                  {/* TLM MINED */}
                  <Flex
                    gap={{ base: '0px', md: '0px', lg: '0px' }}
                    alignItems={{ base: 'center', md: 'start' }}
                    justifyContent={{ base: 'center', md: 'start' }}
                    direction={{ base: 'column', md: 'column', lg: 'column' }}
                  >
                    <Flex
                      alignItems="center"
                      gap={{ base: '5px', md: '5px' }}
                      direction={{ base: 'row', sm: 'row' }}
                    >
                      <Text
                        fontFamily="tlm"
                        fontWeight={600}
                        color={Colors.SECONDARY_GRAY}
                        fontSize={{ base: 16, sm: 16 }}
                      >
                        {LeaderboardTableTypes.TlmMined}
                      </Text>
                      <Text
                        mt="3px"
                        fontSize="13px"
                        fontFamily="tlm"
                        fontWeight={500}
                        color={Colors.SECONDARY_GRAY}
                      >
                        (Total | Highest)
                      </Text>
                    </Flex>
                    <Flex gap="7px" fontSize={20} alignItems="center" ml={{ base: '-25px', md: 0 }}>
                      <TriliumIcon width="20px" height="20px" color={Colors.DARK_YELLOW} />
                      <Flex direction={{ base: 'column', sm: 'row' }}>
                        <Text fontSize={{ base: 20, sm: 20, md: 18 }}>
                          {formatNumber(explorer?.tlm_gains_total, 4, 4)}
                        </Text>
                        <Flex mx="5px" display={{ base: 'none', sm: 'initial' }}>
                          <Text>|</Text>
                        </Flex>
                        <Text
                          fontSize={{ base: 14, sm: 20, md: 18 }}
                          textAlign={{ base: 'center' }}
                        >
                          {formatNumber(explorer?.tlm_gains_highest, 4, 4)}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                  {/* TOTAL SHARDS */}
                  <Flex
                    gap="0px"
                    flexDirection="column"
                    alignItems={{ base: 'center', md: 'start' }}
                    justifyContent={{ base: 'center', md: 'start' }}
                  >
                    <Text
                      fontFamily="tlm"
                      fontWeight={600}
                      color={Colors.SECONDARY_GRAY}
                      fontSize={{ base: 14, sm: 16 }}
                    >
                      {LeaderboardTableTypes.TotalShards}
                    </Text>
                    <Flex gap="7px" justifyContent="start">
                      <ShardsIcon
                        width="20px"
                        height="20px"
                        clipPath="circle(50%)"
                        color={Colors.DARK_YELLOW}
                      />
                      <Text fontSize={{ base: 14, sm: 16 }}>
                        {formatNumber(explorer?.total_nft_points / 10, 0, 1)}
                      </Text>
                    </Flex>
                  </Flex>
                </Flex>

                <Flex direction="column" gap={{ base: '20px', sm: '20px' }}>
                  {/* SECOND ROW */}
                  <Flex
                    justifyContent="space-between"
                    h={{ base: '60px', lg: '120px' }}
                    gap={{ base: '10px', sm: '15px', md: '0' }}
                    textAlign={{ base: 'center', sm: 'start' }}
                  >
                    {/* CHARGE TIME */}
                    <Flex flexDirection="column" gap="0px" h="100%" justifyContent="center">
                      <Text
                        fontFamily="tlm"
                        fontWeight={600}
                        color={Colors.SECONDARY_GRAY}
                        fontSize={{ base: 12, sm: 16 }}
                        textAlign={{ base: 'center', sm: 'start' }}
                      >
                        Avg. {LeaderboardTableTypes.ChargeTime}
                      </Text>
                      <Flex
                        gap="3px"
                        alignItems="center"
                        ml={{ base: '-5px', sm: 0 }}
                        justifyContent={{ base: 'center', sm: 'start' }}
                      >
                        <LightIcon height="20px" width="20px" color={Colors.NAVY_BLUE} />
                        <Text fontSize={{ base: 12, sm: 16 }}>
                          {formatNumber(explorer?.avg_charge_time, 0, 1)}s
                        </Text>
                      </Flex>
                    </Flex>
                    {/* MINING POWER */}
                    <Flex flexDirection="column" gap="0px" justifyContent="center">
                      <Text
                        fontFamily="tlm"
                        fontWeight={600}
                        color={Colors.SECONDARY_GRAY}
                        fontSize={{ base: 12, sm: 16 }}
                        textAlign={{ base: 'center', sm: 'start' }}
                      >
                        Avg. {LeaderboardTableTypes.MiningPower}
                      </Text>
                      <Flex
                        gap="7px"
                        alignItems="center"
                        justifyContent={{ base: 'center', sm: 'start' }}
                      >
                        <MiningIcon width="16px" height="16px" color={Colors.GRAY_CHATEAU} />
                        <Text fontSize={{ base: 12, sm: 16 }}>
                          {formatNumber(explorer?.avg_mining_power / 10, 0, 1)}%
                        </Text>
                      </Flex>
                    </Flex>
                    {/* NFT POWER */}
                    <Flex flexDirection="column" gap="0px" justifyContent="center">
                      <Text
                        fontFamily="tlm"
                        fontWeight={600}
                        color={Colors.SECONDARY_GRAY}
                        fontSize={{ base: 12, sm: 16 }}
                        textAlign={{ base: 'center', sm: 'start' }}
                      >
                        Avg. {LeaderboardTableTypes.NFTPower}
                      </Text>
                      <Flex
                        gap="7px"
                        alignItems="center"
                        justifyContent={{ base: 'center', sm: 'start' }}
                      >
                        <NFTOldIcon width="20px" height="20px" color={Colors.GRAY_CHATEAU} />
                        <Text fontSize={{ base: 12, sm: 16 }}>
                          {formatNumber(explorer?.avg_nft_power / 10, 0, 1)}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                  {/* THIRD ROW */}
                  <Flex justifyContent="space-between" gap={{ base: '40px', sm: 0 }}>
                    {/* MINED LANDS */}
                    <Flex flexDirection="column" gap="0px" justifyContent="center">
                      <Text
                        fontFamily="tlm"
                        fontWeight={600}
                        color={Colors.SECONDARY_GRAY}
                        fontSize={{ base: 12, sm: 16 }}
                        textAlign={{ base: 'center', sm: 'start' }}
                      >
                        {LeaderboardTableTypes.MinedLands}
                      </Text>
                      <Flex alignItems="center" justifyContent={{ base: 'center', sm: 'start' }}>
                        <Text fontSize={{ base: 12, sm: 16 }}>{explorer?.lands_mined_on}</Text>
                      </Flex>
                    </Flex>
                    {/* MINED PLANETS */}
                    <Flex flexDirection="column" gap="0px" justifyContent="center">
                      <Text
                        fontFamily="tlm"
                        fontWeight={600}
                        color={Colors.SECONDARY_GRAY}
                        fontSize={{ base: 12, sm: 16 }}
                        textAlign={{ base: 'center', sm: 'start' }}
                      >
                        {LeaderboardTableTypes.MinedPlanets}
                      </Text>
                      <Flex alignItems="center" justifyContent={{ base: 'center', sm: 'start' }}>
                        <Text fontSize={{ base: 12, sm: 16 }}>{explorer?.planets_mined_on}</Text>
                      </Flex>
                    </Flex>
                    {/* UNIQUE TOOLS */}
                    <Flex flexDirection="column" gap="0px" justifyContent="center">
                      <Text
                        fontFamily="tlm"
                        fontWeight={600}
                        color={Colors.SECONDARY_GRAY}
                        fontSize={{ base: 12, sm: 16 }}
                        textAlign={{ base: 'center', sm: 'start' }}
                      >
                        {LeaderboardTableTypes.UniqueTools}
                      </Text>
                      <Flex alignItems="center" justifyContent={{ base: 'center', sm: 'start' }}>
                        <Text
                          textAlign={{ base: 'center', sm: 'start' }}
                          fontSize={{ base: 12, sm: 16 }}
                        >
                          {explorer?.unique_tools_used}
                        </Text>
                      </Flex>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            </MotionFlex>
          ))}
        </>

        <Flex
          m={0}
          p={0}
          w="95%"
          minH="565px"
          zIndex={50000}
          position="absolute"
          bg={Colors.DARK_BLACK_80}
          display={isLoadingNewPage || (items && items?.length === 0) ? 'initial' : 'none'}
        >
          <Flex
            w="full"
            top="150px"
            fontSize={14}
            alignItems="center"
            position="absolute"
            fontFamily="Orbitron"
            justifyContent="center"
          >
            {searchValue?.length > 0 ? 'Searching...' : 'Loading...'}
          </Flex>
        </Flex>
      </Flex>
    </>
  )
}
