import { Box, Text } from '@chakra-ui/react'
import { useGlossaryStore } from 'features/glossary/store/glossaryStore'
import ScrollContainer from 'react-indiana-drag-scroll'
import { sanitizedHtmlString } from 'shared/util/helpers'

const GlossaryDetails = () => {
  const glossaryDrawer = useGlossaryStore((state) => state.glossaryDrawer)

  return (
    <ScrollContainer className="scroll-container" hideScrollbars={false}>
      <Box>
        <Text fontSize="2xl" fontWeight="normal" letterSpacing="widest">
          {glossaryDrawer.contentDetails?.title}
        </Text>
        <Text
          as="div"
          fontSize="lg"
          mt={4}
          dangerouslySetInnerHTML={{
            __html: sanitizedHtmlString(glossaryDrawer.contentDetails?.description),
          }}
          wordBreak="break-word"
        />
      </Box>
    </ScrollContainer>
  )
}

export { GlossaryDetails }
