import { Accessor, Setter, batch, createEffect, createMemo, createSignal, on } from 'solid-js'

export type Fields<T> = T extends Array<infer TValue>
  ? Array<Control<TValue> | undefined>
  : T extends object
  ? {
      [K in KeyOf<T>]: Control<ForceLookup<T, K>> | undefined
    }
  : {}

export type KeyOf<TParent extends object> = keyof TParent

export type ForceLookup<T, K> = T[K & keyof T] // no error

export type ValidationMethod =
  | 'onChange'
  | 'onChangeAfterSubmit'
  | 'onChangeAfterBlur'
  | 'onBlur'
  | 'onBlurAfterSubmit'
  | 'onSubmit'

export type Validate<T> = (value: T) => string | Promise<string>

/**
 * Props for controlling and validating a form input or component.
 *
 * @template T - The type of value controlled by the component.
 */
export type ControlProps<T> = {
  /**
   * Accessor to get the value of the controlled component.
   */
  value: Accessor<T>

  /**
   * Function to set the value of the controlled component.
   */
  setValue: Setter<T>

  /**
   * Accessor indicating if the form containing this control has been submitted.
   */
  isSubmitted: Accessor<boolean>

  /**
   * Accessor indicating if the form containing this control is currently submitting.
   */
  isSubmitting: Accessor<boolean>

  /**
   * Optional function to validate the value of the controlled component.
   */
  validate?: Validate<T>

  /**
   * Optional method specifying when to perform validation (e.g., on change, blur, submit).
   */
  validationMethod?: ValidationMethod
}

/**
 * Represents the control interface for managing form fields and their state.
 *
 * @template T - The type of value controlled by the form.
 */
export type Control<T> = {
  /** Accessor for managing the fields map if the initial value is an object; otherwise, an array. */
  fields: Accessor<Fields<T>>

  /** Accessor for managing the list of fields as an array. */
  fieldList: Accessor<Control<any>[]>

  /** Accessor for the reactive value of the controlled component. */
  value: Accessor<T>

  /** Setter function to update the value of the controlled component. */
  setValue: Setter<T>

  /** Initial value of the controlled component. */
  initialValue: T

  /** Accessor for getting the error state of the controlled component. */
  error: Accessor<string>

  /** Accessor for getting the error state of the controlled component and children. */
  errorList: Accessor<string[]>

  /** Accessor indicating whether the controlled component has been edited (dirty). */
  isDirty: Accessor<boolean>

  /** Accessor indicating whether the controlled component is equal to its initial state (pristine). */
  isPristine: Accessor<boolean>

  /** Asynchronous function to trigger validation of the controlled component. */
  validate: (recursive?: boolean) => Promise<any>

  /** Accessor indicating whether the controlled component is currently being validated. */
  isValidating: Accessor<boolean>

  /** Accessor indicating whether the controlled component has been validated for its current value. Changes to false when value changes until its validated again. */
  isValidated: Accessor<boolean>

  /** Accessor indicating whether the controlled component is currently considered valid. Only true if isValidated() is true */
  isValid: Accessor<boolean>

  /** Accessor indicating whether the controlled component is currently considered invalid. Only true if isValidated() is true */
  isInvalid: Accessor<boolean>

  /** Accessor indicating whether the form has been submitted. */
  isSubmitted: Accessor<boolean>

  /** Accessor indicating whether the form is currently submitting. */
  isSubmitting: Accessor<boolean>

  /** Reference to the controlled component element. */
  ref: any

  /** Function to focus on the first error within the controlled component. */
  focusError: () => boolean

  /** Accessor indicating whether the controlled component has been touched (interacted with). */
  isTouched: Accessor<boolean>

  /** Setter function to update the touched state of the controlled component. */
  setIsTouched: Setter<boolean>

  /**
   * Method to register a field within the form control.
   * @typeparam TKey - The key (name) of the field to register.
   */
  registerField<TKey extends keyof T>(name: TKey, control: Control<T[TKey]>): void

  /**
   * Method to unregister a field from the form control.
   * @typeparam TKey - The key (name) of the field to unregister.
   */
  unregisterField<TKey extends keyof T>(name: TKey): void

  /** Validation method specifying when to perform validation (e.g., on blur, change). */
  validationMethod: ValidationMethod

  /** Function to handle the onBlur event for form fields. */
  onBlur: () => void
}

