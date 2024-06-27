import type { ComponentProps } from "solid-js";
import type { Control } from "./control";
import type { FieldApi } from "./field";

export function registerField<T>(
	parentControl: Control<T>,
	name: keyof T,
	childControl: Control<any>,
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

export function getErrorList(control: Control<any>): string[] {
	const list = [control.error()];
	control.fields().forEach((c) => {
		list.push(...getErrorList(c));
	});
	return list.filter(Boolean);
}

export function getErrorMap<T>(
	control: Control<T>,
): Record<keyof T, string> & Record<string, string> {
	return Object.fromEntries(getErrorEntries(control, ""));

	function getErrorEntries(control: Control<any>, name: string) {
		const list = [[name, control.error()]];
		control.fields().forEach((value, key) => {
			list.push(
				...getErrorEntries(
					value,
					name ? name + "." + String(key) : String(key),
				),
			);
		});
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
