import { JSX, Setter, Accessor, ComponentProps } from "solid-js";

/**
 * Props for an ArrayField component.
 * @template TParent - The type of the parent object containing the array field.
 * @template TKey - The key of the array field in the parent object.
 * @template TItem - The type of each item in the array.
 */
type ArrayFieldProps<
	TParent,
	TKey extends keyof TParent = keyof TParent,
	TItem = TParent[TKey][number],
> = {
	control: Control<TParent>;
	name: TKey;
	validate?: Validate<TItem[]>;
};
/**
 * API for an ArrayField component, extending Control to manage array state.
 * @template TParent - The type of the parent object containing the array field.
 * @template TKey - The key of the array field in the parent object.
 * @template TItem - The type of each item in the array.
 */
type ArrayFieldApi<
	TParent,
	TKey extends keyof TParent = keyof TParent,
	TItem = TParent[TKey][number],
> = ExposedControlProps<TItem[]> &
	ArrayMethods<TItem> & {
		control: Control<TItem[]>;
		name: TKey;
		Fields: FieldsComponent<TItem>;
	};
/**
 * Component function to render array field items.
 * @template TItem - The type of each item in the array.
 */
type FieldsComponent<TItem> = (props: {
	validate?: Validate<TItem>;
	children: (field: FieldsApi<TItem>) => JSX.Element;
}) => JSX.Element;
/**
 * API for each array field item within FieldsComponent.
 * @template TItem - The type of each item in the array.
 */
type FieldsApi<TItem> = Omit<FieldApi<TItem[], number>, "name"> & {
	index: number;
};
/**
 * Creates an API for managing an array field within a parent object.
 * @template TParent - The type of the parent object containing the array field.
 * @template TKey - The key of the array field in the parent object.
 * @template TItem - The type of each item in the array.
 * @param props - Props containing configuration for the ArrayField.
 * @returns ArrayFieldApi object representing the array field API.
 */
declare function createArrayField<
	TParent,
	TKey extends keyof TParent = keyof TParent,
	TItem = TParent[TKey][number],
>(
	props: ArrayFieldProps<TParent, TKey, TItem>,
): ArrayFieldApi<TParent, TKey, TItem>;
/**
 * Component function to render ArrayField component.
 * @template TParent - The type of the parent object containing the array field.
 * @template TKey - The key of the array field in the parent object.
 * @template TItem - The type of each item in the array.
 * @param props - Props containing configuration for the ArrayField.
 * @returns JSX element representing the rendered ArrayField.
 */
declare function ArrayField<
	TParent,
	TKey extends keyof TParent = keyof TParent,
	TItem = TParent[TKey][number],
>(
	props: ArrayFieldProps<TParent, TKey, TItem> & {
		children: (field: ArrayFieldApi<TParent, TKey, TItem>) => JSX.Element;
	},
): JSX.Element;
/**
 * Methods to manipulate an array of items.
 * @template TItem - The type of each item in the array.
 */
type ArrayMethods<TItem> = {
	append(item: TItem): void;
	prepend(item: TItem): void;
	insert(index: number, item: TItem): void;
	replace(index: number, item: TItem): void;
	swap(indexA: number, indexB: number): void;
	remove(index: number): void;
};
/**
 * Creates methods to manipulate an array of items.
 * @template TItem - The type of each item in the array.
 * @param setValue - Setter function to update the array.
 * @returns ArrayMethods object representing array manipulation methods.
 */
declare function createArrayMethods<TItem>(
	setValue: Setter<TItem[]>,
): ArrayMethods<TItem>;

/**
 * Props for a field component.
 * @template TParent - The type of the parent object containing the field.
 * @template TKey - The key of the field within the parent object.
 * @template TValue - The type of value stored in the field.
 */
type FieldProps<
	TParent,
	TKey extends keyof TParent = keyof TParent,
	TValue = TParent[TKey],
