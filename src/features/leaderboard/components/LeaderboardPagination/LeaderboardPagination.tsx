import { Paginator } from '@alien-worlds/uikit'
import { Flex } from '@chakra-ui/react'

export const LeaderboardPagination = ({
  currentPage,
  total,
  limit,
  onPageChange,
  disabled,
}: {
  currentPage: number
  total: number
  limit: number
  onPageChange: (page: number) => void
  disabled?: boolean
}) => {
  return (
    <Flex opacity={disabled ? 0.2 : 1} cursor={disabled ? 'not-allowed' : 'default'}>
      <Paginator
        limit={limit}
        displayedPagesNum={5}
        page={currentPage || 1}
        total={total || 0}
        onPageSelected={(p) => {
          if (disabled) return
          onPageChange(p)
        }}
      />
    </Flex>
  )
}
