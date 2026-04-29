import { Button } from '@alien-worlds/uikit'
import { AspectRatio, Box, Flex, Link, VStack, useBreakpointValue } from '@chakra-ui/react'
import styled from '@emotion/styled/macro'
import { Colors } from 'shared/util/colors'
import { ArenaPortalDevItemType } from 'features/arena/pages/Arena'

type ArenaPortalDevItemProps = {
  data: ArenaPortalDevItemType
}

const CardWrap = styled(Box)`
  height: 100%;
  left: 0;
  position: absolute;
  top: 0;
  width: 100%;
`

const CardBorder = styled(Box)`
  border: 30px solid;
  border-image: url('/images/alienworlds-db-card-border.svg');
  border-image-repeat: stretch;
  border-image-slice: 50 40 40;
  border-image-width: 10px 15px 15px;
  height: 100%;
  left: 0;
  opacity: 0.3;
  position: absolute;
  top: 0;
  width: 100%;
`

const CardContainer = styled(AspectRatio)`
  background-color: rgba(0, 0, 0, 1);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;
`

export const ArenaPortalDevItem = ({ data }: ArenaPortalDevItemProps) => {
  const currentButtonSize = useBreakpointValue({ base: '90%', sm: '100%' })
  return (
    <CardContainer height={{ base: '650px', sm: '600px', md: '100%', xl: '600px' }}>
      <CardWrap>
        <CardBorder />
        <VStack
          backgroundColor={Colors.BLACK_SOLID_65}
          borderRadius="20px 20px 0 0"
          width="100%"
          height="inherit"
          justifyContent="space-between"
        >
          <VStack
            bgImage={`url(${data.image})`}
            bgPosition="center"
            bgRepeat="no-repeat"
            w="full"
            h="290px"
            minHeight="215px"
            justifyContent="flex-end"
            borderRadius="20px 20px 0 0"
            backgroundSize="cover"
          >
            <Flex width="full" py={6} background={Colors.ARENA_PORTAL_ITEM_GRADIENT} />
          </VStack>

          <VStack p="24px" w="100%">
            <Flex
              px="15px"
              fontSize={{ base: 32, md: 24, lg: 32 }}
              fontFamily="orb"
              whiteSpace="pre-line"
              letterSpacing="0.1em"
              alignSelf="flex-start"
            >
              {data.title}
            </Flex>

            <Flex fontSize={14} pb={8} px="15px" fontFamily="tlm" w="100%">
              {data.description}
            </Flex>

            <Flex w="full" textAlign="center" pb="15px">
              <Link href={data.url} target="_blank" w="full">
                <Button
                  size="lg"
                  variant="primary"
                  isFullWidth
                  fontSize={22}
                  maxWidth={currentButtonSize}
                >
                  Join Now
                </Button>
              </Link>
            </Flex>
          </VStack>
        </VStack>
      </CardWrap>
    </CardContainer>
  )
}
