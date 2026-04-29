import { VFC } from 'react'

import { MiningIcon } from '@alien-worlds/icons'
import { Button } from '@alien-worlds/uikit'
import { Box, Flex, Text } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'
import { useActivePath } from 'shared/hooks/useRouter'
import { useNavigate } from 'react-router-dom'
import { PagePath } from 'store/main/types'

const Header: VFC = () => {
  const navigate = useNavigate()

  return (
    <>
      <Flex alignItems="center" color="white" mb={4} zIndex={1}>
        <MiningIcon color={Colors.SNOW_WHITE} boxSize={17} style={{ marginRight: 1 }} />

        <Text ml={2} fontSize="xl" fontFamily="Orbitron">
          Mining
        </Text>
        <Box ml="auto">
          <Button
            fontSize={12}
            isActive={useActivePath([PagePath.Tools])}
            size="sm"
            fontFamily="Titillium Web"
            variant="success"
            onClick={() => navigate(PagePath.Tools)}
            letterSpacing={1.5}
            fontWeight={700}
          >
            Switch Tools
          </Button>
        </Box>
      </Flex>
      <Flex mb={6} justify="flex-end" sx={{ gap: 2 }}>
        <Box>
          <Button
            fontSize={12}
            isActive={useActivePath([PagePath.Planet])}
            size="sm"
            fontFamily="Titillium Web"
            variant="success"
            onClick={() => navigate(PagePath.Planet)}
            letterSpacing={1.5}
            fontWeight={700}
          >
            Switch Planet
          </Button>
        </Box>

        <Box>
          <Button
            fontSize={12}
            isActive={useActivePath([PagePath.Land])}
            size="sm"
            fontFamily="Titillium Web"
            variant="success"
            onClick={() => navigate(PagePath.Land)}
            letterSpacing={1.5}
            fontWeight={700}
          >
            Switch Land
          </Button>
        </Box>
      </Flex>
    </>
  )
}

export { Header }
