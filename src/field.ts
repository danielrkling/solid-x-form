import { JSX, Setter, createMemo, mergeProps, onCleanup, onMount } from 'solid-js'

import { Control, ControlProps, createControl } from './'

/**
 * Props for a field component.
 * @template TParent - The type of the parent object containing the field.
 * @template TKey - The key of the field within the parent object.
 * @template TValue - The type of value stored in the field.
 */
export type FieldProps<
  TParent,
  TKey extends keyof TParent = keyof TParent,
  TValue extends any = TParent[TKey],
> = Pick<ControlProps<TValue>, 'validate' | 'validationMethod'> & {
  control: Control<TParent> // Control object managing the form state.
  name: TKey // Name of the field within the parent object.
}

/**
 * API for a field component, extending Control to manage the field state.
 * @template TParent - The type of the parent object containing the field.
 * @template TKey - The key of the field within the parent object.
 * @template TValue - The type of value stored in the field.
 */
export type FieldApi<
  TParent,
  TKey extends keyof TParent = keyof TParent,
  TValue extends any = TParent[TKey],
> = Omit<Control<TValue>, 'registerField' | 'unregisterField'> & {
  control: Control<TValue> // Control object managing the field state.
  name: TKey // Name of the field within the parent object.
  Field: FieldComponent<TValue> // Component function to render this field.
}

/**
 * Creates a field API object for a specific field within a parent object.
 * @template TParent - The type of the parent object containing the field.
 * @template TKey - The key of the field within the parent object.
 * @template TValue - The type of value stored in the field.
 * @param props - Props containing field configuration and control.
 * @returns FieldApi object representing the field API.
 */
export function createField<
  TParent,
  TKey extends keyof TParent = keyof TParent,
  TValue extends any = TParent[TKey],
>(props: FieldProps<TParent, TKey, TValue>): FieldApi<TParent, TKey, TValue> {
  const value = createMemo(() => props.control.value()?.[props.name] as TValue)

  // Setter function to update the field value within the parent object.
  //@ts-expect-error
  const setValue: Setter<TValue> = (value: TValue) =>
    props.control.setValue((prev: TParent) => {
      const newValue: TValue = typeof value === 'function' ? value(prev?.[props.name]) : value
      if (Array.isArray(prev)) {
        const array = [...prev]
        array.splice(Number(props.name), 1, newValue)
        return array as TParent
      } else {
        return {
          ...prev,
          [props.name]: newValue,
        }
      }
    })

  // Creates a control object specifically for managing this field.
  const control = createControl({
    value,
    setValue,
    isSubmitted: props.control.isSubmitted,
    isSubmitting: props.control.isSubmitting,
    validate: props.validate,
    validationMethod: props.validationMethod ?? props.control.validationMethod,
  })

  // Register field on mount and unregister on cleanup.
  onMount(() => props.control.registerField(props.name, control as Control<TParent[TKey]>))
  onCleanup(() => props.control.unregisterField(props.name))

  // Return the field API object.
  return {
    control,
    ...control,
    name: props.name,
    Field: createFieldComponent(control),
  }
}

/**
 * Field component for rendering a specific field within a parent object.
 * @template TParent - The type of the parent object containing the field.
 * @template TKey - The key of the field within the parent object.
 * @template TValue - The type of value stored in the field.
 * @param props - Props containing field configuration and children.
 * @returns JSX element representing the rendered field component.
 */
export function Field<
  TParent,
  TKey extends keyof TParent = keyof TParent,
  TValue extends any = TParent[TKey],
>(
  props: FieldProps<TParent, TKey, TValue> & {
    children: (field: FieldApi<TParent, TKey, TValue>) => JSX.Element
  },
): JSX.Element {
  return props.children(createField<TParent, TKey, TValue>(props))
}

/**
 * Type definition for a function component that renders a field component.
 * @template TValue - The type of value stored in the field.
 */
export type FieldComponent<TValue> = <
  TChildKey extends keyof TValue,
  TChildValue extends unknown = TValue[TChildKey],
>(
  props: Omit<FieldProps<TValue, TChildKey, TChildValue>, 'control'> & {
    children: (field: FieldApi<TValue, TChildKey, TChildValue>) => JSX.Element
  },
) => JSX.Element

/**
 * Creates a field component function that renders a specific field.
 * @template TValue - The type of value stored in the field.
 * @param control - Control object managing the field state.
 * @returns FieldComponent function for rendering the specified field.
 */
export function createFieldComponent<TValue>(control: Control<TValue>): FieldComponent<TValue> {
  return <TChildKey extends keyof TValue, TChildValue extends any = TValue[TChildKey]>(
    props: Omit<FieldProps<TValue, TChildKey, TChildValue>, 'control'> & {
      children: (field: FieldApi<TValue, TChildKey, TChildValue>) => JSX.Element
    },
  ) =>
    props.children(
      createField<TValue, TChildKey, TChildValue>(
        mergeProps(props, {
          control,
        }),
      ),
    )
}
