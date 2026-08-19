import React, { useEffect, useState, useCallback, useMemo } from 'react'

import { ShardsIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Dialog, DialogPanel } from '@headlessui/react'
import outpostNFTPointsMappings from 'assets/data/outpostNFTPointsMappings.json'
import { map, replace, toNumber } from 'lodash'
import { Colors } from 'shared/util/colors'
import { formatUserPointsWithDecimal } from 'shared/util/helpers'
import { useActions, useAppState } from 'store'
import { OutpostNFTPointsClaim } from 'store/wax/types'

const OldNFTClaimModal = React.memo(() => {
  const {
    wax: { nftsToClaimTemplates },
    modal: { secondaryModals },
  } = useAppState()

  const {
    wax: { claimNftPts },
    modal: { setSecondaryModalActive },
  } = useActions()

  const [totalPoints, setTotalPoints] = useState('')

  const handleClose = useCallback(() => {
    setSecondaryModalActive({ modalName: 'OldNFTClaimModal', value: false })
  }, [setSecondaryModalActive])

  const handleSubmit = useCallback(() => {
    claimNftPts()
    setSecondaryModalActive({ modalName: 'OldNFTClaimModal', value: false })
  }, [claimNftPts, setSecondaryModalActive])

  useEffect(() => {
    let total: number = 0
    map(outpostNFTPointsMappings, (mapping: OutpostNFTPointsClaim) => {
      for (let i = 0; i < nftsToClaimTemplates.length; i += 1) {
        if (toNumber(nftsToClaimTemplates[i]) === toNumber(mapping.templateId)) {
          total += toNumber(replace(mapping.points10x, ',', ''))
        }
      }
    })
    setTotalPoints(formatUserPointsWithDecimal(total * 1.3))
  }, [nftsToClaimTemplates])

  return useMemo(() => {
    return (
      <Dialog
        open={!!secondaryModals.OldNFTClaimModal}
        onClose={handleClose}
        className="relative z-[1400]"
      >
        <div
          className="fixed inset-0 backdrop-blur-[10px]"
          style={{ backgroundColor: Colors.BLACK_ALPHA_40 }}
          aria-hidden="true"
        />
        <div className="fixed inset-0 flex w-screen items-center justify-center p-4">
          <DialogPanel
            className="relative w-full max-w-xl rounded-md"
            style={{
              border: `3px solid ${Colors.DI_SERRIA}`,
              background: Colors.OUTPOST_CLAIMNFTS_BG_GRADIENT,
            }}
          >
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              style={{ zIndex: 2000 }}
              className="absolute right-3 top-2 text-3xl leading-none text-white md:-mr-[50px] md:-mt-[50px]"
            >
              &times;
            </button>
            <div className="flex max-w-full flex-col items-center justify-center gap-4 p-12 text-center">
              <p className="font-orb text-[48px]" style={{ color: Colors.SNOW_WHITE }}>
                Hello Explorer!
              </p>
              <div className="flex items-center gap-4">
                <ShardsIcon boxSize="42px" color={Colors.DI_SERRIA} />
                <div className="flex flex-col items-center justify-center gap-0">
                  <p className="text-[18px] font-bold" style={{ color: Colors.DI_SERRIA }}>
                    Shards
                  </p>
                  <p className="font-orb text-[30px]">{totalPoints}</p>
                </div>
              </div>
              <p className="text-[18px]">
                You have{' '}
                <span style={{ color: Colors.DI_SERRIA, fontWeight: 'bold' }}>
                  {nftsToClaimTemplates.length} NFT claims
                </span>{' '}
                that are no longer available. Convert them to
                <span style={{ color: Colors.DI_SERRIA, fontWeight: 'bold' }}>
                  {' '}
                  {totalPoints} Shards
                </span>{' '}
                to be used <br /> in the NFT Outpost.
              </p>
              <p className="text-[18px]">
                Sorry for the inconvenience, we have added a <br />
                <span style={{ color: Colors.DI_SERRIA, fontWeight: 'bold' }}>30% Bonus</span> to
                the converted Shards.
              </p>
              <Button fontSize={20} variant="primary" size="lg" isFullWidth onClick={handleSubmit}>
                Get Shards
              </Button>
            </div>
          </DialogPanel>
        </div>
      </Dialog>
    )
  }, [secondaryModals, handleClose, totalPoints, nftsToClaimTemplates.length, handleSubmit])
})

export { OldNFTClaimModal }
