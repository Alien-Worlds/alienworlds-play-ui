import { isEmpty, isNaN } from 'lodash'

export const validateAmount = (value: any, availableToken: number) => {
  let error
  if (!value) {
    error = 'Required'
  } else if (value > availableToken) {
    error = `Max ${availableToken} TLM Available`
  } else if (value < 0.0001) {
    error = ' Min TLM Amount: 0.0001'
  }
  return error
}
export const validateAdditionalAmount = (value: any, availableToken: number) => {
  let error
  if (value > availableToken) {
    error = `Max ${availableToken} TLM Available`
  } else if (value && value < 0.0001) {
    error = ' Min TLM Amount: 0.0001'
  }
  return error
}

export const validateEmpty = (value: string) => {
  let error
  if (isEmpty(value) || isNaN(value)) error = 'Required'
  return error
}
