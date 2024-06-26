<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=solid-x-form&background=tiles&project=%20" alt="solid-x-form">
</p>

# solid-x-form

A versatile form management library designed specifically for Solid.js applications. It emphasizes type safety, modularity, and a recursive organizational structure to handle complex form scenarios with ease. Built on Solid.js's reactive principles, SolidForm leverages render props to provide flexible rendering capabilities and maintain robust type checking for enhanced developer productivity and code reliability.

## Quick start

Install:

```bash
npm i solid-x-form
```

Use:

```javascript
import { createForm } from "solid-x-form";

export function BasicExample() {
  const { Field, handleSubmit } = createForm({
    initialValue: {
      firstName: "",
      lastName: "",
    },
  });

  return (
    <div>
      <Field name="firstName">
        {({ value, setValue }) => (
          <input value={value()} onInput={(e) => setValue(e.target.value)} />
        )}
      </Field>
      <Field name="lastName">
        {({ value, setValue }) => (
          <input value={value()} onInput={(e) => setValue(e.target.value)} />
        )}
      </Field>
      <button
        onclick={() =>
          handleSubmit(
            (values) => console.log("Form is Valid", values),
            (form) => console.log("Form is invalid", form.error)
          )
        }
      >
        Submit
      </button>
    </div>
  );
}
```

# API

## createForm

- **Props:**

  - `initialValue`: Initial values object for the form. Types are inferred from this value if generic is not provided.
  - `validate`: Function to validate the form value and return a string. Can be async/promise.
  - `validationMethod`: When to run validate on form and children.
    - 'onChange'
    - 'onChangeAfterSubmit'
    - 'onSubmit' Default

- **API:**

  - `control`: Control object to pass to Field/ArrayField/Custom Fields.
  - `Field` Field Component with `control` already linked
  - `handleSubmit` method for form submission handling.
  - `response` accessor for handling form submission responses.
  - `value` accessor for current form value
  - `setValue` setter for form value

  - `initialValue`
  - `error`
  - `errorList`
  - `isDirty`
  - `isPristine`
  - `validate`
  - `isValid`
  - `isInvalid`
  - `isValidated`
  - `isValidating`
  - `isSubmitted`
  - `isSubmitting`
  - `validationMethod`

## Field

Renders a specific field within a parent object.

- **Props:**

  - `control`: Control object for managing the form state if not using linked Field.
  - `name`: Key of the field in the parent object.
  - `validate`: Function to validate the form value.
  - `validationMethod`: When to run validate on self and children.
    - 'onChange'
    - 'onChangeAfterSubmit'
    - 'onChangeAfterBlur'
    - 'onBlur'
    - 'onBlurAfterSubmit'
    - 'onSubmit'

- **API:**
  - `Control`: Control object to pass to Field/ArrayField/Custom Fields.
  - `Field` Field Component with `control` already linked
  - `value`
  - `setValue`
  - `fields`
  - `fieldList`
  - `initialValue`
  - `error`
  - `errorList`
  - `isDirty`
  - `isPristine`
  - `validate`
  - `isValid`
  - `isInvalid`
  - `isValidated`
  - `isValidating`
  - `isSubmitted`
  - `isSubmitting`
  - `ref`
  - `isTouched`
  - `setIsTouched`
  - `validationMethod`
  - `onBlur`

# Examples

## Nested Values

Using nested values is as simple as using a Field component's Field property to render it's child fields. This can be done as ddep as needed.

```jsx
import { createForm } from "solid-x-form";

const initialValue = {
  name: {
    first: "",
    last: "",
  },
};

export function NestedExample() {
  const { Field, handleSubmit } = createForm({ initialValue });

  return (
    <div>
      <Field name="name">
        {({ Field }) => (
          <>
            <Field name="first">
              {({ value, setValue }) => (
                <input
                  type="text"
                  value={value()}
                  onInput={(e) => setValue(e.target.value)}
                />
              )}
            </Field>
            <Field name="last">
              {({ value, setValue }) => (
                <input
                  type="text"
                  value={value()}
                  onInput={(e) => setValue(e.target.value)}
                />
              )}
            </Field>
          </>
        )}
      </Field>
      <button type="submit" onclick={() => handleSubmit(console.log)}>
        Submit
      </button>
    </div>
  );
}
```

