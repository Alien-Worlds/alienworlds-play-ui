import React from 'react'

import { FormLabel, FormLabelProps, Input, InputProps } from '@chakra-ui/react'

const InputField = React.forwardRef<any, InputProps>((props, ref) => {
  return (
    <Input
      ref={ref}
      display="block"
      fontFamily="Orbitron"
      size="lg"
      fontSize="22px"
      fontWeight={400}
      color="#ffffff"
      backgroundColor="rgba(224, 224, 224, 0.1)"
      px="19px"
      py="25px"
      borderRadius="21px"
      borderWidth="2px"
      borderColor="#fff"
      _active={{
        backgroundColor: 'whiteAlpha.200',
      }}
      _placeholder={{
        fontSize: '17px',
      }}
      {...props}
    />
  )
})

const InputFieldLabel = (props: FormLabelProps) => {
  return (
    <FormLabel
      display="block"
      fontFamily="Titillium Web"
      fontSize="20px"
      fontWeight={600}
      pl={5}
      color="#f6a800"
      {...props}
    />
  )
}

export { InputField, InputFieldLabel }