> = Pick<ControlProps<TValue>, "validate"> & {
	control: Control<TParent>;
	name: TKey;
};
/**
 * API for a field component, extending Control to manage the field state.
 * @template TParent - The type of the parent object containing the field.
 * @template TKey - The key of the field within the parent object.
 * @template TValue - The type of value stored in the field.
 */
type FieldApi<
	TParent,
	TKey extends keyof TParent = keyof TParent,
	TValue = TParent[TKey],
> = ExposedControlProps<TValue> & {
	control: Control<TValue>;
	name: TKey;
	Field: FieldComponent<TValue>;
	touchCount: Accessor<number>;
	setTouchCount: Setter<number>;
	isTouched: Accessor<boolean>;
};
/**
 * Creates a field API object for a specific field within a parent object.
 * @template TParent - The type of the parent object containing the field.
 * @template TKey - The key of the field within the parent object.
 * @template TValue - The type of value stored in the field.
 * @param props - Props containing field configuration and control.
 * @returns FieldApi object representing the field API.
 */
declare function createField<
	TParent,
	TKey extends keyof TParent = keyof TParent,
	TValue = TParent[TKey],
>(props: FieldProps<TParent, TKey, TValue>): FieldApi<TParent, TKey, TValue>;
/**
 * Field component for rendering a specific field within a parent object.
 * @template TParent - The type of the parent object containing the field.
 * @template TKey - The key of the field within the parent object.
 * @template TValue - The type of value stored in the field.
 * @param props - Props containing field configuration and children.
 * @returns JSX element representing the rendered field component.
 */
declare function Field<
	TParent,
	TKey extends keyof TParent = keyof TParent,
	TValue = TParent[TKey],
>(
	props: FieldProps<TParent, TKey, TValue> & {
		children: (field: FieldApi<TParent, TKey, TValue>) => JSX.Element;
	},
): JSX.Element;
/**
 * Type definition for a function component that renders a field component.
 * @template TValue - The type of value stored in the field.
 */
type FieldComponent<TValue> = <
	TChildKey extends keyof TValue,
	TChildValue = TValue[TChildKey],
>(
	props: Omit<FieldProps<TValue, TChildKey, TChildValue>, "control"> & {
		children: (field: FieldApi<TValue, TChildKey, TChildValue>) => JSX.Element;
	},
) => JSX.Element;
/**
 * Creates a field component function that renders a specific field.
 * @template TValue - The type of value stored in the field.
 * @param control - Control object managing the field state.
 * @returns FieldComponent function for rendering the specified field.
 */
declare function createFieldComponent<TValue>(
	control: Control<TValue>,
): FieldComponent<TValue>;

/**
 * Props for a Form component.
 * @template TValue - The type of the form's initial value object.
 */
type FormProps<TValue extends object> = Pick<
	ControlProps<TValue>,
	"validate"
> & {
	initialValue: TValue;
	validationMethod?: ValidationMethod;
};
/**
 * API for a Form component, extending Control to manage the form state.
 * @template TValue - The type of the form's initial value object.
 */
type FormApi<TValue extends object> = ExposedControlProps<TValue> & {
	control: Control<TValue>;
	Field: FieldComponent<TValue>;
	handleSubmit: (
		onValid?: (value: TValue, control: Control<TValue>) => unknown,
		onInvalid?: (value: TValue, control: Control<TValue>) => unknown,
	) => Promise<void>;
	response: Accessor<unknown>;
	submitCount: Accessor<number>;
	isSubmitting: Accessor<boolean>;
	isSubmitted: Accessor<boolean>;
};
/**
 * Creates a reactive form object.
 * @template TValue - The type of the form's initial value object.
 * @param props - Props containing form configuration.
 * @returns FormApi object representing the form API.
 */
declare function createForm<TValue extends object>(
	props: FormProps<TValue>,
): FormApi<TValue>;
/**
 * Wrapper component for createForm.
 * @template TValue - The type of the form's initial value object.
 * @param props - Props containing form configuration and children function.
 * @returns JSX element representing the rendered form.
 */
