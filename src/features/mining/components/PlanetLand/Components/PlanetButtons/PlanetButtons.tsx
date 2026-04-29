import { VFC, useState } from 'react'

import { InfoIcon, MiningIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Flex, FlexProps, useMediaQuery } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'

export interface PlanetButtonProps {
  onExploreBtnClick?: () => void
  onDetailsBtnClick?: () => void
}

const PlanetButtons: VFC<PlanetButtonProps & FlexProps> = ({
  onExploreBtnClick,
  onDetailsBtnClick,
}) => {
  const [isLargerThan1280] = useMediaQuery('(min-width: 1280px)')
  const [isLargerThan480] = useMediaQuery('(min-width: 480px)')
  const [isShown, setIsShown] = useState<boolean>(false)

  return (
    <Flex
      position={isLargerThan1280 ? 'absolute' : 'relative'}
      bottom={isLargerThan1280 ? 0 : undefined}
      left={isLargerThan1280 ? 0 : undefined}
      w="100%"
      h={isLargerThan1280 ? 'full' : 'fit-content'}
      paddingInline={isLargerThan480 && '45px'}
      justifyContent="flex-end"
      alignItems="center"
      pt={{ base: '35px', sm: '50px' }}
      pb={12}
      zIndex={2000}
      onMouseEnter={() => setIsShown(true)}
      onMouseLeave={() => setIsShown(false)}
    >
      <Flex
        direction="column"
        gap="10px"
        width="100%"
        justifyContent="center"
        opacity={!isLargerThan1280 || isShown ? 1 : 0}
        pointerEvents={!isLargerThan1280 || isShown ? 'auto' : 'none'}
        transition="opacity 0.3s ease"
      >
        <Button
          width="100%"
          size="sm"
          variant="warning"
          leftIcon={<MiningIcon boxSize={20} />}
          onClick={onExploreBtnClick}
          isFullWidth={!isLargerThan480}
          border={`2px solid ${Colors.SNOW_WHITE}`}
          minWidth={!isLargerThan480 && '250px !important'}
          minHeight="36px !important"
        >
          Explore
        </Button>
        <Button
          width="100%"
          size="sm"
          variant="info"
          leftIcon={<InfoIcon boxSize={20} />}
          backgroundColor={Colors.TRANSPARENT}
          onClick={onDetailsBtnClick}
          isFullWidth={!isLargerThan480}
          border={`2px solid ${Colors.SNOW_WHITE}`}
          minWidth={!isLargerThan480 && '250px !important'}
          minHeight="36px !important"
        >
          Details
        </Button>
      </Flex>
    </Flex>
  )
}

export { PlanetButtons }
