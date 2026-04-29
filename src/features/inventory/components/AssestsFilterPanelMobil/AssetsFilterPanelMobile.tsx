import { ReverseSortingIcon, SortingIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Flex, Container, Box, Text, Switch } from '@chakra-ui/react'
import { FilterBySelectorMobile } from 'features/inventory/components/FilterBySelectorMobil/FilterBySelectorMobile'
import { useMatch } from 'react-router-dom'
import { SortBySelectorMobile } from 'shared/components/SortBySelectorMobile/SortBySelectorMobile'
import { Colors } from 'shared/util/colors'
import { useAppState, useActions } from 'store'
import { AssetType } from 'store/atomic/types'
import { PagePath } from 'store/main/types'

const AssetsFilterPanelMobile = () => {
  const {
    atomic: { assetsFilter },
    wax: { nftsToClaim },
  } = useAppState()

  const {
    atomic: { setAssetsFilter },
    wax: { claimNfts },
  } = useActions()

  const isInventoryPage = useMatch(PagePath.Inventory)

  const changeGroupByTemplate = (value: boolean) => {
    setAssetsFilter({
      ...assetsFilter,
      groupByTemplate: value,
    })
  }

  const changeReversed = (value: boolean) => {
    setAssetsFilter({
      ...assetsFilter,
      reversed: value,
    })
  }

  if (!assetsFilter?.view) return <></>

  return (
    <Container
      maxW="container.xl"
      p={{
        base: 0,
        lg: 2,
      }}
      m={0}
      maxWidth={{
        base: '100%',
        lg: 'fit-content',
      }}
    >
      <Flex gap={4} direction="column" px={{ base: '2px', md: 0 }}>
        <Flex wrap="wrap" w="full" alignItems="center">
          <Text
            mr={4}
            fontFamily="Titillium Web"
            letterSpacing="0.1em"
            color={Colors.SNOW_WHITE}
            minW="5rem"
            whiteSpace="nowrap"
          >
            Filter by
          </Text>
          <Box flexGrow="1">
            <FilterBySelectorMobile />
          </Box>
        </Flex>

        <Flex wrap="wrap" w="full" alignItems="center">
          <Text
            mr={4}
            fontFamily="Titillium Web"
            letterSpacing="0.1em"
            color={Colors.SNOW_WHITE}
            whiteSpace="nowrap"
            minW="5rem"
          >
            Sort by
          </Text>
          <Box flexGrow="1">
            <SortBySelectorMobile />
          </Box>
        </Flex>
        <Flex justifyContent="space-between" width="full">
          <Flex gap={2} alignItems="center">
            <Text>{assetsFilter.reversed ? 'Z-A' : 'A-Z'}</Text>
            {assetsFilter.reversed ? (
              <ReverseSortingIcon boxSize="18px" />
            ) : (
              <SortingIcon boxSize="18px" />
            )}
          </Flex>
          <Switch
            colorScheme="green"
            size="lg"
            isChecked={assetsFilter.reversed}
            onChange={() => changeReversed(!assetsFilter.reversed)}
          />
        </Flex>
        {isInventoryPage &&
          assetsFilter?.view?.tabOptions[assetsFilter?.view?.selectedTabIndex]?.name !==
            AssetType.LAND && (
            <Flex justifyContent="space-between" width="full">
              <Flex gap={2} alignItems="center">
                <Text>Group</Text>
              </Flex>
              <Switch
                colorScheme="green"
                size="lg"
                isChecked={assetsFilter.groupByTemplate}
                onChange={() => changeGroupByTemplate(!assetsFilter.groupByTemplate)}
              />
            </Flex>
          )}

        <Flex wrap="wrap" w="full">
          {nftsToClaim > 0 && (
            <Box>
              <Button
                variant="success"
                size="sm"
                onClick={() => {
                  claimNfts()
                }}
              >
                Claim NFTs
              </Button>
            </Box>
          )}
        </Flex>
      </Flex>
    </Container>
  )
}

export { AssetsFilterPanelMobile }
