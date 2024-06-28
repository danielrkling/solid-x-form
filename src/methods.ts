import type { ComponentProps } from "solid-js";
import type { Control, FieldTypes } from "./control";
import type { FieldApi } from "./field";

export function registerField<T>(
	parentControl: Control<T>,
	name: keyof T,
	childControl: Control<FieldTypes>,
): void {
	parentControl.setFields((prev) => new Map(prev).set(name, childControl));
}

export function unregisterField<T>(
	parentControl: Control<T>,
	name: keyof T,
): void {
	parentControl.setFields((prev) => {
		const map = new Map(prev);
		map.delete(name);
		return map;
	});
}

export function getErrorList<T>(control: Control<T>): string[] {
	const list = [control.error()];
	for (const [name, field] of control.fields()) {
		list.push(...getErrorList(field));
	}

	return list.filter(Boolean);
}

export function getErrorMap<T>(
	control: Control<T>,
): Record<keyof T, string> & Record<string, string> {
	return Object.fromEntries(getErrorEntries(control, ""));

	function getErrorEntries<T>(control: Control<T>, name: string) {
		const list = [[name, control.error()]];
		for (const [fieldName, field] of control.fields()) {
			list.push(
				...getErrorEntries(
					field,
					name ? `${name}.${String(fieldName)}` : String(fieldName),
				),
			);
		}
		return list;
	}
}

export function getInputProps<
	TParent,
	TKey extends keyof TParent = keyof TParent,
>(field: FieldApi<TParent, TKey, string>): ComponentProps<"input"> {
	return {
		onInput: (e) => field.setValue(e.target.value),
		onBlur: (e) => field.setTouchCount((v) => v + 1),
		ref: field.ref,
		value: field.value(),
		name: String(field.name),
	};
}
