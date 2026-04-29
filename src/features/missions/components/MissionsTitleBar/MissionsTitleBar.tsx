import { FC } from 'react'

import { BSCIcon, BSCLockIcon, MissionsIcon } from '@alien-worlds/icons'
import { Flex, Box, Text, Show, useBreakpointValue } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { TooltipLocations } from 'features/glossary/utils/glossaryConst'
import { GlossaryInfoIcon } from 'features/glossary/components/GlossaryInfoIcon/GlossaryInfoIcon'
import { MissionsNewsletter } from 'features/missions/components/MissionsNewsletter/MissionsNewsletter'
import { MissionsTabs } from 'features/missions/components/MissionsTabs/MissionsTabs'
import { useActivePath } from 'shared/hooks/useRouter'
import { get } from 'lodash'
import { useMatch } from 'react-router-dom'
import { useAppState } from 'store'
import { PagePath } from 'store/main/types'

interface MissionsHeadingProps {
  title: string
  subtitle: string
  description: string
  color: string
}

const AvailableTriliumBalance: FC = () => {
  const {
    web3: { bscTlmBalanceFormatted },
  } = useAppState()

  return (
    <Flex align="center" color={Colors.DI_SERRIA} fill={Colors.DI_SERRIA} fontSize="sm" gap={2}>
      <Text>Your Available Trilium</Text>

      <BSCIcon boxSize={22} style={{ marginRight: 16, marginLeft: 16 }} />

      <Text fontSize="2xl" fontWeight={400} fontFamily="tlm">
        {bscTlmBalanceFormatted}
      </Text>
    </Flex>
  )
}

const StakedTriliumBalance: FC = () => {
  const {
    web3: { bscStakedTlmBalanceFormatted },
  } = useAppState()

  return (
    <Flex
      align="center"
      color={Colors.SECONDARY_RED}
      fill={Colors.SECONDARY_RED}
      fontWeight="semibold"
      fontSize="sm"
    >
      <GlossaryInfoIcon
        width={16}
        color={Colors.SNOW_WHITE}
        glossaryId={TooltipLocations.MISSIONS_INFO_TLM_LOCKED}
        mr={3}
      />

      <Text>Your Staked Trilium</Text>
      <Box w={6} mx={4}>
        <BSCLockIcon boxSize={24} fill="transparent" />
      </Box>
      <Text fontSize="2xl" fontWeight={400} fontFamily="tlm">
        {bscStakedTlmBalanceFormatted}
      </Text>
    </Flex>
  )
}

const LockedTriliumBalance: FC = () => {
  const {
    web3: { bscStakedTlmBalanceFormatted },
  } = useAppState()

  return (
    <Flex align="center" color={Colors.CARIBBEAN_GREEN} fontWeight="semibold" fontSize="sm">
      <Text>Your Locked Trilium</Text>
      <Box w={6} position="relative" mx={4}>
        <BSCLockIcon boxSize={24} fill="transparent" />
      </Box>
      <Text fontSize="2xl" fontWeight={400} fontFamily="tlm">
        {bscStakedTlmBalanceFormatted}
      </Text>
    </Flex>
  )
}

const MissionsHeading: FC<MissionsHeadingProps> = ({ title, subtitle, description, color }) => {
  const breakpointBox = useBreakpointValue({ base: 9, md: 20 })
  return (
    <Flex alignItems="flex-start" flexWrap="wrap" gap={{ base: 2, md: 5 }}>
      <Flex alignItems="center" justifyContent="flex-start" gap={3}>
        <Flex
          w={{ base: 9, md: 20 }}
          h={{ base: 9, md: 20 }}
          color={{ base: Colors.COD_GRAY, md: color }}
          bg={{ base: Colors.SNOW_WHITE, md: 'none' }}
          padding={{ base: 1, md: 0 }}
          borderRadius={{ base: 'full', md: 'none' }}
          alignItems="center"
          justifyContent="center"
          outline={{ base: `3px solid ${Colors.COD_GRAY}`, md: 'none' }}
        >
          <MissionsIcon width={breakpointBox} height={breakpointBox} />
        </Flex>
        <Box w="70%" display={{ base: 'block', md: 'none' }}>
          <Text fontFamily="orb" letterSpacing="6px" fontSize="18px">
            {title}
          </Text>
        </Box>
      </Flex>

      <Show below="md">
        <MissionsTabs />
      </Show>

      <Flex direction="column" fontWeight={300}>
        <Text
          fontFamily="orb"
          letterSpacing="6px"
          fontSize="36px"
          lineHeight={1}
          display={{ base: 'none', md: 'block' }}
        >
          {title}
        </Text>

        <Text mt={2}>{subtitle}</Text>
        <Text color={color} fontWeight={600}>
          {description}
        </Text>
      </Flex>
    </Flex>
  )
}