declare function Form<TValue extends object>(
	props: FormProps<TValue> & {
		children: (field: FormApi<TValue>) => JSX.Element;
	},
): JSX.Element;

type FieldTypes = any;
type Fields<T> = Map<keyof T, Control<FieldTypes>>;
type KeyOf<TParent extends object> = keyof TParent;
type ForceLookup<T, K> = T[K & keyof T];
type Ref = HTMLElement;
type ValidationMethod = "onChange" | "onChangeAfterSubmit" | "onSubmit";
type Validate<T> = (value: T) => string | Promise<string>;
/**
 * Props for controlling and validating a form input or component.
 *
 * @template T - The type of value controlled by the component.
 */
type ControlProps<T> = {
	/**  Accessor to get the value of the controlled component. */
	value: Accessor<T>;
	/** Function to set the value of the controlled component. */
	setValue: Setter<T>;
	/** Optional function to validate the value of the controlled component. */
	validate?: Validate<T>;
};
/**
 * Represents the control interface for managing form fields and their state.
 *
 * @template T - The type of value controlled by the form.
 */
type Control<T> = {
	/** Accessor for managing the fields map if the initial value is an object; otherwise, an array. */
	fields: Accessor<Fields<T>>;
	setFields: Setter<Fields<T>>;
	getField: <TKey extends keyof T>(name: TKey) => Control<T[TKey]>;
	/** Accessor for managing the list of fields as an array. */
	fieldArray: Accessor<Control<FieldTypes>[]>;
	/** Accessor for the reactive value of the controlled component. */
	value: Accessor<T>;
	/** Setter function to update the value of the controlled component. */
	setValue: Setter<T>;
	/** Initial value of the controlled component. */
	initialValue: T;
	/** Accessor for getting the error state of the controlled component. */
	error: Accessor<string>;
	/** Accessor indicating whether the controlled component has been edited (dirty). */
	isDirty: Accessor<boolean>;
	/** Accessor indicating whether the controlled component is equal to its initial state (pristine). */
	isPristine: Accessor<boolean>;
	/** Asynchronous function to trigger validation of the controlled component. */
	validate: () => Promise<boolean>;
	/** Accessor indicating whether the controlled component is currently being validated. */
	isValidating: Accessor<boolean>;
	/** Accessor indicating whether the controlled component has been validated for its current value. Changes to false when value changes until its validated again. */
	isValidated: Accessor<boolean>;
	/** Accessor indicating whether the controlled component is currently considered valid. Only true if isValidated() is true */
	isValid: Accessor<boolean>;
	/** Accessor indicating whether the controlled component is currently considered invalid. Only true if isValidated() is true */
	isInvalid: Accessor<boolean>;
	/** Reference to the controlled component element. */
	ref: Setter<Ref | undefined>;
	/** Function to focus on the first error within the controlled component. */
	focusError: () => boolean;
};
type HiddenControlProps =
	| "setFields"
	| "fieldArray"
	| "fields"
	| "focusError"
	| "getField";
declare const hiddenControlProps: HiddenControlProps[];
type ExposedControlProps<T> = Omit<Control<T>, HiddenControlProps>;
declare function createControl<T>(props: ControlProps<T>): Control<T>;

/**
 * Validation function to check if value is undefined, null, or blank.
 * @param msg - Error message to return if validation fails.
 * @param chain - Optional validation function to chain after length validation.
 * @returns A validation function for any type.
 */
declare function required<T>(msg?: string, chain?: Validate<T>): Validate<T>;
/**
 * Custom validation function that allows chaining another validation function.
 * @template T - The type of value being validated.
 * @param fn - Function that returns true if validation passes.
 * @param msg - Error message to return if validation fails.
 * @param chain - Optional validation function to chain after `fn`.
 * @returns A validation function for the specified value type `T`.
 */
