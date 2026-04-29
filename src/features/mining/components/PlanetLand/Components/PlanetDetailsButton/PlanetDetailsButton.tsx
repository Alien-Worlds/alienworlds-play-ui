import { InfoIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Flex, Text } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'

const PlanetDetailsButton = ({ onClick, ...props }) => {
  return (
    <Flex mb={{ base: '25px', md: '0px' }}>
      <Button
        variant="hydrogen"
        size="sm"
        borderRadius="25px"
        height="30px"
        paddingBlock="20px"
        leftIcon={<InfoIcon boxSize={20} />}
        border={`2px solid ${Colors.SNOW_WHITE}`}
        background={Colors.BLACK_SOLID_100}
        _hover={{
          color: Colors.BLACK_SOLID_100,
          background: Colors.SNOW_WHITE,
        }}
        onClick={onClick}
        {...props}
      >
        <Text fontFamily="orb">Details</Text>
      </Button>
    </Flex>
  )
}

export { PlanetDetailsButton }
