import { CrossIcon, Search2Icon } from '@alien-worlds/icons'
import { Box, Input, InputGroup, InputLeftElement, InputRightElement } from '@chakra-ui/react'
import { Colors } from 'shared/util/colors'

export const LeaderboardSearch = ({
  value,
  onChange,
  onClear,
}: {
  value: string
  onChange: (value: string) => void
  onClear: () => void
}) => {
  return (
    <Box>
      <InputGroup w={{ base: '100%', sm: '250px' }}>
        {!value ? (
          <InputLeftElement pointerEvents="none" m={1} mt="10px">
            <Search2Icon width="18px" height="18px" color={Colors.SECONDARY_GRAY} />
          </InputLeftElement>
        ) : (
          <InputRightElement m={1} cursor="pointer" mt="10px" onClick={onClear}>
            <CrossIcon color={Colors.SECONDARY_GRAY} w={20} h={20} />
          </InputRightElement>
        )}

        <Input
          size="md"
          name="name"
          margin="auto"
          type="string"
          placeholder="WAM Account"
          pl={10}
          mt={2}
          fontSize={16}
          minWidth={120}
          minHeight={42}
          borderWidth="2px"
          fontWeight={700}
          fontFamily="Titillium Web"
          value={value}
          sx={{ '::placeholder': { color: Colors.SECONDARY_GRAY, opacity: 1 } }}
          _focus={{ borderColor: Colors.DI_SERRIA }}
          _hover={{ borderColor: Colors.DI_SERRIA }}
          borderColor={Colors.SECONDARY_GRAY}
          borderRadius="full"
          textColor={Colors.SECONDARY_GRAY}
          onChange={({ target: { value: v } }) => onChange(v)}
          autoComplete="off"
        />
      </InputGroup>
    </Box>
  )
}
