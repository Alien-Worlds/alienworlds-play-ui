import { AddIcon } from '@alien-worlds/icons'
import { AspectRatio, Box, Center } from '@chakra-ui/react'
import styled from '@emotion/styled/macro'
import { MINING_CARD_HEIGHT_PX, MINING_CARD_WIDTH_PX } from 'features/mining/utils/constants'
import { Colors } from 'shared/util/colors'

const CardWrap = styled(Box)`
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;

  & > div {
    position: absolute;
  }
`

const CardBorder = styled(Box)`
  border: 30px solid;
  border-image: url('/images/alienworlds-db-card-border.svg');
  border-image-repeat: stretch;
  border-image-slice: 50 40 40;
  border-image-width: 40px 30px 30px;
  height: 100%;
  left: 0;
  opacity: 0.2;
  position: absolute;
  top: 0;
  width: 100%;
`

const CardContainer = styled(AspectRatio)`
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 20px;
  display: inline-block;
  height: ${MINING_CARD_HEIGHT_PX}px;
  min-height: ${MINING_CARD_HEIGHT_PX}px;
  overflow: hidden;
  position: relative;
  width: ${MINING_CARD_WIDTH_PX}px;
  box-sizing: border-box;
`

const AddCardToBagPlaceholder = () => {
  return (
    <CardContainer>
      <CardWrap>
        <CardBorder />
        <Center position="absolute">
          <AddIcon boxSize={80} color={Colors.WEB_ORANGE} />
        </Center>
      </CardWrap>
    </CardContainer>
  )
}

export { AddCardToBagPlaceholder }
