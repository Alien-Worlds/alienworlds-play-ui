import { FC } from 'react'

import { LandIcon2, MiningIcon, NFTOldIcon } from '@alien-worlds/icons'
import { Box } from '@chakra-ui/react'
import styled from '@emotion/styled'
import { IAsset } from 'atomicassets/build/API/Explorer/Objects'
import { isNumber } from 'lodash'
import { Colors } from 'shared/util/colors'

const CardIconWrap = styled(Box)`
  align-items: center;
  display: flex;
  font-family: 'Orbitron';
  font-size: 14px;
  font-weight: 700;
  vertical-align: middle;
  white-space: normal;
  width: 33.33%;
`

const CardIcon = styled(Box)`
  display: inline-block;
  width: 20px;
  color: ${Colors.DARK_YELLOW};
  margin-right: 5px;
  margin-left: 5px;
`

export const CardIcons: FC<{ land: IAsset }> = ({ land }) => {
  if (!land) return <></>

  return (
    <Box display="flex" width="max-content">
      <CardIconWrap marginRight="20px">
        <CardIcon>
          <MiningIcon height="20px" width="20px" />
        </CardIcon>
        {isNumber(land.data?.ease) ? land.data?.ease / 10 : ''}
      </CardIconWrap>
      <CardIconWrap marginRight="20px">
        <CardIcon>
          <LandIcon2 height="20px" width="20px" />
        </CardIcon>
        {land.data?.difficulty}
      </CardIconWrap>
      <CardIconWrap marginRight="20px">
        {isNumber(land.data?.luck) ? land.data.luck / 10 : ''}
        <CardIcon>
          <NFTOldIcon height="20px" width="20px" />
        </CardIcon>
      </CardIconWrap>
    </Box>
  )
}
