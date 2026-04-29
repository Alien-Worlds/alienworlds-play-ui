import { useCallback, useMemo, useState } from 'react'

import { ShardsIcon, OutpostIcon } from '@alien-worlds/icons'
import { Flex, Heading, TabList, Tabs, TabPanel, Tab, TabPanels, Text } from '@chakra-ui/react'
import { AWNftOffers } from 'features/outpost/components/AWNftOffers/AWNftOffers'
import { CommunityNftOffers } from 'features/outpost/components/CommunityNftOffers/CommunityNftOffers'
import { useRedeemAWNftOffer } from 'features/outpost/hooks/mutations/useRedeemAWNftOffer'
import { useRedeemCommunityNftOffer } from 'features/outpost/hooks/mutations/useRedeemCommunityNftOffer'
import { NftRedemptionModal } from 'features/outpost/modals/NftRedemptionModal/NftRedemptionModal'
import { ModalData, ShowRedeemModal } from 'features/outpost/types/nftOutpostTypes'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { useWalletDetails } from 'graphql/hooks/useWalletDetails'
import { WalletDetailsResponse } from 'graphql/types'
import { get, isNil } from 'lodash'
import { Colors } from 'shared/util/colors'
import { formatUserPointsWithDecimal } from 'shared/util/helpers'
import { useActions, useAppState } from 'store'
import { v4 } from 'uuid'

const Outpost = () => {
  const {
    wax: { walletId },
  } = useAppState()
  const {
    main: { setOutPostModalsActive },
  } = useActions()
  const { walletDetails, loading }: { walletDetails: WalletDetailsResponse; loading: boolean } =
    useWalletDetails(walletId)
  const [tabIndex, setTabIndex] = useState(0)
  const [modalData, setModalData] = useState<ModalData>(null)

  // @TODO
  // swap inventory for the points offers and use sorting
  // const { sortedAssets, setSortedBy, setSortedAssets, sortedBy } = useSortNFTs(
  //   inventoryGrouped(),
  //   sortingReversed
  // )

  // async function reverseSorting() {
  //   setSortingReversed(!sortingReversed)
  //   setSortedAssets(sortedAssets)
  // }

  // useEffect(() => {
  //   setSortedAssets(inventoryGrouped())
  // }, [inventoryGrouped])

  // Used to force the community tab to re-render when a community NFT is redeemed and also reset InfiniteScroll
  const [communityTabKey, setCommunityTabKey] = useState(v4())
  const { mutate: redeemAWNftOfferAction } = useRedeemAWNftOffer()
  const { mutate: redeemCommunityNftOfferAction } = useRedeemCommunityNftOffer()

  const closeRedeemModal = useCallback(() => {
    setOutPostModalsActive(false)
    setModalData({
      nftCardModal: null,
      isOpen: false,
      pointsRequired: null,
      redeemAction: null,
    })
  }, [])

  const onShowRedeemModal: ShowRedeemModal = useCallback(
    (nftCardModal, offerId, pointsRequired) => {
      const redeemAction = async () => {
        if (tabIndex === 0) {
          await redeemAWNftOfferAction({ offerId, pointsRequired })
        } else {
          await redeemCommunityNftOfferAction({ offerId, pointsRequired })
          setCommunityTabKey(v4())
        }

        closeRedeemModal()
      }
      setOutPostModalsActive(true)
      setModalData({
        nftCardModal,
        isOpen: true,
        pointsRequired,
        redeemAction,
      })
    },
    [tabIndex, redeemAWNftOfferAction, redeemCommunityNftOfferAction, closeRedeemModal]
  )

  const tabSelectedStyle = useMemo(
    () => ({
      bg: Colors.SNOW_WHITE,
      fontWeight: 'bold',
      color: Colors.BLACK_SOLID_100,
    }),
    []
  )
  if (loading) return <LoadingSpinner />

  return (
    <>
      <Flex
        flexDirection="column"
        paddingBlock={15}
        width="full"
        px={{ base: '18px', md: 16, lg: 8 }}
      >
        <Flex
          mb="22px"
          w="full"
          flexWrap="wrap"
          direction={{ base: 'column', md: 'row' }}
          justifyContent={{ base: 'center', md: 'space-between' }}
          gap="12px"
        >
          <Flex direction="column" gap={2}>
            <Flex textAlign="start" alignItems="center" gap={3}>
              <Flex
                bg={Colors.SNOW_WHITE}
                color={Colors.COD_GRAY}
                width={{ base: 8, md: 10 }}
                height={{ base: 8, md: 10 }}
                borderRadius="full"
                justifyContent="center"
                alignItems="center"
              >
                <OutpostIcon boxSize={24} />
              </Flex>

              <Heading
                as="h2"
                fontFamily="orb"
                size="lg"
                color={Colors.SNOW_WHITE}
                fontWeight="normal"
                fontSize="3xl"
              >
                Outpost
              </Heading>
            </Flex>
            <Text color={Colors.GRAY_CHATEAU} fontSize="14px" fontFamily="tlm" fontWeight={400}>
              Transform your old NFT claims into “Shards”
            </Text>
          </Flex>

          <Flex ml={{ base: 1, md: 0 }} alignItems="center">
            <Flex alignItems="center" justifyContent="center" h="30px">
              <ShardsIcon boxSize="35px" color={Colors.SNOW_WHITE} />
            </Flex>
            {!isNil(walletDetails) && (
              <Text
                ml="10px"
                fontSize={{ base: '14px', md: '20px' }}
                fontWeight={700}
                fontFamily="orb"
                textAlign="center"
                letterSpacing="0.1em"
                color={Colors.SNOW_WHITE}
              >
                {formatUserPointsWithDecimal(
                  get(walletDetails, 'userpoints_details.redeemable_points', 0)
                )}
              </Text>
            )}
          </Flex>
        </Flex>

        {/* TABS */}
        <Tabs
          isLazy
          isFitted
          tabIndex={tabIndex}
          variant="full-rounded"
          onChange={(index) => setTabIndex(index)}
          alignItems="center"
          width="100%"
        >
          <TabList
            width={{ base: '100%', md: '90%', lg: '100%' }}
            bg={Colors.MINE_SHAFT_60}
            mb="20px"
          >
            <Tab _selected={tabSelectedStyle} height="48px">
              Alien Worlds
            </Tab>
            <Tab _selected={tabSelectedStyle} height="48px">
              Community
            </Tab>
          </TabList>

          {/* Alien Worlds Tab Panel */}
          <TabPanels>
            <TabPanel paddingInline={0}>
              <AWNftOffers showRedeemModal={onShowRedeemModal} />
            </TabPanel>

            {/* Community Tab Panel */}
            <TabPanel paddingInline={0}>
              <CommunityNftOffers showRedeemModal={onShowRedeemModal} key={communityTabKey} />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Flex>

      {modalData?.isOpen && (
        <NftRedemptionModal
          nftCardModal={modalData.nftCardModal}
          isOpen={modalData.isOpen}
          pointsRequired={modalData.pointsRequired}
          redeemAction={modalData.redeemAction}
          onClose={closeRedeemModal}
        />
      )}
    </>
  )
}

export { Outpost }
