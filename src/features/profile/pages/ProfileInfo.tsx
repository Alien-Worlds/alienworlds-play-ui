import React, { useEffect, useMemo, useState } from 'react'

import { ExperienceIcon } from '@alien-worlds/icons'
import {
  Button,
  NFTCard,
  NFTImage,
  NFTOverlayPanel,
  NFTPlanetComission,
  NFTCardBottomPanel,
  NFTCardDetailsPanel,
  NFTCardTopRightPanel,
} from '@alien-worlds/uikit'
import { Divider, Flex, Text, useBreakpointValue } from '@chakra-ui/react'
import { NFTCardSingleCardPrep, NFTCardTypes } from 'features/inventory/utils/NFTCardHelper'
import {
  NFTCardOverlayRender,
  NFTCardBottomPanelRender,
  NFTCardDetailPanelRender,
  NFTCardTopRightPanelRender,
} from 'features/inventory/utils/NFTCardOverlayRender'
import { useRedeemLevelNftOffer } from 'features/outpost/hooks/mutations/useRedeemLevelNftOffer'
import { useLevelNftRewards } from 'features/outpost/hooks/queries/useLevelNftRewards'
import { NftZoomModal } from 'features/outpost/modals/NftZoomModal/NftZoomModal'
import { UserPointProgressBar } from 'features/profile/components/UserPointProgressBar'
import { LoadingSpinner } from 'features/syndicates/components/LoadingSpinner/LoadingSpinner'
import { useWalletDetails } from 'graphql/hooks/useWalletDetails'
import { WalletDetailsResponse } from 'graphql/types'
import _ from 'lodash'
import { Colors } from 'shared/util/colors'
import { formatUserPointsWithDecimal } from 'shared/util/helpers'
import { useActions, useAppState } from 'store'

