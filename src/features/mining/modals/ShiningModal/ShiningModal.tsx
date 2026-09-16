import {
  Flex,
  Modal,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  ModalOverlay,
  useBreakpointValue,
} from '@chakra-ui/react'
import ReactPlayer from 'react-player'
import { useModalStore } from 'shared/store/modalStore'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'

export const ShiningModal = () => {
  const {
    main: { setShiningUrl },
  } = useActions()
  const {
    main: { shiningUrl },
  } = useAppState()
  const setPrimaryModalActive = useModalStore((state) => state.setPrimaryModalActive)
  const primaryModals = useModalStore((state) => state.primaryModals)

  const videoPlayerWidth = useBreakpointValue({
    base: '100%',
    sm: '95%',
    md: '85%',
    lg: '70%',
    xl: '60%',
    '2xl': '50%',
  })

  const handleClose = () => {
    setPrimaryModalActive({ modalName: 'ShiningModal', value: false })
    setShiningUrl(null)
  }

  return (
    <Modal
      size="full"
      blockScrollOnMount
      preserveScrollBarGap
      onClose={() => handleClose()}
      isOpen={primaryModals.ShiningModal}
    >
      <ModalOverlay backdropFilter="blur(1px)" />
      <ModalContent background={Colors.BLACK_ALPHA_80} justifyContent="center" alignItems="center">
        <ModalBody alignItems="center" justifyContent="center" p={0} display="flex">
          <Flex
            h="98vh"
            direction="column"
            alignItems="center"
            w={videoPlayerWidth}
            justifyContent="center"
          >
            <ModalCloseButton zIndex={2000} alignSelf="end" position="initial" />
            <ReactPlayer url={shiningUrl} width="100%" height="" playing controls volume={0.05} />
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}