const MissionsCentreTitleBar: FC = () => {
  return (
    <Flex
      align="center"
      flexWrap="wrap"
      gap={5}
      justify="space-between"
      marginLeft={{ base: 0, md: '40px' }}
      marginTop={{ base: 0, md: '50px' }}
    >
      <MissionsHeading
        title="Mission Centre"
        subtitle="Explore Missions, Discover NFTs"
        description="Rarity = NFT Card (Common, Rare, Epic, Legendary)"
        color={Colors.AZURE_RADIANCE}
      />

      <AvailableTriliumBalance />
    </Flex>
  )
}

const MissionsExplorerTitleBar: FC = () => {
  return (
    <Flex flexDirection="column" gap={{ base: 2, md: 5 }}>
      <Flex
        align="center"
        flexWrap="wrap"
        gap={{ base: 2, md: 5 }}
        justify="space-between"
        marginLeft={{ base: 0, md: '40px' }}
        marginTop={{ base: 0, md: '50px' }}
      >
        <MissionsHeading
          title="Mission Explorer"
          subtitle="Begin your application process, explore your mission"
          description="Rarity = NFT Card (Common, Rare, Epic, Legendary)"
          color={Colors.EXQUISITE_TURQUOIS}
        />

        <Flex
          direction="column"
          align={{ base: 'flex-start', md: 'flex-end' }}
          mr={{ base: 0, md: 12 }}
          my={4}
        >
          <AvailableTriliumBalance />
          <StakedTriliumBalance />
        </Flex>
      </Flex>

      <Box ml={{ base: 0, md: '140px' }}>
        <MissionsNewsletter />
      </Box>
    </Flex>
  )
}

const MissionsInventoryTitleBar: FC = () => {
  return (
    <Flex
      align="center"
      flexWrap="wrap"
      gap={{ base: 2, md: 5 }}
      justify="space-between"
      marginLeft={{ base: 0, md: '40px' }}
      marginTop={{ base: 0, md: '50px' }}
    >
      <MissionsHeading
        title="My NFT Inventory"
        subtitle="Claimed Mission NFTs (*presently view only)"
        description="Mission NFTs exist on the Binance Smart Chain"
        color={Colors.BUTTERCUP}
      />

      <Flex
        direction="column"
        align={{ base: 'flex-start', md: 'flex-end' }}
        mr={{ base: 0, md: 12 }}
        my={4}
      >
        <AvailableTriliumBalance />
        <LockedTriliumBalance />
      </Flex>
    </Flex>
  )
}

const MissionsTitleBar: FC = () => {
  const isMissionsCentrePage = useActivePath([
    PagePath.Missions,
    PagePath.MissionDetails,
    PagePath.MissionJoin,
  ])
  const isMissionsExplorerPage = useMatch(PagePath.MissionsExplorer)
  if (get(isMissionsExplorerPage, 'pathnameBase', null) === PagePath.MissionsExplorer) {
    return <MissionsExplorerTitleBar />
  }
  if (isMissionsCentrePage) {
    return <MissionsCentreTitleBar />
  }

  return <MissionsInventoryTitleBar />
}

export { MissionsTitleBar }
