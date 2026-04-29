import { memo } from 'react'

import {
  NFTCard,
  NFTCardBottomPanel,
  NFTCardDetailsPanel,
  NFTCardTopRightPanel,
  NFTImage,
  NFTInUseButton,
  NFTOverlayPanel,
  NFTPlanetComission,
} from '@alien-worlds/uikit'
import { NFTCardTypes } from 'features/inventory/utils/NFTCardHelper'
import {
  NFTCardBottomPanelRender,
  NFTCardDetailPanelRender,
  NFTCardOverlayRender,
  NFTCardTopRightPanelRender,
} from 'features/inventory/utils/NFTCardOverlayRender'
import { get } from 'lodash'

interface MiningNFTCardProps {
  asset: NFTCardTypes
  showInUseButton?: boolean
  inUseDisabled?: boolean
  inUseAltText?: string
  showOverlay?: boolean
  commissionDisabled?: boolean
}

const MiningNFTCardComponent = ({
  asset,
  showInUseButton = false,
  inUseDisabled = true,
  inUseAltText,
  showOverlay = false,
  commissionDisabled = false,
}: MiningNFTCardProps) => {
  return (
    <NFTCard title={asset.type.name} shine={asset.shine.name} rarity={asset.rarity.name} animate>
      {showInUseButton && (
        <NFTInUseButton altText={inUseAltText} onClick={() => null} disable={inUseDisabled} />
      )}
      <NFTCardTopRightPanel>
        <NFTCardTopRightPanelRender asset={asset} />
      </NFTCardTopRightPanel>
      <NFTImage hideInnerRing={asset.disableInnerRing} src={asset.nftImage.name} />
      <NFTCardDetailsPanel>
        <NFTCardDetailPanelRender asset={asset} />
      </NFTCardDetailsPanel>
      <NFTCardBottomPanel>
        <NFTCardBottomPanelRender asset={asset} />
      </NFTCardBottomPanel>
      <NFTPlanetComission disable={commissionDisabled} label={get(asset, 'commission.name', '')} />
      {showOverlay && (
        <NFTOverlayPanel>
          <NFTCardOverlayRender asset={asset} />
        </NFTOverlayPanel>
      )}
    </NFTCard>
  )
}

export const MiningNFTCard = memo(MiningNFTCardComponent)
