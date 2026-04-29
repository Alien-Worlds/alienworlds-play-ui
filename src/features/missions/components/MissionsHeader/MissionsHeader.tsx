import { FC } from 'react'

import { MetamaskIcon, MissionsIcon } from '@alien-worlds/icons'
import { Flex, Text, Box, Tooltip } from '@chakra-ui/react'
import { useWallets } from '@web3-onboard/react'
import {
  ConnectWalletBtn,
  useWalletConnect,
} from 'features/missions/components/MissionsActions/MissionsActions'
import {
  AvailableTriliumBalance,
  StakedTriliumBalance,
} from 'features/missions/components/MissionsBalances'
import { MissionsNewsletter } from 'features/missions/components/MissionsNewsletter/MissionsNewsletter'
import { MissionsTabs } from 'features/missions/components/MissionsTabs/MissionsTabs'
import { get } from 'lodash'
import { useMatch } from 'react-router-dom'
import { useCopyToClipboard } from 'react-use'
import { Colors } from 'shared/util/colors'
import { useAppState } from 'store'
import { PagePath } from 'store/main/types'

const MissionsHeading = ({ title, subtitle, description, color }) => {
  return (
    <Flex
      px={{ base: '0', md: 4, xl: 0 }}
      w="100%"
      flexWrap="wrap"
      alignItems="flex-start"
      gap={{ base: 2, md: 1 }}
      direction={{ base: 'column', md: 'row' }}
    >
      <Flex alignItems="start" justifyContent="flex-start" gap={3}>
        <Flex
          color={{ base: Colors.COD_GRAY }}
          bg={{ base: Colors.SNOW_WHITE }}
          borderRadius={{ base: 'full' }}
          alignItems="center"
          justifyContent="center"
        >
          <MissionsIcon boxSize="40px" />
        </Flex>
        <Box w={{ base: '100%', md: '70%' }} display={{ base: 'block', md: 'none' }}>
          <Text
            fontFamily="orb"
            fontSize={{ base: '30px', md: '18px' }}
            mt={{ base: '-4px', md: '' }}
          >
            {title}
          </Text>
        </Box>
      </Flex>

      <Flex direction="column" fontWeight={300} px={{ base: '10px', sm: '' }}>
        <Text
          fontFamily="orb"
          fontSize={{ base: '30px', md: '3xl' }}
          lineHeight={1}
          display={{ base: 'none', md: 'block' }}
          mt={{ base: '', md: '4px' }}
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

const MissionsHeadingView = () => {
  const isMissionsExplorerPage =
    get(useMatch(PagePath.MissionsExplorer), 'pathnameBase', null) === PagePath.MissionsExplorer
  const isMissionsInventoryPage =
    get(useMatch(PagePath.MissionsInventory), 'pathnameBase', null) === PagePath.MissionsInventory

  let title
  let subtitle
  let description
  let color

  if (isMissionsInventoryPage) {
    title = 'My NFTs Inventory'
    subtitle = 'Claimed Mission NFTs (*view only)'
    description = 'Mission NFTs exist on the Binance Smart Chain'
    color = Colors.BUTTERCUP
  } else if (isMissionsExplorerPage) {
    title = 'Missions Explorer'
    subtitle = 'Monitor your ongoing Missions'
    description = 'Rarity = NFT Card (Common, Rare, Epic, Legendary)'
    color = Colors.EXQUISITE_TURQUOIS
  } else {
    title = 'Missions Centre'
    subtitle = 'Explore Missions, Discover NFTs'
    description = 'Rarity = NFT Card (Common, Rare, Epic, Legendary)'
    color = Colors.AZURE_RADIANCE
  }

  return (
    <MissionsHeading title={title} subtitle={subtitle} description={description} color={color} />
  )
}

const MissionsTitleBar = () => {
  const wallet = useWalletConnect()
  const connectedWallet = useWallets()
  const {
    web3: { userWallet },
  } = useAppState()

  const [, copyToClipboard] = useCopyToClipboard()

  return (
    <Flex flexDirection={{ base: 'column', md: 'row', xl: 'column' }} gap={{ base: 2, md: 0 }}>
      <Flex
        align="center"
        flexWrap="wrap"
        gap={5}
        w="100%"
        justify="space-between"
        ml={{ base: 0, xl: '15px' }}
        mt={{ base: 0, md: '27px' }}
        mb={{ base: 0, md: !userWallet ? '-60px' : '-60px', xl: !userWallet ? '-140px' : '-60px' }}
      >
        <MissionsHeadingView />
        <Flex display={{ base: 'initial', xl: 'none' }} w="100%">
          <MissionsTabs />
        </Flex>
        <Flex
          gap="5px"
          pr="35px"
          direction={{ base: 'column', xl: 'column' }}
          pb={{ base: '20px', xl: '' }}
          pl={{ base: '25px', xl: '' }}
          mt={{ base: '0px', xl: '-80px' }}
          w={{ base: '100%', xl: '100%', '2xl': '100%' }}
          align={{ base: 'center', md: 'center', lg: 'center', xl: 'flex-end' }}
        >
          <StakedTriliumBalance />
          <AvailableTriliumBalance />
          {connectedWallet.length === 0 ? (
            <Flex py="10px">
              <ConnectWalletBtn onClick={() => wallet.connect()} />
            </Flex>
          ) : (
            <Flex py="10px" gap="5px" justifyContent="center">
              {userWallet?.accounts?.[0]?.address && (
                <Box>
                  <MetamaskIcon boxSize={35} />
                </Box>
              )}
              {connectedWallet.length > 0 && (
                <Tooltip
                  hasArrow
                  fontSize="18px"
                  placement="bottom-start"
                  aria-label="Account address"
                  label={`🟢 ${userWallet?.label} account: ${userWallet?.accounts?.[0]?.address}`}
                >
                  <Text
                    color={Colors.ALTO}
                    fontFamily="tlm"
                    fontSize="16px"
                    fontWeight="bold"
                    maxW="210px"
                    pt="5px"
                    noOfLines={1}
                    cursor="pointer"
                    onClick={() => {
                      copyToClipboard(userWallet?.accounts?.[0]?.address)
                    }}
                  >
                    {`${userWallet?.accounts?.[0]?.address?.substring(0, 28)}`}
                  </Text>
                </Tooltip>
              )}
            </Flex>
          )}
          <Box width="100%" display={{ base: 'initial', xl: 'none' }}>
            <MissionsNewsletter />
          </Box>
        </Flex>
      </Flex>
      <Box
        width="fit-content"
        ml={{ base: 0, md: '75px' }}
        display={{ base: 'none', xl: 'initial' }}
        mt={{ base: '0', xl: userWallet ? '-30px' : '37px' }}
        mb={{ base: '10px', xl: userWallet && '35px' }}
      >
        <MissionsNewsletter />
      </Box>
    </Flex>
  )
}

const MissionsHeader: FC = () => {
  const {
    web3: { userWallet },
  } = useAppState()
  return (
    <Flex gap={{ base: 0, md: 7 }} flexDirection="column" pb={{ base: 0, md: !userWallet ? 6 : 2 }}>
      <MissionsTitleBar />
      <Flex display={{ base: 'none', xl: 'initial' }}>
        <MissionsTabs />
      </Flex>
    </Flex>
  )
}

export { MissionsHeader }