export const ProfileInfo = () => {
  const {
    wax: { walletId, isDemoUser },
  } = useAppState()
  const {
    modal: { setPrimaryModalActive },
    main: { setOutPostModalsActive },
  } = useActions()

  const { walletDetails, loading }: { walletDetails: WalletDetailsResponse; loading: boolean } =
    useWalletDetails(walletId)

  const { currentLevelReward, nextLevelReward } = useLevelNftRewards()
  const { mutate: redeemLevelOfferAction, isLoading: isLoadingRedeemLevelOffer } =
    useRedeemLevelNftOffer()
  const [asset, setNextAsset] = useState<NFTCardTypes | null>(null)
  const [currentPointsCapped, setCurrentPointsCapped] = useState<number>(0)
  const [showZoomModal, setShowZoomModal] = useState(false)

  const {
    main: { showProfileInfoPage },
  } = useActions()
  const currentButtonWidth = useBreakpointValue({ base: '90%', md: '95%' })

  // Handle the "overflow" case when user has more points than the next level requires
  const userPoints = walletDetails?.userpoints_details

  useMemo(() => {
    if (userPoints && nextLevelReward) {
      const capped =
        userPoints?.total_points > nextLevelReward?.required
          ? nextLevelReward?.required
          : userPoints?.total_points
      setNextAsset(NFTCardSingleCardPrep(nextLevelReward.asset, walletId))
      setCurrentPointsCapped(capped)
    }
  }, [userPoints, nextLevelReward])

  useEffect(() => {
    showProfileInfoPage()
  }, [])
  if (loading) return <LoadingSpinner />
  return (
    <Flex
      w="100%"
      h="100%"
      p="30px"
      gap="50px"
      align="center"
      flexWrap="wrap"
      justify="center"
      borderRadius="25px"
      background={Colors.BLACK_SOLID_90}
    >
      <Flex
        align="center"
        justify="center"
        direction="column"
        minW={{ base: '250px', md: '300px', lg: '600px' }}
      >
        <Flex
          w="100%"
          pb="50px"
          gap="10px"
          ml={{ base: '0px', md: '25px' }}
          justifyContent={{ base: 'center', md: 'start' }}
        >
          <ExperienceIcon boxSize={25} color={Colors.GRAY_CHATEAU} />
          <Text color={Colors.GRAY_CHATEAU} fontFamily="tlm" fontSize="18px" fontWeight={400}>
            Experience
          </Text>
        </Flex>

        <Flex w="100%" mb={{ base: '0px', md: '-30px' }} justifyContent="center">
          {/* POINTS PROGRESS BAR */}
          {currentLevelReward && (
            <UserPointProgressBar
              value={
                userPoints?.top_level === 10 ? currentLevelReward?.required : currentPointsCapped
              }
              total={
                userPoints?.top_level === 10
                  ? currentLevelReward?.required
                  : nextLevelReward?.required
              }
              nextRank={nextLevelReward?.level}
              currentRank={currentLevelReward?.level}
            />
          )}
        </Flex>
        <Divider
          border="1px solid"
          borderColor={Colors.SNOW_WHITE}
          w={{ base: '80%', md: '95%' }}
        />
        {/* NEXT REWARD */}
        <Flex
          pt="25px"
          flexDirection="column"
          alignItems={{ base: 'center', md: 'start' }}
          opacity={userPoints?.top_level === 10 ? 0 : 1}
        >
          <Text
            mb="20px"
            fontFamily="orb"
            fontSize="x-large"
            textAlign="center"
            paddingInline="18px"
            letterSpacing="0.1em"
            fontWeight="semibold"
            color={Colors.DI_SERRIA}
          >
            NEXT Rank NFT Reward
          </Text>

          <Flex w="100%" mb="20px" direction="column">
            {nextLevelReward?.asset?.data?.description && (
              <Text
                fontSize="sm"
                fontFamily="orb"
                paddingInline="18px"
                letterSpacing="0.1em"
                textAlign={{ base: 'center', md: 'start' }}
              >
                {nextLevelReward.asset.data.description}
              </Text>
            )}

            {/* CLAIM REWARD */}
            <Flex justifyContent="center" pt="30px" cursor="default">
              {!isLoadingRedeemLevelOffer &&
                userPoints?.total_points >= nextLevelReward?.required && (
                  <Button
                    size="lg"
                    isFullWidth
                    variant="primary"
                    width={currentButtonWidth}
                    onClick={() =>
                      isDemoUser
                        ? setPrimaryModalActive({ modalName: 'LoginModal', value: true })
                        : redeemLevelOfferAction({ levelOfferId: nextLevelReward.id })
                    }
                  >
                    <Text fontSize={{ base: 16, md: 20 }}>Claim Rank & Reward</Text>
                  </Button>
                )}

              {!isLoadingRedeemLevelOffer &&
                userPoints?.total_points < nextLevelReward?.required && (
                  <Button
                    size="lg"
                    isFullWidth
                    fontSize={20}
                    variant="primary"
                    color={Colors.LOBLOLLY}
                  >
                    {formatUserPointsWithDecimal(
                      nextLevelReward?.required - userPoints?.total_points
                    )}{' '}
                    EXP to go
                  </Button>
                )}

              {isLoadingRedeemLevelOffer && (
                <Button size="lg" disabled isLoading isFullWidth fontSize={20} variant="primary">
                  Claiming
                </Button>
              )}
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      {/* REWARD NFT CARD */}
      <Flex direction="column" align="center" justify="center">
        {asset && (
          <NFTCard title={asset.type?.name} rarity={asset.rarity?.name} shine="stone" animate>
            <NFTCardTopRightPanel>
              <NFTCardTopRightPanelRender asset={asset} />
            </NFTCardTopRightPanel>
            <NFTImage hideInnerRing={asset.disableInnerRing} src={asset.nftImage?.name} />
            <NFTCardDetailsPanel>
              <NFTCardDetailPanelRender asset={asset} />
            </NFTCardDetailsPanel>
            <NFTCardBottomPanel>
              <NFTCardBottomPanelRender asset={asset} />
            </NFTCardBottomPanel>
            <NFTPlanetComission
              disable={asset.type?.name !== 'Land'}
              label={_.get(asset, 'commission.name', '')}
            />
            <NFTOverlayPanel>
              <NFTCardOverlayRender
                asset={asset}
                zoom={() => {
                  setOutPostModalsActive(true)
                  setShowZoomModal(true)
                }}
              />
            </NFTOverlayPanel>
          </NFTCard>
        )}
        {showZoomModal && (
          <NftZoomModal
            isOpen={showZoomModal}
            src={nextLevelReward?.asset?.data?.img}
            userPointsRequired={nextLevelReward.required}
            onClose={() => {
              setOutPostModalsActive(false)
              setShowZoomModal(false)
            }}
          />
        )}
      </Flex>
    </Flex>
  )
}
