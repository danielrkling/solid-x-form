import { createComponent } from 'solid-js/web';
import { createMemo, createSignal, onMount, onCleanup, mergeProps, createEffect, on, Index, batch } from 'solid-js';

// src/arrayField.tsx
function createArrayField(props) {
  const field = createField(props);
  const methods = createArrayMethods(field.setValue);
  const Fields = (props2) => {
    return createComponent(Index, {
      get each() {
        return field.value();
      },
      children: (item, index) => {
        const value = createMemo(() => field.value()[index]);
        const setValue = (val) => field.setValue((prev) => {
          const array = [...prev];
          array.splice(index, 1, typeof val === "function" ? val(prev[index]) : val);
          return array;
        });
        const control = createControl({
          value,
          setValue,
          validate: props2.validate
        });
        onMount(() => registerField(field.control, index, control));
        onCleanup(() => unregisterField(field.control, index));
        const [touchCount, setTouchCount] = createSignal(0);
        const isTouched = createMemo(() => touchCount() > 0);
        return props2.children({
          control,
          ...control,
          Field: createFieldComponent(control),
          index,
          touchCount,
          isTouched,
          setTouchCount
        });
      }
    });
  };
  return {
    ...field,
    ...methods,
    Fields
  };
}
function ArrayField(props) {
  return props.children(createArrayField(props));
}
function createArrayMethods(setValue) {
  function append(item) {
    setValue((p) => p ? [...p, item] : [item]);
  }
  function prepend(item) {
    setValue((p) => p ? [item, ...p] : [item]);
  }
  function insert(index, item) {
    setValue((p) => {
      const array = p ? [...p] : [];
      array.splice(index, 0, item);
      return array;
    });
  }
  function replace(index, item) {
    setValue((p) => {
      const array = p ? [...p] : [];
      array.splice(index, 1, item);
      return array;
    });
  }
  function remove(index) {
    setValue((p) => {
      const array = p ? [...p] : [];
      array.splice(index, 1);
      return array;
    });
  }
  function swap(indexA, indexB) {
    setValue((p) => {
      const array = p ? [...p] : [];
      const a = array[indexA];
      const b = array[indexB];
      array[indexA] = b;
      array[indexB] = a;
      return array;
    });
  }
  return {
    append,
    prepend,
    insert,
    replace,
    remove,
    swap
  };
}
function createField(props) {
  const value = createMemo(() => props.control.value()?.[props.name]);
  const setValue = (value2) => props.control.setValue((prev) => {
    const newValue = typeof value2 === "function" ? value2(prev?.[props.name]) : value2;
    if (Array.isArray(prev)) {
      const array = [...prev];
      array.splice(Number(props.name), 1, newValue);
      return array;
    } else {
      return {
        ...prev,
        [props.name]: newValue
      };
    }
  });
  const control = createControl({ value, setValue, validate: props.validate });
  const [touchCount, setTouchCount] = createSignal(0);
  const isTouched = createMemo(() => touchCount() > 0);
  onMount(() => registerField(props.control, props.name, control));
  onCleanup(() => unregisterField(props.control, props.name));
  return {
    name: props.name,
    control,
    ...control,
    isTouched,
    touchCount,
    setTouchCount,
    Field: createFieldComponent(control)
  };
}
function Field(props) {
  return props.children(createField(props));
}
function createFieldComponent(control) {
  return (props) => props.children(
    createField(
      mergeProps(props, {
        control
      })
    )
  );
}
function createForm(props) {
  const [value, setValue] = createSignal(props.initialValue);
  const [submitCount, setSubmitCount] = createSignal(0);
  const isSubmitted = createMemo(() => submitCount() > 0);
  const [isSubmitting, setIsSubmitting] = createSignal(false);
  const [response, setResponse] = createSignal();
  createEffect(() => {
    if (props.validationMethod == "onChange" || props.validationMethod == "onChangeAfterSubmit" && isSubmitted()) {
      createEffect(on(value, () => control.validate()));
    }
  });
  const control = createControl({
    value,
    setValue,
    validate: props.validate
  });
  const handleSubmit = async (onValid, onInvalid) => {
    try {
      await control.validate();
      batch(() => {
        setIsSubmitting(true);
        setResponse();
      });
      if (control.isValid()) {
        setResponse(await onValid?.(value()));
      } else {
        control.focusError();
        setResponse(await onInvalid?.(control));
      }
    } catch (e) {
      setResponse(e);
    } finally {
      setIsSubmitting(false);
      setSubmitCount((v) => v + 1);
    }
  };
  return {
    control,
    ...control,
    // Spread Control properties (value, setValue, etc.).
    handleSubmit,
    response,
    isSubmitting,
    submitCount,
    isSubmitted,
    Field: createFieldComponent(control)
    // Field component pre-bound with Control.
  };
}
function Form(props) {
  return props.children(createForm(props));
}
var hiddenControlProps = [
  "setFields",
  "fieldArray",
  "fields",
  "focusError",
  "getField"
];
function createControl(props) {
  const { value, setValue } = props;
  const initialValue = value();
  const [error, setError] = createSignal("");
  const [_isValidating, setIsValidating] = createSignal(false);
  const [isValidated, setIsValidated] = createSignal(false);
  const [getRef, ref] = createSignal();
  const [fields, setFields] = createSignal(/* @__PURE__ */ new Map());
  function getField(name) {
    return fields().get(name);
  }
  const fieldArray = createMemo(() => [
    ...fields().values()
  ]);
  const isValidating = createMemo(() => {
    return _isValidating() || fieldArray().some((f) => f.isValidating());
  });
  createEffect(on(value, () => setIsValidated(false)));
  const validateSelf = async () => {
    const v = value();
    try {
      const err = await props.validate?.(v) ?? "";
      return !setError(err);
    } catch (e) {
      setError(String(e));
      return false;
    }
  };
  const validate = async () => {
    batch(() => {
      setIsValidating(true);
      setIsValidated(false);
    });
    const result = await Promise.all([
      validateSelf(),
      ...fieldArray().map((f) => f.validate())
    ]);
    batch(() => {
      setIsValidating(false);
      setIsValidated(true);
    });
    return result.every(Boolean);
  };
  const isPristine = createMemo(() => initialValue === value());
  const isDirty = () => !isPristine();
  const isInvalid = createMemo(
    () => isValidated() && Boolean(error()) || fieldArray().some((f) => f.isInvalid())
  );
  const isValid = createMemo(() => {
    return isValidated() && !isInvalid();
  });
  const focusError = () => {
    if (getRef() && isInvalid()) {
      getRef().focus();
      return true;
    }
    for (const field of fieldArray()) {
      if (field.focusError()) return true;
    }
    return false;
  };
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
    validate
  };
}

