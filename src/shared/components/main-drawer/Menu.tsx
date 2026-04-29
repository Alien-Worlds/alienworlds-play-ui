import { FC } from 'react'

import { ArenaIcon, InventoryIcon, OutpostIcon, ProfileOldIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Flex } from '@chakra-ui/react'
import { map } from 'lodash'
import { useNavigate } from 'react-router-dom'
import { MenuItem } from 'shared/components/main-sidebar/PageList'
import { useActivePath } from 'shared/hooks/useRouter'
import { useActions } from 'store'
import { PagePath } from 'store/main/types'
import { v4 } from 'uuid'

export const Menu = () => {
  const navigate = useNavigate()
  const {
    main: { toggleMainDrawer },
  } = useActions()

  const MenuList: MenuItem[] = [
    {
      icon: ArenaIcon,
      title: 'Arena',
      path: PagePath.ArenaPortal,
      onClick: () => {
        window.scrollTo({ top: 0, behavior: 'auto' })
        navigate(PagePath.ArenaPortal)
        toggleMainDrawer(true)
        // toggleCompactSidebar(true)
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
        toggleMainDrawer(true)
        //  toggleCompactSidebar(true)
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
        toggleMainDrawer()
        // toggleCompactSidebar(true)
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
        toggleMainDrawer(true)
        // toggleCompactSidebar(true)
      },
      isActive: useActivePath([PagePath.ProfileBalances, PagePath.ProfileInfo]),
      key: v4(),
    },
  ]
  const RenderMenu: FC<{ item: MenuItem }> = ({ item }) => {
    let RenderedMenu: JSX.Element

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

    return RenderedMenu
  }

  return (
    <>
      <Flex flexDirection="column" gap={3} px="16px">
        {map(MenuList, (item) => (
          <RenderMenu item={item} key={v4()} />
        ))}
      </Flex>
    </>
  )
}
