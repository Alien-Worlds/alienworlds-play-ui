import BigNumber from 'bignumber.js'

/**
 * Converts a string or number value to a BigNumber object with any postfix removed.
 *
 * @param {string|number} value - The value to convert to a BigNumber object.
 * @returns {BigNumber} A BigNumber object representing the numeric value of the input with any postfix removed.
 */
export const toBigNumber = (value: string | number): BigNumber => {
  if (!value) return new BigNumber(0)

  const stringNumber = value.toString().replace(/[^\d,.]+$/, '')
  return new BigNumber(stringNumber)
}

/**
 * Formats a number using the Intl.NumberFormat API.
 *
 * @param {number|string} number - The number to format.
 * @param {number} [minimumFractionDigits] - The minimum number of decimal places to include in the formatted output.
 * @param {number} [maximumFractionDigits] - The maximum number of decimal places to include in the formatted output.
 * @param {string} [customLocale] - A custom locale to use for formatting the number.
 * @param {number} [precision] - The number of significant digits to include in the formatted output.
 * @returns {string} The formatted number as a string.
 */
export const formatNumber = (
  number: number | string | null,
  minimumFractionDigits?: number,
  maximumFractionDigits?: number,
  customLocale?: string,
  precision?: number
): string => {
  // handle if number is null, undefined, or 0
  if (!number) return '0'

  // If no customLocale is passed, use the browser's locale
  // and also fallback to 'en-US' if the browser's locale is not supported
  const defaultLocale = 'en-US'
  const locale = customLocale || navigator.language || defaultLocale
  const localeOptions = {
    useGrouping: true,
    ...(minimumFractionDigits !== undefined && { minimumFractionDigits }),
    ...(maximumFractionDigits !== undefined && { maximumFractionDigits }),
  }

  // Regular expression to remove the postfix string in a number i.e. 1234.345 TLM to 1234.345

  let stringValue = number
    .toString()
    .replace(/,/g, '')
    .replace(/[^\d.]+$/, '')
  // display n significant digits if precision is specified
  if (precision) {
    stringValue = parseFloat(stringValue).toPrecision(precision)
  }
  const bigNumber = new BigNumber(stringValue)
  let formattedNumber = 'NaN'
  if (bigNumber.isFinite()) {
    const formatter = new Intl.NumberFormat(locale, localeOptions)
    formattedNumber = formatter.format(bigNumber.toNumber())
  }

  return formattedNumber
}
