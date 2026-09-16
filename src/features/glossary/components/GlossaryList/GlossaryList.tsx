import { Button, Flex, Text } from '@chakra-ui/react'
import { useGlossaryStore } from 'features/glossary/store/glossaryStore'
import { GlossaryCategoriesOptions } from 'features/glossary/utils/glossaryConst'
import { map } from 'lodash'
import { Colors } from 'shared/util/colors'
import { sanitizedHtmlString } from 'shared/util/helpers'

const GlossaryList = () => {
  const glossaryDrawer = useGlossaryStore((state) => state.glossaryDrawer)
  const openGlossaryDrawerContentDetails = useGlossaryStore(
    (state) => state.openGlossaryDrawerContentDetails
  )
  return (
    <Flex gap={10} flexDirection="column" width="full">
      {!glossaryDrawer.list?.length && <Text>No result...</Text>}

      {!!glossaryDrawer.list?.length &&
        map(glossaryDrawer?.list, (article) => {
          if (
            glossaryDrawer.selectedCategory !== GlossaryCategoriesOptions[0].value &&
            article.termCategory !== glossaryDrawer.selectedCategory
          ) {
            return null
          }

          return (
            <Flex direction="column" gap={4} key={article.id}>
              <Text fontSize="2xl" fontWeight="normal">
                {article.term}
              </Text>
              <Text
                fontSize="lg"
                dangerouslySetInnerHTML={{ __html: sanitizedHtmlString(article.description) }}
                wordBreak="break-word"
              />

              {article.zendeskId && (
                <Button
                  variant="outline"
                  fontWeight="normal"
                  borderColor={Colors.SNOW_WHITE}
                  color={Colors.SNOW_WHITE}
                  borderRadius="full"
                  _hover={{ bg: Colors.SNOW_WHITE, color: Colors.BLACK_SOLID_90 }}
                  width="fit-content"
                  disabled={glossaryDrawer.isLoading}
                  onClick={() => openGlossaryDrawerContentDetails(article.zendeskId)}
                >
                  Show me how
                </Button>
              )}
            </Flex>
          )
        })}
    </Flex>
  )
}

export { GlossaryList }
