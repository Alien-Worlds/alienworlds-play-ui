import { Flex, GridItem, Image, Text } from '@chakra-ui/react'
import { ArenaPortalItemType } from 'features/arena/pages/Arena'
import { useNavigate } from 'react-router-dom'
import { Colors } from 'shared/util/colors'
import { openInNewTab } from 'shared/util/helpers'
import { useActions } from 'store'
export const ArenaItem = ({ data }: { data: ArenaPortalItemType }) => {
  const {
    modal: { setSecondaryModalActive },
  } = useActions()
  const navigate = useNavigate()
  return (
    <GridItem>
      <Flex width="100%" justifyContent="center">
        <Flex
          direction="column"
          alignItems="center"
          width={{ base: '100px', lg: '140px' }}
          gap={{ base: 2, lg: 4, xl: 4 }}
          cursor="pointer"
          _hover={{ color: Colors.DI_SERRIA }}
          onClick={() => {
            if (data.isAlienWorldsApp) {
              window.scrollTo({ top: 0, behavior: 'auto' })
              navigate(data.url)
            } else {
              setSecondaryModalActive({
                modalName: 'ExternalLinkDisclaimerModal',
                value: true,
                onConfirm: () => openInNewTab(data.creatorUrl),
              })
            }
          }}
        >
          <Flex
            boxSize={{ base: '100px', lg: '140px' }}
            bg={Colors.BLACK_SOLID_100}
            boxShadow="-2px -2px 4px 0px rgba(0, 0, 0, 0.40) inset, 3px 3px 4px 0px rgba(116, 116, 116, 0.25) inset;"
            borderRadius="20px"
            justifyContent="center"
            alignItems="center"
            _hover={{ color: Colors.DI_SERRIA }}
          >
            <Image src={data.image.data.attributes.url} alt={data.title} />
          </Flex>
          <Text fontFamily="orb" fontSize={{ base: '12px', md: '16px' }} textAlign="center">
            {data.title}
          </Text>
        </Flex>
      </Flex>
    </GridItem>
  )
}
