import { useEffect, useState } from 'react'

import { Dialog, DialogPanel } from '@headlessui/react'
import ReactPlayer from 'react-player'
import { useAppState, useActions } from 'store'

const VideoPlayerModal = () => {
  const {
    modal: { secondaryModals },
  } = useAppState()

  const {
    modal: { setSecondaryModalActive },
  } = useActions()

  const [videoEmbedUrl, setVideoEmbedUrl] = useState<string>('')

  const handleClose = () => {
    setSecondaryModalActive({ modalName: 'VideoPlayerModal', value: false })
  }

  useEffect(() => {
    if (typeof secondaryModals.onConfirm === 'function') {
      // @TODO drop the typecast and refactor when our modals will support passing custom content
      let url = secondaryModals.onConfirm() as unknown as string

      // Set autoplay if it is a youtube video
      if (url.indexOf('youtube') > -1) {
        url = `${url}?autoplay=1`
      }
      setVideoEmbedUrl(url)
    }
  }, [secondaryModals.onConfirm])

  return (
    <Dialog
      open={!!secondaryModals.VideoPlayerModal}
      onClose={handleClose}
      // Chakra's theme sets zIndices.modal/topbar to 20000/21000 (see shared/styles/theme.ts),
      // so the persistent sidebar and top bar would otherwise render above this Tailwind dialog.
      className="relative z-[30000]"
    >
      <div className="fixed inset-0 bg-[rgba(0,0,0,0.8)] backdrop-blur-[1px]" aria-hidden="true" />
      <div className="fixed inset-0 flex w-screen items-center justify-center bg-[rgba(0,0,0,0.8)]">
        <DialogPanel className="flex h-full w-full items-center justify-center p-0">
          <div className="flex h-[98vh] w-full flex-col items-center justify-center sm:w-[95%] md:w-[85%] lg:w-[70%] xl:w-3/5 2xl:w-1/2">
            <button
              type="button"
              onClick={handleClose}
              aria-label="Close"
              className="z-[2000] self-end p-2 text-2xl leading-none text-white"
            >
              &times;
            </button>
            <div className="h-[300px] w-full sm:h-[400px] lg:h-[640px]">
              <ReactPlayer
                playing
                controls
                width="100%"
                height="100%"
                volume={0.2}
                url={videoEmbedUrl}
              />
            </div>
          </div>
        </DialogPanel>
      </div>
    </Dialog>
  )
}

export { VideoPlayerModal }
