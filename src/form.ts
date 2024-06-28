import {
	type Accessor,
	batch,
	createEffect,
	createMemo,
	createSignal,
	type JSX,
	on,
	Setter,
} from "solid-js";

import {
	type Control,
	type ControlProps,
	createControl,
	createFieldComponent,
	type ExposedControlProps,
	type FieldComponent,
	type ValidationMethod,
} from ".";

/**
 * Props for a Form component.
 * @template TValue - The type of the form's initial value object.
 */
export type FormProps<TValue extends object> = Pick<
	ControlProps<TValue>,
	"validate"
> & {
	initialValue: TValue; // Initial value object for the form.
	validationMethod?: ValidationMethod;
};

/**
 * API for a Form component, extending Control to manage the form state.
 * @template TValue - The type of the form's initial value object.
 */
export type FormApi<TValue extends object> = ExposedControlProps<TValue> & {
	control: Control<TValue>; // Control object managing the form state.
	Field: FieldComponent<TValue>; // Component function to render a field within the form.
	handleSubmit: (
		onValid?: (value: TValue,control: Control<TValue>) => unknown,
		onInvalid?: (value: TValue, control: Control<TValue>) => unknown,
	) => Promise<void>; // Handles form submission with optional callbacks based on form validity.
	response: Accessor<unknown>; // Accessor to store the form submission response.
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
export function createForm<TValue extends object>(
	props: FormProps<TValue>,
): FormApi<TValue> {
	const [value, setValue] = createSignal(props.initialValue); // State signal for form value.
	const [submitCount, setSubmitCount] = createSignal(0);
	const isSubmitted = createMemo(() => submitCount() > 0);
	const [isSubmitting, setIsSubmitting] = createSignal(false); // State signal for form submission process.
	const [response, setResponse] = createSignal<unknown>(); // State signal for form submission response.

	createEffect(() => {
		if (
			props.validationMethod === "onChange" ||
			(props.validationMethod === "onChangeAfterSubmit" && isSubmitted())
		) {
			createEffect(on(value, () => control.validate()));
		}
	});

	// Create a Control object to manage form state and validation.
	const control = createControl<TValue>({
		value,
		setValue,
		validate: props.validate,
	});

	// Handles form submission process.
	const handleSubmit = async (
		onValid?: (value: TValue, control: Control<TValue>) => unknown,
		onInvalid?: (value: TValue, control: Control<TValue>) => unknown,
	) => {
		try {
			await control.validate(); // Validate the form fields.
			batch(() => {
				setIsSubmitting(true); // Set form submitting status to true.
				setResponse(); // Clear previous response.
			});
			if (control.isValid()) {
				// If form is valid, execute onValid callback and set response.
				setResponse(await onValid?.(value(), control));
			} else {
				control.focusError(); // Focus on the first field with validation error.
				setResponse(await onInvalid?.(value(),control)); // Execute onInvalid callback and set response.
			}
		} catch (e) {
			setResponse(e); // Set response to error if validation fails.
		} finally {
			setIsSubmitting(false); // Set form submitting status to false.
			setSubmitCount((v) => v + 1);
		}
	};

	// Return the FormApi object.
	return {
		control,
		...control, // Spread Control properties (value, setValue, etc.).
		handleSubmit,
		response,
		isSubmitting,
		submitCount,
		isSubmitted,
		Field: createFieldComponent(control), // Field component pre-bound with Control.
	};
}

/**
 * Wrapper component for createForm.
 * @template TValue - The type of the form's initial value object.
 * @param props - Props containing form configuration and children function.
 * @returns JSX element representing the rendered form.
 */
export function Form<TValue extends object>(
	props: FormProps<TValue> & {
		children: (field: FormApi<TValue>) => JSX.Element; // Children function receiving FormApi.
	},
): JSX.Element {
	return props.children(createForm<TValue>(props)); // Render children with FormApi.
}
