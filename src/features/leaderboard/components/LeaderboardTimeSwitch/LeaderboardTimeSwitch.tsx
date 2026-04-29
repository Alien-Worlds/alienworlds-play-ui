import { FC } from 'react'

import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, Flex } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'

import { LeaderboardFilter } from '../../types/leaderboardTypes'

export const LeaderboardTimeSwitch: FC<{
  timeRange: LeaderboardFilter | string
  onChange: (timeRange: LeaderboardFilter) => void
}> = ({ timeRange, onChange }) => {
  return (
    <Flex alignItems={{ base: 'center', md: 'flex-start' }} direction="column">
      <Breadcrumb separator="|" fontWeight={400} fontSize={16}>
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink
            isCurrentPage={timeRange === LeaderboardFilter.MONTHLY}
            color={timeRange === LeaderboardFilter.MONTHLY ? Colors.DI_SERRIA : Colors.SNOW_WHITE}
            onClick={() => {
              onChange(LeaderboardFilter.MONTHLY)
            }}
          >
            Monthly
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink
            isCurrentPage={timeRange === LeaderboardFilter.WEEKLY}
            color={timeRange === LeaderboardFilter.WEEKLY ? Colors.DI_SERRIA : Colors.SNOW_WHITE}
            onClick={() => {
              onChange(LeaderboardFilter.WEEKLY)
            }}
          >
            Weekly
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbItem>
          <BreadcrumbLink
            isCurrentPage={timeRange === LeaderboardFilter.DAILY}
            color={timeRange === LeaderboardFilter.DAILY ? Colors.DI_SERRIA : Colors.SNOW_WHITE}
            onClick={() => {
              onChange(LeaderboardFilter.DAILY)
            }}
          >
            Daily
          </BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>
    </Flex>
  )
}
