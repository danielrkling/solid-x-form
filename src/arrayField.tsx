import {
  Index,
  JSX,
  Setter,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
} from "solid-js";

import {
  Control,
  ExposedControlProps,
  FieldApi,
  Validate,
  createControl,
  createField,
  createFieldComponent,
  registerField,
  unregisterField,
} from ".";

/**
 * Props for an ArrayField component.
 * @template TParent - The type of the parent object containing the array field.
 * @template TKey - The key of the array field in the parent object.
 * @template TItem - The type of each item in the array.
 */
export type ArrayFieldProps<
  TParent,
  TKey extends keyof TParent = keyof TParent,
  //@ts-expect-error
  TItem extends any = TParent[TKey][number]
> = {
  control: Control<TParent>; // Control object managing the parent form.
  name: TKey; // Name of the array field in the parent object.
  validate?: Validate<TItem[]>; // Validation function for the array items.
};

/**
 * API for an ArrayField component, extending Control to manage array state.
 * @template TParent - The type of the parent object containing the array field.
 * @template TKey - The key of the array field in the parent object.
 * @template TItem - The type of each item in the array.
 */
export type ArrayFieldApi<
  TParent,
  TKey extends keyof TParent = keyof TParent,
  //@ts-expect-error
  TItem extends any = TParent[TKey][number]
> = ExposedControlProps<TItem[]> &
  ArrayMethods<TItem> & {
    control: Control<TItem[]>; // Control object managing the array field.
    name: TKey; // Name of the array field in the parent object.
    Fields: FieldsComponent<TItem>; // Component function to render array field items.
  };

/**
 * Component function to render array field items.
 * @template TItem - The type of each item in the array.
 */
export type FieldsComponent<TItem> = (props: {
  validate?: Validate<TItem>; // Validation function for each array item.
  children: (field: FieldsApi<TItem>) => JSX.Element; // Children function receiving FieldsApi.
}) => JSX.Element;

/**
 * API for each array field item within FieldsComponent.
 * @template TItem - The type of each item in the array.
 */
export type FieldsApi<TItem> = Omit<FieldApi<TItem[], number>, "name"> & {
  index: number; // Index of the array item.
};

/**
 * Creates an API for managing an array field within a parent object.
 * @template TParent - The type of the parent object containing the array field.
 * @template TKey - The key of the array field in the parent object.
 * @template TItem - The type of each item in the array.
 * @param props - Props containing configuration for the ArrayField.
 * @returns ArrayFieldApi object representing the array field API.
 */
export function createArrayField<
  TParent,
  TKey extends keyof TParent = keyof TParent,
  //@ts-expect-error
  TItem extends any = TParent[TKey][number]
>(
  props: ArrayFieldProps<TParent, TKey, TItem>
): ArrayFieldApi<TParent, TKey, TItem> {
  const field = createField(props); // Create a field using createField function.
  const methods = createArrayMethods(field.setValue); // Create array manipulation methods using createArrayMethods.

  // Component function to render array field items.
  const Fields: FieldsComponent<TItem> = (props: {
    validate?: Validate<TItem>; // Validation function for each array item.
    children: (field: FieldsApi<TItem>) => JSX.Element; // Children function receiving FieldsApi.
  }) => {
    return (
      <Index each={field.value()}>
        {(item, index) => {
          const value = createMemo(() => field.value()[index] as TItem); // Memoized value of the array item.
          //@ts-expect-error
          const setValue: Setter<TItem> = (val: TItem) =>
            field.setValue((prev: TItem[]) => {
              const array = [...prev];
              array.splice(
                index,
                1,
                typeof val === "function" ? val(prev[index]) : val
              );
              return array;
            }); // Setter function to update the array item.

          const control: Control<TItem> = createControl({
            value,
            setValue,
            validate: props.validate,
          }); // Control object for managing the array item.

          // Register field on mount and unregister on cleanup.
          onMount(() => registerField(field.control, index, control));
          onCleanup(() => unregisterField(field.control, index));
          const [touchCount, setTouchCount] = createSignal(0);
          const isTouched = createMemo(() => touchCount() > 0);

          return props.children({
            control,
            ...control,
            Field: createFieldComponent(control),
            index,
            touchCount,
            isTouched,
            setTouchCount,
          }); // Render children with FieldsApi.
        }}
      </Index>
    );
  };

  // Return ArrayFieldApi object.
  return {
    ...field,
    ...methods,
    Fields,
  };
}

/**
 * Component function to render ArrayField component.
 * @template TParent - The type of the parent object containing the array field.
 * @template TKey - The key of the array field in the parent object.
 * @template TItem - The type of each item in the array.
 * @param props - Props containing configuration for the ArrayField.
 * @returns JSX element representing the rendered ArrayField.
 */
export function ArrayField<
  TParent,
  TKey extends keyof TParent = keyof TParent,
  //@ts-expect-error
  TItem extends any = TParent[TKey][number]
>(
  props: ArrayFieldProps<TParent, TKey, TItem> & {
    children: (field: ArrayFieldApi<TParent, TKey, TItem>) => JSX.Element; // Children function receiving ArrayFieldApi.
  }
): JSX.Element {
  return props.children(createArrayField<TParent, TKey, TItem>(props)); // Render children with ArrayFieldApi.
}

/**
 * Methods to manipulate an array of items.
 * @template TItem - The type of each item in the array.
 */
export type ArrayMethods<TItem> = {
  append(item: TItem): void; // Appends an item to the end of the array.
  prepend(item: TItem): void; // Prepends an item to the beginning of the array.
  insert(index: number, item: TItem): void; // Inserts an item at a specific index in the array.
  replace(index: number, item: TItem): void; // Replaces an item at a specific index in the array.
  swap(indexA: number, indexB: number): void; // Swaps two items at specified indices in the array.
  remove(index: number): void; // Removes an item at a specific index from the array.
};

/**
 * Creates methods to manipulate an array of items.
 * @template TItem - The type of each item in the array.
 * @param setValue - Setter function to update the array.
 * @returns ArrayMethods object representing array manipulation methods.
 */
export function createArrayMethods<TItem>(
  setValue: Setter<TItem[]>
): ArrayMethods<TItem> {
  function append(item: TItem) {
    setValue((p) =>p ? [...p, item]:[item]); // Append item to the end of the array.
  }

  function prepend(item: TItem) {
    setValue((p) =>p ? [item, ...p]:[item]); // Prepend item to the beginning of the array.
  }

  function insert(index: number, item: TItem) {
    setValue((p) => {
      const array = p ? [...p] : [];
      array.splice(index, 0, item); // Insert item at specified index in the array.
      return array;
    });
  }

  function replace(index: number, item: TItem) {
    setValue((p) => {
      const array = p ? [...p] : [];
      array.splice(index, 1, item); // Replace item at specified index in the array.
      return array;
    });
  }

  function remove(index: number) {
    setValue((p) => {
      const array = p ? [...p] : [];
      array.splice(index, 1); // Remove item at specified index from the array.
      return array;
    });
  }

  function swap(indexA: number, indexB: number) {
    setValue((p) => {
      const array = p ? [...p] : [];
      const a = array[indexA] as TItem;
      const b = array[indexB] as TItem;
      array[indexA] = b;
      array[indexB] = a; // Swap items at specified indices in the array.
      return array;
    });
  }

  // Return ArrayMethods object.
  return {
    append,
    prepend,
    insert,
    replace,
    remove,
    swap,
  };
}
