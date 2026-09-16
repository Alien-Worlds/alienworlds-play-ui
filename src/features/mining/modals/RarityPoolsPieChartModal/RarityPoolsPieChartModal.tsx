import { Modal, ModalBody, ModalCloseButton, ModalContent, ModalOverlay } from '@chakra-ui/react'
import { RarityPoolsPieChart } from 'features/mining/components/RarityPoolsPieChart'
import { useRarityPools } from 'features/mining/hooks/useRarityPools'
import { useModalStore } from 'shared/store/modalStore'
import { Colors } from 'shared/util/colors'
import { dacIdToDacTreasuryAccountList } from 'shared/util/helpers'
import { useAppState } from 'store'

const RarityPoolsPieChartModal = () => {
  const setPrimaryModalActive = useModalStore((state) => state.setPrimaryModalActive)
  const primaryModals = useModalStore((state) => state.primaryModals)
  const {
    wax: { planetSelectedForMining, whereToMineIntent },
  } = useAppState()

  const id = whereToMineIntent
    ? dacIdToDacTreasuryAccountList[whereToMineIntent]
    : dacIdToDacTreasuryAccountList[planetSelectedForMining]

  const { data: rarityPools } = useRarityPools(id)

  const handleClose = () => {
    setPrimaryModalActive({ modalName: 'RarityPoolsPieChartModal', value: false })
  }

  return (
    <Modal
      size="full"
      onClose={() => handleClose()}
      isOpen={primaryModals.RarityPoolsPieChartModal}
    >
      <ModalOverlay />
      <ModalContent
        display="flex"
        alignItems="center"
        justifyContent="center"
        py={0}
        background={Colors.BLACK_SOLID_90}
      >
        <ModalBody
          display="flex"
          alignItems={{ base: 'flex-start', md: 'center' }}
          justifyContent="center"
          py="20px"
          px="18px"
        >
          <RarityPoolsPieChart rarityPools={rarityPools} />
          <ModalCloseButton
            fontSize="md"
            position={{ base: 'absolute', md: 'relative' }}
            top={{ base: 4, md: '-72' }}
          />
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export { RarityPoolsPieChartModal }
