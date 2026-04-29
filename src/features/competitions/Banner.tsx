import { Button } from '@alien-worlds/uikit'
import { Box, Flex, Image, Text } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'

export const Banner = () => {
  return (
    <Box
      backgroundColor={Colors.AZTEC}
      borderRadius="20px"
      width="100%"
      height="256px"
      position="relative"
    >
      <Flex
        position="absolute"
        background="radial-gradient(50% 50% at 50% 50%, rgba(170, 51, 2, 0.50) 0%, rgba(170, 51, 2, 0.00) 100%)"
        width="531px"
        height="256px"
        flexShrink={0}
        left={-100}
        top={10}
      ></Flex>
      <Flex
        position="absolute"
        right={0}
        bgImage="linear-gradient(270deg, #000 -11.88%, rgba(0, 0, 0, 0.00) 15.62%), linear-gradient(180deg, rgba(0, 0, 0, 0.00) 0%, #000 93.02%), url(images/tournament/join-bg-1.png)"
        bgPosition="-2.507px -0.105px"
        bgSize="100.833% 100.072%"
        bgRepeat="no-repeat"
        width="501px"
        height="256px"
        borderRightRadius="20px"
      ></Flex>
      <Image
        position="absolute"
        right="50px"
        src="images/tournament/join-bg-nft.png"
        width="253px"
        height="246px"
      ></Image>
      <Flex flexDirection="column" maxW="50%" mt="20px">
        <Text
          ml={12}
          mt={4}
          color={Colors.SNOW_WHITE}
          fontFamily="orbitron"
          fontSize="24px"
          fontWeight={800}
        >
          Register for Alien Worlds competition now!
        </Text>
        <Text
          ml={12}
          mt={4}
          color={Colors.SNOW_WHITE}
          fontFamily="Titillium Web"
          fontSize="16px"
          fontWeight={400}
        >
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt
          ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet
        </Text>
        <Button
          marginTop="20px"
          marginLeft="40px"
          size={'md'}
          maxWidth="40%"
          variant="negative"
          isFullWidth={false}
        >
          Join Now
        </Button>
      </Flex>
    </Box>
  )
}
