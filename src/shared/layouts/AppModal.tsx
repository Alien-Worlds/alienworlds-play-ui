import { Modal, ModalBody, ModalContent, ModalOverlay } from '@chakra-ui/react'
import { css, Global } from '@emotion/react'

const AppModal = ({ children, isOpen, onClose }: { children?; isOpen; onClose }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <Global
        styles={css`
          #missions-layout,
          #missions-header {
            filter: blur(3px);
          }
        `}
      />
      <ModalOverlay
        backgroundColor="rgba(30,30,30,.9)"
        _after={{
          content: "''",
          display: 'block',
          top: 0,
          left: 0,
          width: 'full',
          height: 'full',
          zIndex: 0,
          background:
            'radial-gradient(ellipse at center, rgba(51,51,51,.8) 0%,rgba(33,33,33,0) 100%)',
        }}
      />
      <ModalContent backgroundColor="transparent" maxW="1000px" shadow={0}>
        <ModalBody backgroundColor="transparent" maxW="1000px">
          {children}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default AppModal
