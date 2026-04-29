import { RightArrowIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import {
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  DrawerBody,
  Flex,
  Box,
  Divider,
  Text,
  Input,
  Icon,
} from '@chakra-ui/react'
import { GlossaryListCategories } from 'features/glossary/components/GlossaryListCategories/GlossaryListCategories'
import ScrollContainer from 'react-indiana-drag-scroll'
import { Colors } from 'shared/util/colors'
import { useScreenSize } from 'shared/util/hooks'
import { useActions, useAppState } from 'store'

import { GlossaryDetails } from '../GlossaryDetails/GlossaryDetails'
import { GlossaryList } from '../GlossaryList/GlossaryList'

const GlossaryDrawer = () => {
  const {
    main: { glossaryDrawer },
  } = useAppState()

  const {
    main: { glossary: glossaryAction },
  } = useActions()

  const { isMobile } = useScreenSize()
  const isMobileAndNoArticleSelected = isMobile && !glossaryDrawer.contentDetails

  const ContentDetails = () => {
    if (glossaryDrawer.contentDetails) {
      return (
        <Flex direction="column" width="full">
          {isMobile && (
            <Button
              onClick={() => glossaryAction.resetGlossaryDrawerContentDetails()}
              variant="dark"
              marginTop={5}
              gap={3}
              size="sm"
              fontFamily="Titillium Web"
              leftIcon={
                <Icon as={RightArrowIcon} transform="rotate(180deg)" fill={Colors.SNOW_WHITE} />
              }
              width={100}
              left="-15px"
            >
              Back
            </Button>
          )}

          <Flex pt={8} pb={5} maxHeight={isMobile ? '82vh' : 'calc(100vh - 110px)'} width="full">
            <GlossaryDetails />
          </Flex>
        </Flex>
      )
    }

    return null
  }

  return (
    <Drawer
      size={glossaryDrawer.contentDetails ? 'xl' : 'lg'}
      placement="right"
      isOpen={glossaryDrawer.isOpen}
      onClose={() => glossaryAction.closeGlossaryDrawer()}
      preserveScrollBarGap
    >
      <DrawerOverlay />
      <DrawerContent
        sx={{
          padding: 5,
          borderRadius: 3.5,
          background: Colors.BLACK_SOLID_100,
        }}
      >
        <DrawerCloseButton fontSize="lg" right={10} top={8} />

        <DrawerBody>
          <Flex direction="column">
            <Text fontWeight={400} fontSize="2xl">
              Glossary
            </Text>

            <Flex flexShrink={0} gap={8}>
              <Box
                flexShrink={0}
                width={glossaryDrawer.contentDetails ? 80 : 'full'}
                display={!isMobile || isMobileAndNoArticleSelected ? 'block' : 'none'}
              >
                <Flex
                  direction="column"
                  gap={3}
                  mt={9}
                  color={Colors.LOBLOLLY}
                  fontWeight={600}
                  letterSpacing="wider"
                >
                  <Flex gap={6} alignItems="center">
                    <Text fontWeight={600} fontSize="md" flexBasis={20} flexShrink={0}>
                      Search
                    </Text>
                    <Input
                      type="search"
                      placeholder="Type to search"
                      sx={{
                        '::placeholder': {
                          color: Colors.GRAY_CHATEAU,
                        },
                      }}
                      value={glossaryDrawer.searchKeyword || ''}
                      onChange={({ target: { value } }) =>
                        glossaryAction.searchArticlesByKeyword(value)
                      }
                    />
                  </Flex>
                  <Flex gap={6} alignItems="center">
                    <Text fontWeight={600} fontSize="md" flexBasis={20} flexShrink={0}>
                      Category
                    </Text>
                    <GlossaryListCategories />
                  </Flex>
                </Flex>

                <Flex mt={9} maxHeight="calc(100vh - 295px)" overflowY="auto">
                  <ScrollContainer className="scroll-container" hideScrollbars={false}>
                    <GlossaryList />
                  </ScrollContainer>
                </Flex>
              </Box>

              {!isMobile && glossaryDrawer.contentDetails && (
                <Divider orientation="vertical" height="auto" mt={9} />
              )}
              <ContentDetails />
            </Flex>
          </Flex>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

export { GlossaryDrawer }