export function createControl<T>(props: ControlProps<T>): Control<T> {
  const method = props.validationMethod ?? 'onSubmit'
  const initialValue = props.value()
  const [fields, setFields] = createSignal<Fields<T>>(
    (Array.isArray(initialValue) ? [] : {}) as Fields<T>,
  )
  const fieldList: Accessor<Control<any>[]> = createMemo(() => {
    const f = fields()
    if (Array.isArray(f)) {
      return f
    } else {
      return Object.values(f)
    }
  })

  const [error, setError] = createSignal('')
  const [_isValidating, setIsValidating] = createSignal(false)
  const isValidating = createMemo(() => {
    return _isValidating() || fieldList().some(f => f.isValidating())
  })
  const [isValidated, setIsValidated] = createSignal(false)

  createEffect(on(props.value, () => setIsValidated(false)))

  const validateSelf = async () => {
    setIsValidating(true)
    const v = props.value()
    try {
      const err = (await props.validate?.(v)) ?? ''
      setError(err)
    } catch (e) {
      setError(String(e))
    }
    batch(() => {
      setIsValidating(false)
      setIsValidated(true)
    })
  }

  const validate = async (recursive = true) =>
    recursive
      ? Promise.all([validateSelf(), ...fieldList().map(f => f.validate(recursive))])
      : validateSelf()

  createEffect(() => {
    if (method == 'onChange') {
      createEffect(on(props.value, () => validate(false)))
    }
    if (method == 'onChangeAfterSubmit' && props.isSubmitted()) {
      createEffect(on(props.value, () => validate(false)))
    }
    if (method == 'onChangeAfterBlur' && isTouched()) {
      createEffect(on(props.value, () => validate(false)))
    }
  })

  const onBlur = () => {
    setIsTouched(true)
    if (method == 'onBlur') {
      validate(false)
    }
    if (method == 'onBlurAfterSubmit' && props.isSubmitted()) {
      validate(false)
    }
  }

  const isPristine = createMemo(() => initialValue === props.value())
  const isDirty = () => !isPristine()

  const isInvalid = createMemo(() => {
    return (isValidated() && Boolean(error())) || fieldList().some(f => f.isInvalid())
  })
  const isValid = createMemo(() => {
    return isValidated() && !isInvalid()
  })
  const [getRef, ref] = createSignal<any>()
  const [isTouched, setIsTouched] = createSignal(false)

  const errorList = createMemo(() => {
    const list = [error()]
    for (const field of fieldList()) {
      list.push(...field.errorList())
    }
    // const result = await Promise.all(list)
    return list.filter(Boolean)
  })

  const focusError = (): boolean => {
    if (getRef() && isInvalid()) {
      getRef().focus()
      return true
    }

    for (const field of fieldList()) {
      if (field.focusError()) return true
    }
    return false
  }

  const registerField = <TKey extends keyof T>(name: TKey, control: Control<T[TKey]>) =>
    setFields(prev => {
      if (Array.isArray(prev)) {
        const array = [...prev]
        array[Number(name)] = control
        return array as Fields<T>
      } else {
        const obj = { ...prev }
        //@ts-expect-error
        obj[name] = control
        return obj
      }
    })
  const unregisterField = <TKey extends keyof T>(name: TKey) =>
    setFields(prev => {
      if (Array.isArray(prev)) {
        const array = [...prev]
        delete array[Number(name)]
        return array as Fields<T>
      } else {
        const obj = { ...prev }
        //@ts-expect-error
        delete obj[name]
        return obj
      }
    })

  return {
    fields,
    value: props.value,
    setValue: props.setValue,
    initialValue,
    error,
    errorList,
    isDirty,
    isPristine,
    isValidating,
    isValidated,
    isValid,
    isInvalid,
    isTouched,
    isSubmitted: props.isSubmitted,
    isSubmitting: props.isSubmitting,
    ref,
    focusError,
    setIsTouched,
    registerField,
    unregisterField,
    fieldList,
    validate,
    validationMethod: props.validationMethod ?? 'onSubmit',
    onBlur,
  }
}
