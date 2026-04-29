import { ReactNode } from 'react'

export type NftZoomModalProps = {
  isOpen: boolean
  pointsRequired?: number
  userPointsRequired?: number
  onClose: () => void
  redeemAction?: () => void
  hideSubtitle?: boolean
  src: string
}

export type NftRedemptionModalProps = {
  isOpen: boolean
  pointsRequired: number
  nftCardModal: ReactNode
  onClose: () => void
  redeemAction: () => void
}

export type ModalData = Omit<NftRedemptionModalProps, 'onClose'>

export type ShowRedeemModal = (
  nftCardModal: ReactNode,
  offerId: number,
  pointsRequired: number
) => void
