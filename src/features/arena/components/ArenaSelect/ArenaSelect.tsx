import Select from 'react-select'

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
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused ? '#444' : state.isSelected ? '#666' : '#2a2a2a',
    color: '#fff',
    fontFamily: 'orbitron',
    fontSize: '12px',
    fontWeight: 700,
  }),
  singleValue: (provided) => ({
    ...provided,
    color: '#fff',
    fontFamily: 'orbitron',
    fontSize: '12px',
    fontWeight: 700,
  }),
  input: (provided) => ({
    ...provided,
    color: '#fff',
    fontFamily: 'orbitron',
    fontSize: '12px',
    fontWeight: 700,
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

interface AreaSelectProps {
  onChange: (value: any) => void
  options?: { label: string; value: string }[]
}
export function ArenaSelect({ onChange, options }: AreaSelectProps) {
  return (
    <div className="flex w-full">
      <Select
        options={options}
        styles={darkStyles}
        defaultValue={options[0]}
        theme={darkTheme}
        onChange={(value) => onChange(value.value)}
        placeholder="Select an option"
        components={{
          IndicatorSeparator: () => null,
        }}
      />
    </div>
  )
}
