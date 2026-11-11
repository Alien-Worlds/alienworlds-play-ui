import { FC, memo, useEffect } from 'react'

import { Flex, Tabs, TabList, Tab, useBreakpointValue } from '@chakra-ui/react'
import { useConnectWallet } from '@web3-onboard/react'
import { motion, useAnimation } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'
import { PagePath } from 'store/main/types'

const MotionFlex = motion(Flex)

const MissionBadge: FC<{ count: number; isSelected: boolean }> = memo(({ count, isSelected }) => {
  if (count > 0) {
    return (
      <Flex
        bg={isSelected ? Colors.COD_GRAY : Colors.EMPEROR}
        borderRadius="full"
        fontSize="12px"
        fontFamily="tlm"
        alignItems="center"
        justifyContent="center"
        fontWeight="bold"
        width={count < 10 ? '20px' : '30px'}
        height={count < 10 ? '20px' : '30px'}
        ml={1}
      >
        {count <= 10 ? count : '10+'}
      </Flex>
    )
  }
  return <></>
})

const MISSION_TABS = [
  {
    label: 'Centre',
    pagePath: PagePath.Missions,
    activeColor: Colors.AZURE_RADIANCE,
    selectedColor: Colors.SNOW_WHITE,
  },
  {
    label: 'My Missions',
    pagePath: PagePath.MissionsExplorer,
    activeColor: Colors.EXQUISITE_TURQUOIS,
    selectedColor: Colors.SNOW_WHITE,
    showsMissionsToClaim: true,
  },
  {
    label: 'NFT Inventory',
    pagePath: PagePath.MissionsInventory,
    activeColor: Colors.BUTTERCUP,
    selectedColor: Colors.BLACK_SOLID_100,
  },
]

const MissionsTabs: FC = () => {
  const {
    missions: { reloadMissions },
    missions: { setSelectedMissionsTab },
  } = useActions()
  const {
    web3: { userWallet, isAutoConnect },
    missions: { missionsToClaimCount, selectedMissionsTab },
  } = useAppState()

  const navigate = useNavigate()
  const headerControls = useAnimation()
  const [, connect] = useConnectWallet()

  const refreshMissions = async () => {
    await reloadMissions()
  }

  async function setWalletFromLocalStorage(previouslyConnectedWallets) {
    if (isAutoConnect) {
      if (
        previouslyConnectedWallets &&
        previouslyConnectedWallets.length > 0 &&
        previouslyConnectedWallets[0]
      ) {
        await connect({ autoSelect: previouslyConnectedWallets[0] })
      } else {
        await connect({ autoSelect: { label: 'Coinbase Wallet', disableModals: false } })
      }
    }
    refreshMissions()
  }

  useEffect(() => {
    refreshMissions()
  }, [userWallet])

  useEffect(() => {
    const previouslyConnectedWallets = JSON.parse(window.localStorage.getItem('connectedWallets'))
    if (previouslyConnectedWallets?.length) {
      setWalletFromLocalStorage(previouslyConnectedWallets)
    }
  }, [connect])

  const handleMissionTabClick = (index: number) => {
    setSelectedMissionsTab(index)
    const path = MISSION_TABS[index].pagePath
    navigate(path)
  }

  enum Direction {
    Horizontal = 'horizontal',
    Vertical = 'vertical',
  }

  const currentButtonSize = useBreakpointValue({
    base: Direction.Vertical,
    md: Direction.Horizontal,
  })

  return (
    <MotionFlex
      animate={headerControls}
      id="missions-header"
      zIndex={1000}
      px={{ base: '10px', md: 4 }}
      flexDirection={{ base: 'row', xl: 'row' }}
      gap={{ base: 4, xl: 2 }}
      w={{ base: '100%', xl: '' }}
      alignItems="center"
      mt={{ base: 2, xl: !userWallet ? 0 : '-60px' }}
    >
      <Flex w={{ base: '100%', xl: 'fit-content' }}>
        <Tabs
          isLazy
          defaultIndex={0}
          variant="full-rounded"
          index={selectedMissionsTab}
          w={{ base: '100%', xl: 'fit-content' }}
          onChange={(index) => handleMissionTabClick(index)}
          orientation={currentButtonSize}
        >
          <TabList w={{ base: '100%', xl: '' }}>
            {MISSION_TABS.map((item, index) => (
              <Tab
                width={{ base: '100%', xl: 'fit-content' }}
                key={index}
                _selected={{
                  bg: item.activeColor,
                  fontWeight: 'black',
                  color: item.selectedColor,
                }}
                px={{ base: 2 }}
              >
                {item.label}
                {item.showsMissionsToClaim && missionsToClaimCount > 0 && (
                  <MissionBadge
                    count={missionsToClaimCount}
                    isSelected={index === selectedMissionsTab}
                  />
                )}
              </Tab>
            ))}
          </TabList>
        </Tabs>
      </Flex>
    </MotionFlex>
  )
}

export { MissionsTabs }
