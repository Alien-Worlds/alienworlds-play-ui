import { Modal, ModalBody, ModalContent, ModalOverlay, useMediaQuery } from '@chakra-ui/react'
import { css, Global } from '@emotion/react'

const AppModalNew = ({ children, isOpen, onClose }) => {
  const [isLargerThanDesktop, isLargerThanTablet] = useMediaQuery([
    '(min-width: 1600px)',
    '(min-width: 920px)',
  ])

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
      <ModalContent
        maxWidth={isLargerThanDesktop ? '35%' : isLargerThanTablet ? '50%' : '100%'}
        overflow="hidden"
        letterSpacing="2px"
        background="transparent"
        _after={{
          content: "''",
          width: '100%',
          height: '100%',
          position: 'absolute',
          boxShadow: 'inset 0 0 200px rgb(33 33 33 / 90%)',
          zIndex: 0,
          background: 'linear-gradient(45deg, #120E49 0%,#000000 67%,#000000 67%,#7C153C 100%)',
          filter: 'blur(70px)',
          opacity: 0.9,
        }}
      >
        <ModalBody backgroundColor="transparent" zIndex={1}>
          {children}
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default AppModalNew
