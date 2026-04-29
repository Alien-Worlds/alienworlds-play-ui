import { FC, useCallback } from 'react'

import { InventoryIcon, ArenaIcon, ProfileOldIcon, OutpostIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { ComponentWithAs, Flex, IconProps, Icon } from '@chakra-ui/react'
import { map } from 'lodash'
import { useNavigate } from 'react-router-dom'
import { useActivePath } from 'shared/hooks/useRouter'
import { Colors } from 'shared/util/colors'
import { useScreenSize } from 'shared/util/hooks'
import { useActions, useAppState } from 'store'
import { PagePath } from 'store/main/types'
import { v4 } from 'uuid'

export interface MenuItem {
  icon: ComponentWithAs<'svg', IconProps> | any
  title: string
  path: string
  onClick?: () => void
  isActive?: boolean
  isExternalLink?: boolean
  key: string
}

const PageList: FC = () => {
  const {
    main: { isCompactSidebar },
  } = useAppState()

  const {
    main: { toggleCompactSidebar },
  } = useActions()
  const navigate = useNavigate()

  const { isMobile } = useScreenSize()

  const shouldCompactSidebar = useCallback(() => {
    // always compact sidebar on mobile
    // in case of expanded sidebar displayed on mobile
    // when user clicks on menu item, sidebar will be changed to compact mode
    if (isMobile) return true

    return isCompactSidebar
  }, [isCompactSidebar, isMobile])

  const MenuList: MenuItem[] = [
    {
      icon: ArenaIcon,
      title: 'Arena',
      path: PagePath.ArenaPortal,
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'auto' })
        navigate(PagePath.ArenaPortal)
        toggleCompactSidebar(shouldCompactSidebar())
      },
      isActive: useActivePath([PagePath.ArenaPortal]),
      key: v4(),
    },

    {
      icon: InventoryIcon,
      title: 'Inventory',
      path: PagePath.Inventory,
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'auto' })
        navigate(PagePath.Inventory)
        toggleCompactSidebar(shouldCompactSidebar())
      },
      isActive: useActivePath([PagePath.Inventory]),
      key: v4(),
    },

    {
      icon: OutpostIcon,
      title: 'Outpost',
      path: PagePath.Outpost,
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'auto' })
        navigate(PagePath.Outpost)
        toggleCompactSidebar(shouldCompactSidebar())
      },
      isActive: useActivePath([PagePath.Outpost]),
      key: v4(),
    },
    {
      icon: ProfileOldIcon,
      title: 'Profile',
      path: PagePath.ProfileInfo,
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'auto' })
        navigate(PagePath.ProfileInfo)
        toggleCompactSidebar(shouldCompactSidebar())
      },
      isActive: useActivePath([PagePath.ProfileBalances, PagePath.ProfileInfo]),
      key: v4(),
    },
  ]

  const RenderMenu: FC<{ item: MenuItem }> = ({ item }) => {
    let RenderedMenu: JSX.Element

    if (isCompactSidebar) {
      RenderedMenu = (
        <Flex
          width="full"
          justifyContent="center"
          cursor="pointer"
          background={item.isActive ? Colors.SNOW_WHITE : null}
          color={item.isActive ? Colors.BLACK_SOLID_100 : Colors.SNOW_WHITE}
          py={2}
          onClick={item.onClick}
          _hover={{
            transform: item.isActive ? 'none' : 'scale(1.1)',
          }}
        >
          <Icon as={item.icon} fontSize={{ base: 24, md: 32 }} />
        </Flex>
      )
    } else {
      RenderedMenu = (
        <Button
          justifyContent="flex-start"
          fontWeight={600}
          fontSize={18}
          size="lg"
          variant="info"
          isFullWidth
          leftIcon={<item.icon boxSize="24px" />}
          isActive={item.isActive}
          onClick={item.onClick}
          marginBottom={2}
        >
          {item.title}
        </Button>
      )
    }

    return RenderedMenu
  }

  return (
    <>
      <Flex flexDirection="column" gap={3}>
        {map(MenuList, (item) => (
          <RenderMenu item={item} key={item.key} />
        ))}
      </Flex>
    </>
  )
}

export { PageList }
