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
  useBreakpointValue,
} from '@alien-worlds/uikit'
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
    <div
      className="flex h-full w-full flex-wrap items-center justify-center gap-[50px] rounded-[25px] p-[30px]"
      style={{ background: Colors.BLACK_SOLID_90 }}
    >
      <div className="flex min-w-[250px] flex-col items-center justify-center md:min-w-[300px] lg:min-w-[600px]">
        <div className="ml-0 flex w-full justify-center gap-[10px] pb-[50px] md:ml-[25px] md:justify-start">
          <ExperienceIcon boxSize={25} color={Colors.GRAY_CHATEAU} />
          <p className="font-tlm text-[18px] font-normal" style={{ color: Colors.GRAY_CHATEAU }}>
            Experience
          </p>
        </div>

        <div className="mb-0 flex w-full justify-center md:-mb-[30px]">
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
        </div>
        <div
          className="w-[80%] border-t border-solid md:w-[95%]"
          style={{ borderColor: Colors.SNOW_WHITE }}
        />
        {/* NEXT REWARD */}
        <div
          className="flex flex-col items-center pt-[25px] md:items-start"
          style={{ opacity: userPoints?.top_level === 10 ? 0 : 1 }}
        >
          <p
            className="mb-[20px] px-[18px] text-center font-orb font-semibold tracking-[0.1em]"
            style={{ fontSize: 'x-large', color: Colors.DI_SERRIA }}
          >
            NEXT Rank NFT Reward
          </p>

          <div className="mb-[20px] flex w-full flex-col">
            {nextLevelReward?.asset?.data?.description && (
              <p className="px-[18px] text-center text-sm font-orb tracking-[0.1em] md:text-left">
                {nextLevelReward.asset.data.description}
              </p>
            )}

            {/* CLAIM REWARD */}
            <div className="flex cursor-default justify-center pt-[30px]">
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
                    <p className="text-[16px] md:text-[20px]">Claim Rank & Reward</p>
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
            </div>
          </div>
        </div>
      </div>
      {/* REWARD NFT CARD */}
      <div className="flex flex-col items-center justify-center">
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
      </div>
    </div>
  )
}
