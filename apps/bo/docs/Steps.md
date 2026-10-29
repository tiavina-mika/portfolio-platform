# Steps
## Add new field
- e.g: `description`
- Add the field to type definitions
  - e.g., `bo/src/types/category.type.ts`
  - Add the field to `Category` interface
- Add the field to Zod schema
    - e.g., `bo/src/schemas/category.validation.ts`
    - e.g., for optional string field:
    ```typescript
    const categorySchema = z.object({
      description: z.string().optional(),
    });
    ```
- To display the field name in error messages
  - Add the field name in the i18n translation files (`bo/src/config/i18n/locales/{locale}/form.json`)
  - In `name` key, e.g., `"name": "the name"`
- Add the field to the form component
  - Use appropriate input component (TextInput, DateInput, FileInput, etc.)
- Add the field to the the list of fields to be saved
  - e.g., `bo/src/redux/actions/category.action.ts`
  - Format the field value if needed before saving
  - Add the field to the object being saved to Parse Server
    ```typescript
    const Category = Parse.Object.extend('Category');
    const category = new Category();
    category.set('description', formData.description);
    await category.save();
    ```