// src/validations.ts
function required(msg = "required", chain) {
  return (v) => v === void 0 || v === null || v === "" ? msg : chain?.(v) ?? "";
}
function custom(fn, msg, chain) {
  return (v) => fn(v) ? msg : chain?.(v) ?? "";
}
function minLength(length, msg, chain) {
  return (v) => v.length < length ? msg : chain?.(v) ?? "";
}
function maxLength(length, msg, chain) {
  return (v) => v.length > length ? msg : chain?.(v) ?? "";
}
function max(max2, msg, chain) {
  return (v) => v > max2 ? msg : chain?.(v) ?? "";
}
function min(min2, msg, chain) {
  return (v) => v < min2 ? msg : chain?.(v) ?? "";
}
function pattern(pattern2, msg, chain) {
  return (v) => pattern2.test(v) ? "" : chain?.(v) ?? msg;
}
function equals(value, msg, chain) {
  return (v) => v === value ? "" : chain?.(v) ?? msg;
}

// src/methods.ts
function registerField(parentControl, name, childControl) {
  parentControl.setFields((prev) => new Map(prev).set(name, childControl));
}
function unregisterField(parentControl, name) {
  parentControl.setFields((prev) => {
    const map = new Map(prev);
    map.delete(name);
    return map;
  });
}
function getErrorList(control) {
  const list = [control.error()];
  control.fields().forEach((c) => {
    list.push(...getErrorList(c));
  });
  return list.filter(Boolean);
}
function getErrorMap(control) {
  return Object.fromEntries(getErrorEntries(control, ""));
  function getErrorEntries(control2, name) {
    const list = [[name, control2.error()]];
    control2.fields().forEach((value, key) => {
      list.push(
        ...getErrorEntries(
          value,
          name ? name + "." + String(key) : String(key)
        )
      );
    });
    return list;
  }
}
function getInputProps(field) {
  return {
    onInput: (e) => field.setValue(e.target.value),
    onBlur: (e) => field.setTouchCount((v) => v + 1),
    ref: field.ref,
    value: field.value(),
    name: String(field.name)
  };
}

export { ArrayField, Field, Form, createArrayField, createArrayMethods, createControl, createField, createFieldComponent, createForm, custom, equals, getErrorList, getErrorMap, getInputProps, hiddenControlProps, max, maxLength, min, minLength, pattern, registerField, required, unregisterField };
