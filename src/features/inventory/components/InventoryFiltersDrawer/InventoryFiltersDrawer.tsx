import { CrossIcon } from '@alien-worlds/icons'
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Text,
  Flex,
  IconButton,
} from '@chakra-ui/react'
import { AssetsFilterPanelMobile } from 'features/inventory/components/AssestsFilterPanelMobil'
import { Colors } from 'shared/util/colors'
import { useAppState } from 'store'

interface InventoryFilterDrawerProps {
  isOpen: boolean
  onClose: () => void
}

export const InventoryFiltersDrawer = ({ isOpen, onClose }: InventoryFilterDrawerProps) => {
  const {
    wax: { isDemoUser },
  } = useAppState()
  return (
    <>
      <Drawer placement="top" isFullHeight isOpen={isOpen} onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bgColor={Colors.BLACK_NEUTRAL} pt="90px">
          <DrawerHeader
            borderBottomWidth="1px"
            borderColor={Colors.MINE_SHAFT}
            mt={isDemoUser ? 10 : 0}
          >
            <Flex justifyContent="space-between" width="100%">
              <Text fontFamily="orb" fontWeight="400" fontSize="24px">
                Select Filters
              </Text>
              <IconButton
                aria-label="close drawer"
                onClick={onClose}
                bgColor={Colors.BLACK_NEUTRAL}
                _hover={{ bgColor: Colors.BLACK_NEUTRAL }}
                color={Colors.SNOW_WHITE}
                icon={<CrossIcon />}
              ></IconButton>
            </Flex>
          </DrawerHeader>
          <DrawerBody px="18px">
            <Flex display={{ base: 'initial', md: 'none' }}>
              <AssetsFilterPanelMobile />
            </Flex>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}
