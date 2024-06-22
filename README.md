<p>
  <img width="100%" src="https://assets.solidjs.com/banner?type=solid-x-form&background=tiles&project=%20" alt="solid-x-form">
</p>

# solid-x-form

[![pnpm](https://img.shields.io/badge/maintained%20with-pnpm-cc00ff.svg?style=for-the-badge&logo=pnpm)](https://pnpm.io/)

A recursive form library that emphasizes type safety and

## Quick start

Install it:

```bash
npm i solid-x-form
# or
yarn add solid-x-form
# or
pnpm add solid-x-form
```

Import it:

```javascript
import { createForm, ArrayField } from 'solid-x-form'
```

## Form

- **Props:**

  - `initialValue`: Initial values object for the form.
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
  - `handleSubmit` method for form submission handling.
  - `response` accessor for handling form submission responses.
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

## Example

```jsx
import { createForm, Form, Field, ArrayField } from 'solid-x-form'

const initialValues = {
  name: {
    first: '',
    last: '',
  },
  email: '',
  hobbies: [''],
}

const App = () => {
  const {Field, handleSubmit, control} = createForm({ initialValue: initialValues })

  return (
        <form >
          <Field name="name">
            {({ Field }) => (
              <>
                <Field name="first">
                  {({ value, setValue }) => (
                    <input type="text" value={value()} onInput={e => setValue(e.target.value)} />
                  )}
                </Field>
                <Field name="last">
                  {({ value, setValue  }) => (
                    <input type="text" value={value()} onInput={e => setValue(e.target.value)} />
                  )}
                </Field>
              </>
            )}
          </Field>
          <Field name="email">
            {({ value, setValue }) => (
              <input type="email" value={value()} onInput={e => setValue(e.target.value)} />
            )}
          </Field>
          <ArrayField control={} name="hobbies">
            {({ Fields, append }) => (
              <div>
                <Fields>
                  {({ index, value, setValue }) => (
                    <div>
                      <input type="text" value={value()} onInput={e => setValue(e.target.value)} />
                    </div>
                  )}
                </Fields>
                <button type="button" onClick={() => append('')}>
                  Add Hobby
                </button>
              </div>
            )}
          </ArrayField>
          <button type="submit" onclick={()=>handleSubmit(console.log)}>Submit</button>
        </form>

  )
}

export default App
```

### Contributions

Contributions and feedback are welcome. Please feel free to raise issues on [GitHub](https://github.com/your-library-repo).

### License

This library is licensed under the MIT License.
