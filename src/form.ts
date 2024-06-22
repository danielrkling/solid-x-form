import { Accessor, batch, createSignal, JSX } from 'solid-js'

import { Control, ControlProps, createControl, createFieldComponent, FieldComponent } from '.'

/**
 * Props for a Form component.
 * @template TValue - The type of the form's initial value object.
 */
export type FormProps<TValue extends object> = Pick<
  ControlProps<TValue>,
  'validate' | 'validationMethod'
> & {
  initialValue: TValue // Initial value object for the form.
}

/**
 * API for a Form component, extending Control to manage the form state.
 * @template TValue - The type of the form's initial value object.
 */
export type FormApi<TValue extends object> = Omit<
  Control<TValue>,
  'registerField' | 'unregisterField' | 'ref' | 'isTouched' | 'setIsTouched' | 'onBlur'
> & {
  control: Control<TValue> // Control object managing the form state.
  Field: FieldComponent<TValue> // Component function to render a field within the form.
  handleSubmit: (
    onValid?: (value: TValue) => any,
    onInvalid?: (control: Control<TValue>) => any,
  ) => Promise<void> // Handles form submission with optional callbacks based on form validity.
  response: Accessor<any> // Accessor to store the form submission response.
}

/**
 * Creates a reactive form object.
 * @template TValue - The type of the form's initial value object.
 * @param props - Props containing form configuration.
 * @returns FormApi object representing the form API.
 */
export function createForm<TValue extends object>(props: FormProps<TValue>): FormApi<TValue> {
  const [value, setValue] = createSignal(props.initialValue) // State signal for form value.
  const [isSubmitted, setIsSubmitted] = createSignal(false) // State signal for form submission status.
  const [isSubmitting, setIsSubmitting] = createSignal(false) // State signal for form submission process.
  const [response, setResponse] = createSignal<any>() // State signal for form submission response.

  // Create a Control object to manage form state and validation.
  const control = createControl({
    value,
    setValue,
    isSubmitted,
    isSubmitting,
    validate: props.validate,
    validationMethod: props.validationMethod,
  })

  // Handles form submission process.
  const handleSubmit = async (
    onValid?: (value: TValue) => any,
    onInvalid?: (control: Control<TValue>) => any,
  ) => {
    try {
      await control.validate(true) // Validate the form fields.
      batch(() => {
        setIsSubmitted(true) // Set form submission status to true.
        setIsSubmitting(true) // Set form submitting status to true.
        setResponse() // Clear previous response.
      })
      if (control.isValid()) {
        // If form is valid, execute onValid callback and set response.
        setResponse(await onValid?.(value()))
      } else {
        control.focusError() // Focus on the first field with validation error.
        setResponse(await onInvalid?.(control)) // Execute onInvalid callback and set response.
      }
    } catch (e) {
      setResponse(e) // Set response to error if validation fails.
    } finally {
      setIsSubmitting(false) // Set form submitting status to false.
    }
  }

  // Return the FormApi object.
  return {
    control,
    ...control, // Spread Control properties (value, setValue, etc.).
    handleSubmit,
    response,
    Field: createFieldComponent(control), // Field component pre-bound with Control.
  }
}

/**
 * Wrapper component for createForm.
 * @template TValue - The type of the form's initial value object.
 * @param props - Props containing form configuration and children function.
 * @returns JSX element representing the rendered form.
 */
export function Form<TValue extends object>(
  props: FormProps<TValue> & {
    children: (field: FormApi<TValue>) => JSX.Element // Children function receiving FormApi.
  },
): JSX.Element {
  return props.children(createForm<TValue>(props)) // Render children with FormApi.
}
