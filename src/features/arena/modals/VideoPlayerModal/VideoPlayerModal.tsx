import React, { useEffect, useState } from 'react'

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalCloseButton,
  ModalOverlay,
  Flex,
  useBreakpointValue,
} from '@chakra-ui/react'
import ReactPlayer from 'react-player'
import { Colors } from 'shared/util/colors'
import { useAppState, useActions } from 'store'

const VideoPlayerModal = () => {
  const {
    modal: { secondaryModals },
  } = useAppState()

  const {
    modal: { setSecondaryModalActive },
  } = useActions()

  const [videoEmbedUrl, setVideoEmbedUrl] = useState<string>('')
  const videoPlayerWidth = useBreakpointValue({
    base: '100%',
    sm: '95%',
    md: '85%',
    lg: '70%',
    xl: '60%',
    '2xl': '50%',
  })

  const videoPlayerHeight = useBreakpointValue({
    base: '300px',
    sm: '400px',
    md: '400px',
    lg: '640px',
    xl: '640px',
    '2xl': '640px',
  })

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
    <Modal
      isCentered
      size="full"
      autoFocus={false}
      blockScrollOnMount
      preserveScrollBarGap
      onClose={() => handleClose()}
      isOpen={secondaryModals.VideoPlayerModal}
    >
      <ModalOverlay backdropFilter="blur(1px)" />
      <ModalContent background={Colors.BLACK_ALPHA_80} justifyContent="center" alignItems="center">
        <ModalBody
          p={0}
          w="100%"
          h="100%"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Flex
            h="98vh"
            direction="column"
            alignItems="center"
            w={videoPlayerWidth}
            justifyContent="center"
          >
            <ModalCloseButton zIndex={2000} alignSelf="end" position="initial" />
            <ReactPlayer
              playing
              controls
              width="100%"
              volume={0.2}
              url={videoEmbedUrl}
              height={videoPlayerHeight}
            />
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export { VideoPlayerModal }
