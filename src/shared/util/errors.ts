import { includes } from 'lodash'

export const isContactAlreadyExistsError = (error) => {
  const ALREADY_EXISTS_ERROR_MESSAGE = 'Contact ID already exists in another contact'

  if (error?.status === 422 && includes(error?.errors?.contact_id, ALREADY_EXISTS_ERROR_MESSAGE)) {
    return true
  }

  return false
}
