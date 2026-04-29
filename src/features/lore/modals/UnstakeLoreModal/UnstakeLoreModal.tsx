import { Button } from '@alien-worlds/uikit'
import { useApolloClient } from '@apollo/client'
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Text,
  Flex,
  ModalOverlay,
} from '@chakra-ui/react'
import { WALLET_DETAILS_QUERY_ALL } from 'graphql/queries/walletDetails'
import { Colors } from 'shared/util/colors'
import { useActions, useAppState } from 'store'
const UnstakeLoreModal = () => {
  const {
    modal: { secondaryModals },
  } = useAppState()
  const client = useApolloClient()
  const {
    modal: { setSecondaryModalActive },
    wax: { tryUnStakeLore },
  } = useActions()

  const handleClose = () => {
    setSecondaryModalActive({ modalName: 'UnstakeAllLoreModal', value: false })
  }

  return (
    <Modal
      size="md"
      isOpen={secondaryModals.UnstakeAllLoreModal}
      onClose={() => handleClose()}
      isCentered
    >
      <ModalOverlay />
      <ModalContent
        background={Colors.BLACK_SOLID_90}
        justifyContent="center"
        style={{
          border: 'double 1px transparent',

          borderRadius: '20px',
          backgroundImage:
            'linear-gradient(#100F10, #100F10), linear-gradient(to bottom, #9C33B6, #4F60BC,#4657A5, #009BD4)',
          backgroundOrigin: 'border-box',
          backgroundClip: 'content-box, border-box',
        }}
      >
        <ModalCloseButton />
        <ModalBody padding="40px">
          <Flex flexDirection="column" gap={4}>
            <Text fontFamily="tlm" fontSize="24px" fontWeight={600}>
              Unstake All
            </Text>
            <Text fontFamily="tlm" fontSize="16px" fontWeight={400} color={Colors.JUMBO}>
              By unstaking, you will lose all your vote power instantly. Your unstaked TLM will be
              available straight away.
            </Text>
            <Button
              size="lg"
              variant="alert"
              fontSize={18}
              onClick={async () => {
                await tryUnStakeLore()
                await client.refetchQueries({ include: [WALLET_DETAILS_QUERY_ALL] })
              }}
            >
              Unstake All TLM
            </Button>
            <Button size="lg" variant="info" fontSize={18} onClick={() => handleClose()}>
              Cancel
            </Button>
          </Flex>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
  return null
}

export { UnstakeLoreModal }
