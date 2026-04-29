import { Box, Flex, Image, Text } from '@chakra-ui/react'
import { PlanetImageSizes, getPlanetImage } from 'features/mining/utils/planet'
import Select from 'react-select'

const options = [
  { value: 'eyeke', label: 'Eyeke' },
  { value: 'naron', label: 'Naron' },
  { value: 'nerix', label: 'Neri' },
  { value: 'kavian', label: 'Kavian' },
  { value: 'magor', label: 'Magor' },
  { value: 'veles', label: 'Veles' },
]

const darkStyles = {
  control: (provided) => ({
    ...provided,
    width: '100%',
    backgroundColor: '#100F10',
    borderColor: '#100F10',
    color: '#fff',
    height: '40px',
    borderRadius: '12px',
    '&:hover': {
      borderColor: '#2a2a2a',
    },
  }),
  container: (provided) => ({
    ...provided,
    width: '100%',
    height: '40px',
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: '#2a2a2a',
    zIndex: 9999,
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? '#444' : state.isSelected ? '#666' : '#2a2a2a',
    color: '#fff',
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#fff',
  }),
  input: (provided) => ({
    ...provided,
    color: '#fff',
  }),
  placeholder: (provided) => ({
    ...provided,
    color: '#aaa',
  }),
}

const darkTheme = (theme) => ({
  ...theme,
  colors: {
    ...theme.colors,
    primary25: '#444',
    primary: '#777',
    neutral0: '#2a2a2a', // control background
    neutral80: '#fff', // text color
  },
})
const formatOptionLabel = ({ label, value }) => (
  <Box display="flex" alignItems="center" zIndex={10000}>
    {value && (
      <Image
        src={getPlanetImage(value, PlanetImageSizes.SMALL)}
        alt={label}
        boxSize="20px"
        borderRadius="full"
        mr="8px"
      />
    )}
    <Text>{label}</Text>
  </Box>
)

interface DaoSelectProps {
  onChange: (value: any) => void
}
export function DaoSelect({ onChange }: DaoSelectProps) {
  return (
    <Flex width="100%">
      <Select
        options={options}
        styles={darkStyles}
        defaultValue={options[0]}
        theme={darkTheme}
        onChange={(value) => onChange(value.value)}
        placeholder="Select an option"
        formatOptionLabel={formatOptionLabel}
        components={{
          IndicatorSeparator: () => null,
        }}
      />
    </Flex>
  )
}
