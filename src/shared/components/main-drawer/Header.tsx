import { VFC, useState } from 'react'

import { GovernanceIcon, MissionsIcon, MiningIcon, Profile4Icon } from '@alien-worlds/icons'
import { Flex, IconButton, Tab, TabList, TabPanel, TabPanels, Tabs } from '@chakra-ui/react'
import { MiningMobileView } from 'features/mining/components/MiningMobileView'
import { MissionsViewMobile } from 'features/missions/components/MissionViewMobile'
import { ProfileView } from 'features/profile/components/ProfileView/ProfileView'
import { SyndicatesView } from 'features/syndicates/components/SyndicatesView'
import { Colors } from 'shared/util/colors'

export const Header: VFC = () => {
  const [tabIndex, setTabIndex] = useState(0)

  return (
    <Flex direction="column" w="100%" p={4}>
      {/* FIRST SECTION */}

      <Flex bgColor={Colors.MINE_SHAFT} borderRadius="16px" width="100%">
        <Tabs
          variant="unstyled"
          index={tabIndex}
          onChange={(index) => setTabIndex(index)}
          width="100%"
        >
          <TabPanels>
            <TabPanel>
              <ProfileView />
            </TabPanel>
            <TabPanel width="100%">
              <MiningMobileView />
            </TabPanel>
            <TabPanel width="100%">
              <SyndicatesView />
            </TabPanel>
            <TabPanel>
              <MissionsViewMobile />
            </TabPanel>
          </TabPanels>
          <TabList justifyContent="space-evenly" width="100%" pt="8px" pb="24px">
            <Tab>
              <IconButton
                aria-label="Search database"
                variant="unstyled"
                width="48px"
                height="48px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderColor={Colors.DI_SERRIA}
                borderWidth={tabIndex === 0 ? '2px' : '0px'}
                borderRadius="50%"
                cursor="pointer"
                backgroundColor={Colors.BLACK_SOLID_90}
                icon={<Profile4Icon boxSize="28px" />}
              />
            </Tab>
            <Tab>
              <IconButton
                aria-label="Search database"
                variant="unstyled"
                width="48px"
                height="48px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderColor={Colors.DI_SERRIA}
                borderWidth={tabIndex === 1 ? '2px' : '0px'}
                borderRadius="50%"
                cursor="pointer"
                backgroundColor={Colors.BLACK_SOLID_90}
                icon={<MiningIcon boxSize="28px" />}
              />
            </Tab>
            <Tab>
              <IconButton
                aria-label="Search database"
                variant="unstyled"
                width="48px"
                height="48px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderColor={Colors.DI_SERRIA}
                borderWidth={tabIndex === 2 ? '2px' : '0px'}
                borderRadius="50%"
                cursor="pointer"
                backgroundColor={Colors.BLACK_SOLID_90}
                icon={<GovernanceIcon boxSize="28px" />}
              />
            </Tab>
            <Tab>
              <IconButton
                aria-label="Search database"
                variant="unstyled"
                width="48px"
                height="48px"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderColor={Colors.DI_SERRIA}
                borderWidth={tabIndex === 3 ? '2px' : '0px'}
                borderRadius="50%"
                cursor="pointer"
                backgroundColor={Colors.BLACK_SOLID_90}
                icon={<MissionsIcon boxSize="28px" />}
              />
            </Tab>
          </TabList>
        </Tabs>
      </Flex>

      {/* SECOND SECTION */}
    </Flex>
  )
}
