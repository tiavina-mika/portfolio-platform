# Zod – Required and Optional Strings

## Overview
- We treat zod errors in a global config file (`config/i18n/zod-i18n.ts`).
- We can override default error messages for each field in the schema using `message` option.
- We use `preprocess` to handle empty strings and null values for required and optional fields
- To display the field name in error messages
  - Add the field name in the i18n translation files (`bo/src/config/i18n/locales/{locale}/form.json`)
  - In `name` key, e.g., `"name": "the name"`

## NOTE
- Zod take `null` and `undefined` differently.
- `undefined` is used for optional fields (not provided).
- `null` is considered invalid type (not provided).
- To accept `null` as valid for optional fields, use preprocess to convert null to undefined.
  - Use preprocess
  - e.g., z.preprocess((val) => (val === null ? undefined : val), z.string().optional())
  - It's valable for every type (string, date, number, file, etc.)

## Display error:
```typescript
  console.log('required undefined: ',
    JSON.parse(JSON.stringify(requiredDateSchema.safeParse(undefined).error?.issues?.[0].message))
  );

```

## String schema with required and optional fields
### Code
```typescript
const categorySchema = z.object({
	'fr:title': z.string().nonempty(),      // required, not empty
	'en:title': z.string().optional(),      // optional
});
```

### Validation

- `{ 'fr:title': 'French title', 'en:title': 'Title in English' }` → success
- `{ 'fr:title': 5, 'en:title': 'Title in English' }` → error: fr:title must be a non-empty string
- `{ 'fr:title': 'French title' }` → success (en:title is optional)

#### Required non-empty string

```typescript
const requiredStringSchema = z.string().nonempty();
```
- `''` → error: empty string not allowed
- `5` → error: expected string

#### Optional string

```typescript
const nonRequiredStringSchema = z.string().optional();
```
- `'Hello'` → success
- `''` → success (empty allowed)
- `5` → error: expected string
- `null` → error: expected string or undefined (Important: null is considered invalid here not undefined)(To be fixed using preprocess)

#### Get error message

```typescript
const result = requiredStringSchema.safeParse('');
if (!result.success) {
	console.log(result.error.issues[0].message); // "Required"
}
```

---

**Summary:**
- `.nonempty()`: required, non-empty string
- `.optional()`: optional string, empty allowed
- Use `safeParse` to validate and get errors

## Date

### Required date schema
```typescript
const requiredDateSchema = z.preprocess(
  (val) => (val === '' || val === null ? undefined : val),
  z.date()
);
```

#### Validation examples

- `undefined` → error: Required
- `null` → error: Required
- `''` (empty string) → error: Required
- `new Date()` → success (valid date)
- `'invalid date'` → error: Invalid date

#### Get error message

```typescript
  console.log('required undefined: ',
    JSON.parse(JSON.stringify(requiredDateSchema.safeParse(undefined).error?.issues?.[0].message))
  );

```
### Optional date schema
```typescript
const nonRequiredDateSchema = z.preprocess(
  (val) => (val === '' || val === null ? undefined : val),
  z.date().optional()
);
```
#### Validation examples
- `undefined` → success
- `null` → success
- `''` (empty string) → success
- `new Date()` → success (valid date)
- `'invalid date'` → error: Invalid date
- 
## Number schema
### Required number schema
```typescript
const numberSchema = z.preprocess(
    (val) => (val === '' || val === null ? undefined : Number(val)),
    z.number()
);
```

#### Validation examples
- `undefined` → error: Required
- `null` → error: Required
- `''` (empty string) → error: Required
- `5` → success (valid number)
- `'5'` → success (valid number)
- `'invalid number'` → error: Invalid number

### Optional number schema
```typescript
const nonRequiredNumberSchema = z.preprocess(
    (val) => (val === '' || val === null ? undefined : Number(val)),
    z.number().optional()
);
```
#### Validation examples
- `undefined` → success
- `null` → success
- `''` (empty string) → success
- `5` → success (valid number)
- `'5'` → success (valid number)
- `'invalid number'` → error: Invalid number

## File schema
### Required file schema
#### Code
```typescript
const requiredFileSchema = z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.file()
);
```
#### Validation
- `undefined` → error: Required
- `null` → error: Required
- `''` (empty string) → error: Required
- `new File(['content'], 'test.txt', { type: 'text/plain' })` → success (valid file)
- `'invalid file'` → error: Invalid file

### Option schema
#### Code
```typescript
const schema = z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.file().min(1).max(5).mime(['image/png', 'image/jpg'])
);
```

#### Validation
- `[]` → error: file too small
- `[new File(['content'], 'test.txt', { type: 'image/jpg' })]` → success (valid file)
- `[new File(['c'.repeat(6)], 'file2.png', { type: 'image/png' })]` → error: file too big
- `[new File(['content'], 'file3.jpg', { type: 'text/plain' })]` → error: invalid file

### Optional file
#### Code
```typescript
const schema = z.preprocess(
    (val) => (val === '' || val === null ? undefined : val),
    z.file().optional()
);
```

#### Validation
- `undefined` → success
- `null` → success
- `''` (empty string) → success
## Array of files schema
### Required array of files schema
```typescript
const requiredArrayOfFilesSchema = z.array(z.file().min(1).max(5)).min(1).max(5);
```
#### Validation
- `undefined` → error: Required
- `null` → error: Required
- `''` (empty string) → error: Required
- `[new File(['content'], 'test.txt', { type: 'image/jpg' })]` → success (valid file)
- `[new File(['c'.repeat(6)], 'file2.png', { type: 'image/png' })]` → error: file too big
- `[new File(['content'], 'file3.jpg', { type: 'text/plain' })]` → error: invalid file

### Optional array of files schema
```typescript
const optionalArrayOfFilesSchema = z.array(z.file().min(1).max(5)).min(1).max(5).optional();
```
#### Validation
- `undefined` → success
- `null` → success
- `''` (empty string) → success