declare function custom<T>(
	fn: (value: T) => boolean,
	msg: string,
	chain?: Validate<T>,
): Validate<T>;
/**
 * Validation function to check if the length of a string or array is at least `length`.
 * @param length - Minimum length allowed.
 * @param msg - Error message to return if validation fails.
 * @param chain - Optional validation function to chain after length validation.
 * @returns A validation function for strings or arrays.
 */
declare function minLength<T>(
	length: number,
	msg: string,
	chain?: Validate<string | T[]>,
): Validate<string | T[]>;
/**
 * Validation function to check if the length of a string or array does not exceed `length`.
 * @param length - Maximum length allowed.
 * @param msg - Error message to return if validation fails.
 * @param chain - Optional validation function to chain after length validation.
 * @returns A validation function for strings or arrays.
 */
declare function maxLength<T>(
	length: number,
	msg: string,
	chain?: Validate<string | T[]>,
): Validate<string | T[]>;
/**
 * Validation function to check if a number or date is not greater than `max`.
 * @param max - Maximum value allowed (either number or Date).
 * @param msg - Error message to return if validation fails.
 * @param chain - Optional validation function to chain after max validation.
 * @returns A validation function for numbers or dates.
 */
declare function max(
	max: number | Date,
	msg: string,
	chain?: Validate<number | Date>,
): Validate<number | Date>;
/**
 * Validation function to check if a number or date is not less than `min`.
 * @param min - Minimum value allowed (either number or Date).
 * @param msg - Error message to return if validation fails.
 * @param chain - Optional validation function to chain after min validation.
 * @returns A validation function for numbers or dates.
 */
declare function min(
	min: number | Date,
	msg: string,
	chain?: Validate<number | Date>,
): Validate<number | Date>;
/**
 * Validation function to check if a string matches the specified regular expression pattern.
 * @param pattern - Regular expression pattern to match against.
 * @param msg - Error message to return if validation fails.
 * @param chain - Optional validation function to chain after pattern validation.
 * @returns A validation function for strings.
 */
declare function pattern(
	pattern: RegExp,
	msg: string,
	chain?: Validate<string>,
): Validate<string>;
/**
 * Validation function to check if a value equals a specified value.
 * @param value - Expected value for comparison.
 * @param msg - Error message to return if validation fails.
 * @param chain - Optional validation function to chain after equals validation.
 * @returns A validation function for any type of value.
 */
declare function equals<T>(
	value: T,
	msg: string,
	chain?: Validate<T>,
): Validate<T>;

declare function registerField<T>(
	parentControl: Control<T>,
	name: keyof T,
	childControl: Control<FieldTypes>,
): void;
declare function unregisterField<T>(
	parentControl: Control<T>,
	name: keyof T,
): void;
declare function getErrorList<T>(control: Control<T>): string[];
declare function getErrorMap<T>(
	control: Control<T>,
): Record<keyof T, string> & Record<string, string>;
declare function getInputProps<
	TParent,
	TKey extends keyof TParent = keyof TParent,
>(field: FieldApi<TParent, TKey, string>): ComponentProps<"input">;

export {
	ArrayField,
	type ArrayFieldApi,
	type ArrayFieldProps,
	type ArrayMethods,
	type Control,
	type ControlProps,
	type ExposedControlProps,
	Field,
	type FieldApi,
	type FieldComponent,
	type FieldProps,
	type FieldTypes,
	type Fields,
	type FieldsApi,
	type FieldsComponent,
	type ForceLookup,
	Form,
	type FormApi,
	type FormProps,
	type KeyOf,
	type Ref,
	type Validate,
	type ValidationMethod,
	createArrayField,
	createArrayMethods,
	createControl,
	createField,
	createFieldComponent,
	createForm,
	custom,
	equals,
	getErrorList,
	getErrorMap,
	getInputProps,
	hiddenControlProps,
	max,
	maxLength,
	min,
	minLength,
	pattern,
	registerField,
	required,
	unregisterField,
};