## Array Values

The ArrayField returns a Fields Component which provides a template for the array (Essentially an Index of each value with a registered field). Nested fields and array fields can be within the array field. For example a jagegd array or an array of objects.

```jsx
import { createForm, ArrayField } from "solid-x-form";

const initialValue = {
  fruits: ["Apple", "Banana"],
};

export function ArrayExample() {
  const { handleSubmit, control } = createForm({ initialValue });

  return (
    <div>
      <ArrayField control={control} name={"fruits"}>
        {({ Fields, append, remove }) => (
          <>
            <Fields>
              {({ value, setValue, index }) => (
                <input
                  type="text"
                  value={value()}
                  onInput={(e) => setValue(e.target.value)}
                  ondblclick={() => remove(index)}
                />
              )}
            </Fields>
            <button onclick={() => append("")}>New Fruit</button>
          </>
        )}
      </ArrayField>
      <button type="submit" onclick={() => handleSubmit(console.log)}>
        Submit
      </button>
    </div>
  );
}
```

## Custom Fields
There are two methods for creating resuable components. First is using the internal function of the Field component. The second is just create a component where the props are the render props of Field.

```tsx
import { createField, createForm } from "solid-x-form";
import type { FieldApi, FieldProps } from "solid-x-form";

function CustomField1<T>(props: FieldProps<T, keyof T, string>) {
  const field = createField<T, keyof T, string>(props);

  return (
    <label>
      {String(field.name)}
      <input
        value={field.value()}
        onInput={(e) => field.setValue(e.target.value)}
      />
    </label>
  );
}

function CustomField2<T>(field: FieldApi<T, keyof T, string>) {
  return (
    <label>
      {String(field.name)}
      <input
        value={field.value()}
        onInput={(e) => field.setValue(e.target.value)}
      />
    </label>
  );
}

export function CustomExample() {
  const { Field, handleSubmit, control } = createForm({
    initialValue: {
      firstName: "",
      lastName: "",
    },
  });

  return (
    <div>
      <CustomField1 control={control} name={"firstName"} />
      <Field name="lastName">{CustomField2}</Field>
      <button
        onclick={() =>
          handleSubmit(
            (values) => console.log("Form is Valid", values),
            (form) => console.log("Form is invalid", form.error)
          )
        }
      >
        Submit
      </button>
    </div>
  );
}
```

## Validation
the validate function can do both sync and async functions that accept the value of that field and return a string with the error or empty string if valid. There are some helper validation function for common cases. 
The form/field will validate all children and wait for any async validations to finish before toggling isValidating off and isValidated on
```tsx
import { createForm, required, minLength, getErrorMap } from "..";

export function BasicExample() {
  const { Field, handleSubmit, error, isValidating } = createForm({
    initialValue: {
      firstName: "",
      lastName: "",
    },
    validationMethod: "onChange",
    validate: (v) =>
      v.firstName == v.lastName
        ? "First name cannot be the same as last name"
        : "",
  });

  return (
    <div>
      <Field
        name="firstName"
        validate={required(
          "Required",
          minLength(4, "Must be at least 4 characters")
        )}
      >
        {({ value, setValue, error }) => (
          <>
            <input value={value()} onInput={(e) => setValue(e.target.value)} />
            <span>{error()}</span>
          </>
        )}
      </Field>
      <Field name="lastName" validate={asyncValidation}>
        {({ value, setValue, error }) => (
          <>
            <input value={value()} onInput={(e) => setValue(e.target.value)} />
            <span>{error()}</span>
          </>
        )}
      </Field>
      {error()}
      <button
        onclick={() =>
          handleSubmit(
            (values) => console.log("Form is Valid", values),
            (form) => console.log("Form is invalid", getErrorMap(form))
          )
        }
      >
        Submit - {isValidating() ? "Validating" : ""}
      </button>
    </div>
  );
}

async function asyncValidation(value: string): Promise<string> {
  await new Promise((resolve) => setTimeout(resolve, 500)); // Simulate 100ms delay
  return value.length > 4 ? "Name must be at least 4 characters" : "";
}
```

# License

This library is licensed under the MIT License.
