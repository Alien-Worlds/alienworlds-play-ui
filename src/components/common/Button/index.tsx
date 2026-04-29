import React from 'react'

import { Button as ChakraButton, ButtonProps } from '@chakra-ui/react'

import { BaseProps } from '../../../types'

interface CustomButtonProps extends ButtonProps, BaseProps {
  variant?: 'primary' | 'secondary' | 'outline'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

const variantStyles = {
  primary: {
    bg: 'brand.500',
    color: 'white',
    _hover: { bg: 'brand.600' },
  },
  secondary: {
    bg: 'gray.100',
    color: 'gray.800',
    _hover: { bg: 'gray.200' },
  },
  outline: {
    variant: 'outline',
    borderColor: 'brand.500',
    color: 'brand.500',
    _hover: { bg: 'brand.50' },
  },
}

export const Button: React.FC<CustomButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  style,
  ...props
}) => {
  return (
    <ChakraButton
      {...variantStyles[variant]}
      size={size}
      isLoading={isLoading}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </ChakraButton>
  )
}
