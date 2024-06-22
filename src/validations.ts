import { Validate } from './control'

/**
 * Validation function to check if value is undefined, null, or blank.
 * @param msg - Error message to return if validation fails.
 * @param chain - Optional validation function to chain after length validation.
 * @returns A validation function for any type.
 */
export function required(msg = 'required', chain?: Validate<any>): Validate<any> {
  return v => (v === undefined || v === null || v === '' ? msg : chain?.(v) ?? '')
}

/**
 * Custom validation function that allows chaining another validation function.
 * @template T - The type of value being validated.
 * @param fn - Function that returns true if validation passes.
 * @param msg - Error message to return if validation fails.
 * @param chain - Optional validation function to chain after `fn`.
 * @returns A validation function for the specified value type `T`.
 */
export function custom<T>(
  fn: (value: T) => boolean,
  msg: string,
  chain?: Validate<T>,
): Validate<T> {
  return (v: T) => (fn(v) ? msg : chain?.(v) ?? '')
}

/**
 * Validation function to check if the length of a string or array is at least `length`.
 * @param length - Minimum length allowed.
 * @param msg - Error message to return if validation fails.
 * @param chain - Optional validation function to chain after length validation.
 * @returns A validation function for strings or arrays.
 */
export function minLength(
  length: number,
  msg: string,
  chain?: Validate<string | any[]>,
): Validate<string | any[]> {
  return v => (v.length < length ? msg : chain?.(v) ?? '')
}

/**
 * Validation function to check if the length of a string or array does not exceed `length`.
 * @param length - Maximum length allowed.
 * @param msg - Error message to return if validation fails.
 * @param chain - Optional validation function to chain after length validation.
 * @returns A validation function for strings or arrays.
 */
export function maxLength(
  length: number,
  msg: string,
  chain?: Validate<string | any[]>,
): Validate<string | any[]> {
  return v => (v.length > length ? msg : chain?.(v) ?? '')
}

/**
 * Validation function to check if a number or date is not greater than `max`.
 * @param max - Maximum value allowed (either number or Date).
 * @param msg - Error message to return if validation fails.
 * @param chain - Optional validation function to chain after max validation.
 * @returns A validation function for numbers or dates.
 */
export function max(
  max: number | Date,
  msg: string,
  chain?: Validate<number | Date>,
): Validate<number | Date> {
  return v => (v > max ? msg : chain?.(v) ?? '')
}

/**
 * Validation function to check if a number or date is not less than `min`.
 * @param min - Minimum value allowed (either number or Date).
 * @param msg - Error message to return if validation fails.
 * @param chain - Optional validation function to chain after min validation.
 * @returns A validation function for numbers or dates.
 */
export function min(
  min: number | Date,
  msg: string,
  chain?: Validate<number | Date>,
): Validate<number | Date> {
  return v => (v < min ? msg : chain?.(v) ?? '')
}

/**
 * Validation function to check if a string matches the specified regular expression pattern.
 * @param pattern - Regular expression pattern to match against.
 * @param msg - Error message to return if validation fails.
 * @param chain - Optional validation function to chain after pattern validation.
 * @returns A validation function for strings.
 */
export function pattern(pattern: RegExp, msg: string, chain?: Validate<string>): Validate<string> {
  return v => (pattern.test(v) ? '' : chain?.(v) ?? msg)
}

/**
 * Validation function to check if a value equals a specified value.
 * @param value - Expected value for comparison.
 * @param msg - Error message to return if validation fails.
 * @param chain - Optional validation function to chain after equals validation.
 * @returns A validation function for any type of value.
 */
export function equals(value: any, msg: string, chain?: Validate<any>): Validate<any> {
  return v => (v === value ? '' : chain?.(v) ?? msg)
}
