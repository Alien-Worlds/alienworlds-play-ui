import { Flex } from '@chakra-ui/react'
import { findIndex } from 'lodash'
import { useLocation, useNavigate } from 'react-router-dom'
import Select from 'react-select'
import { useAppState } from 'store'
import { PagePath } from 'store/main/types'

const miningOptions = [
  {
    label: 'Tools',
    value: PagePath.Tools,
  },
  {
    label: 'Lands',
    value: PagePath.Land,
  },
  {
    label: 'Planets',
    value: PagePath.Planet,
  },
  {
    label: 'Leaderboard',
    value: PagePath.MiningLeaderboard,
  },
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

export function MiningSelect() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const {
    wax: { isDemoUser },
  } = useAppState()

  const tabIndex = findIndex(miningOptions, (item) => item.value === pathname)
  if (tabIndex !== -1)
    return (
      <Flex width="100%" mt={{ base: 0, sm: isDemoUser ? 4 : 0 }}>
        <Select
          options={miningOptions}
          styles={darkStyles}
          defaultValue={miningOptions[tabIndex]}
          theme={darkTheme}
          onChange={(value) => navigate(value.value)}
          placeholder="Select an option"
          components={{
            IndicatorSeparator: () => null,
          }}
        />
      </Flex>
    )
}
