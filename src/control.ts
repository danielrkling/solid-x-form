import { Accessor, Setter, batch, createEffect, createMemo, createSignal, on } from 'solid-js'

// export type Fields<T> = T extends Array<infer TValue>
//   ? Array<Control<TValue> | undefined>
//   : T extends object
//   ? {
//       [K in KeyOf<T>]: Control<ForceLookup<T, K>> | undefined;
//     }
//   : {};

export type Fields<T> = Map<keyof T, Control<any>>

export type KeyOf<TParent extends object> = keyof TParent

export type ForceLookup<T, K> = T[K & keyof T] // no error

export type ValidationMethod =
  | 'onChange'
  | 'onChangeAfterSubmit'
  // | "onChangeAfterBlur"
  // | "onBlur"
  // | "onBlurAfterSubmit"
  | 'onSubmit'

export type Validate<T> = (value: T) => string | Promise<string>

/**
 * Props for controlling and validating a form input or component.
 *
 * @template T - The type of value controlled by the component.
 */
export type ControlProps<T> = {
  /**  Accessor to get the value of the controlled component. */
  value: Accessor<T>

  /** Function to set the value of the controlled component. */
  setValue: Setter<T>

  /** Optional function to validate the value of the controlled component. */
  validate?: Validate<T>
}

/**
 * Represents the control interface for managing form fields and their state.
 *
 * @template T - The type of value controlled by the form.
 */
export type Control<T> = {
  /** Accessor for managing the fields map if the initial value is an object; otherwise, an array. */
  fields: Accessor<Fields<T>>
  setFields: Setter<Fields<T>>

  getField: <TKey extends keyof T>(name: TKey) => Control<T[TKey]>

  /** Accessor for managing the list of fields as an array. */
  fieldArray: Accessor<Control<any>[]>

  /** Accessor for the reactive value of the controlled component. */
  value: Accessor<T>

  /** Setter function to update the value of the controlled component. */
  setValue: Setter<T>

  /** Initial value of the controlled component. */
  initialValue: T

  /** Accessor for getting the error state of the controlled component. */
  error: Accessor<string>

  /** Accessor indicating whether the controlled component has been edited (dirty). */
  isDirty: Accessor<boolean>

  /** Accessor indicating whether the controlled component is equal to its initial state (pristine). */
  isPristine: Accessor<boolean>

  /** Asynchronous function to trigger validation of the controlled component. */
  validate: () => Promise<boolean>

  /** Accessor indicating whether the controlled component is currently being validated. */
  isValidating: Accessor<boolean>

  /** Accessor indicating whether the controlled component has been validated for its current value. Changes to false when value changes until its validated again. */
  isValidated: Accessor<boolean>

  /** Accessor indicating whether the controlled component is currently considered valid. Only true if isValidated() is true */
  isValid: Accessor<boolean>

  /** Accessor indicating whether the controlled component is currently considered invalid. Only true if isValidated() is true */
  isInvalid: Accessor<boolean>

  /** Reference to the controlled component element. */
  ref: any

  /** Function to focus on the first error within the controlled component. */
  focusError: () => boolean
}

type HiddenControlProps = 'setFields' | 'fieldArray' | 'fields' | 'focusError' | 'getField'
export const hiddenControlProps: HiddenControlProps[] = [
  'setFields',
  'fieldArray',
  'fields',
  'focusError',
  'getField',
]

export type ExposedControlProps<T> = Omit<Control<T>, HiddenControlProps>

export function createControl<T>(props: ControlProps<T>): Control<T> {
  const { value, setValue } = props
  const initialValue = value()

  const [error, setError] = createSignal('')
  const [_isValidating, setIsValidating] = createSignal(false)
  const [isValidated, setIsValidated] = createSignal(false)
  const [getRef, ref] = createSignal<any>()

  //   const [fields, setFields] = createSignal<Fields<T>>(
  //     (Array.isArray(initialValue) ? [] : {}) as Fields<T>
  //   );
  const [fields, setFields] = createSignal(new Map<keyof T, Control<any>>())

  function getField<TKey extends keyof T>(name: TKey): Control<T[TKey]> {
    return fields().get(name)!
  }

  const fieldArray: Accessor<Control<any>[]> = createMemo(() => [...fields().values()])

  const isValidating = createMemo(() => {
    return _isValidating() || fieldArray().some(f => f.isValidating())
  })

  createEffect(on(value, () => setIsValidated(false)))

  const validateSelf = async () => {
    const v = value()
    try {
      const err = (await props.validate?.(v)) ?? ''

      return !setError(err)
    } catch (e) {
      setError(String(e))
      return false
    }
  }

  const validate = async () => {
    batch(() => {
      setIsValidating(true)
      setIsValidated(false)
    })
    const result = await Promise.all([validateSelf(), ...fieldArray().map(f => f.validate())])

    batch(() => {
      setIsValidating(false)
      setIsValidated(true)
    })
    return result.every(Boolean)
  }

  const isPristine = createMemo(() => initialValue === value())
  const isDirty = () => !isPristine()

  const isInvalid = createMemo(
    () => (isValidated() && Boolean(error())) || fieldArray().some(f => f.isInvalid()),
  )
  const isValid = createMemo(() => {
    return isValidated() && !isInvalid()
  })

  const focusError = (): boolean => {
    if (getRef() && isInvalid()) {
      getRef().focus()
      return true
    }

    for (const field of fieldArray()) {
      if (field.focusError()) return true
    }
    return false
  }

  return {
    value,
    setValue,
    getField,
    initialValue,
    fields,
    setFields,
    error,
    isDirty,
    isPristine,
    isValidating,
    isValidated,
    isValid,
    isInvalid,
    ref,
    focusError,
    fieldArray,
    validate,
  }
}
