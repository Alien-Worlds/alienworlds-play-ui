import React from 'react'

import { Checkbox, CheckboxProps } from '@chakra-ui/react'
import { css } from '@emotion/react'
import { Colors } from 'shared/util/colors'

const FormCheckbox = React.forwardRef<any, CheckboxProps>((props, ref) => {
  return (
    <Checkbox
      ref={ref}
      fontFamily="Titillium Web"
      fontWeight={400}
      size="lg"
      borderRadius={6}
      iconSize="3rem"
      _checked={{
        color: `${Colors.CARIBBEAN_GREEN} !important`,
      }}
      iconColor={Colors.CARIBBEAN_GREEN}
      css={css`
        box-shadow: none;
        .chakra-checkbox__control {
          border-color: ${Colors.CARIBBEAN_GREEN};
          border-radius: 9px;
          width: 25px;
          height: 25px;
        }

        .chakra-checkbox__label {
          font-size: 20px;
        }

        [data-checked] {
          color: ${Colors.CARIBBEAN_GREEN};
        }

        [data-checked].chakra-checkbox__control {
          background-color: ${Colors.CARIBBEAN_GREEN};
          color: ${Colors.SNOW_WHITE};
          fill: ${Colors.SNOW_WHITE};
        }

        [data-focus] {
          box-shadow: none;
        }
      `}
      {...props}
    />
  )
})

export { FormCheckbox }
