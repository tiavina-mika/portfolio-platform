### NOTE
#### Notification
(ex: users):

the state for the notification count is in app.reducers.ts
1. dispatch the notification in onDashboardEnter
2. in user.action.ts
- add the search params to the pushed url because it redirects with a search params ?tab=new
- this will redirect to Users.tsx page with the default tab "new"
export const goToUsers = (search?: ITabSearchParams) => ({ to: PATH_NAMES.users, search });
3. in components/layouts/notifications/NotificationIcons.tsx
- add the icon and actions in the options

### TEXT EDITOR
- exemple
(Repo)[https://github.com/ZanyuanYang/Text-Editor-Tiptap/blob/master/src/pages/TextEditor/components/Tiptap.tsx]
(Demo)[https://text-editor-tiptap.vercel.app/]
(My demo)[https://codesandbox.io/s/github/tiavina-mika/tiptap-editor-mui]

### URLs
#### preprod
BO: https://tiavina-mika-bo-preprod.onrender.com
Client: https://tiavina-mika-preprod.onrender.com

#### prod
BO: https://bo-tiavina-michael-ralainirina.onrender.com
Client: https://tiavina-michael-ralainirina.onrender.com

### MUI v6 MIGRATION
#### Grid
- rename all import to Grid
  - import { Grid } from '@mui/material' => import { Grid } from '@mui/material'
  - import Grid from '@mui/material/Grid' => import Grid from '@mui/material/Grid'
- search "Grid"
- run the codemod: npx @mui/codemod@latest v6.0.0/grid-v2-props ./src/components/MyComponent.tsx
- or modify manually:
  - remove all `item` props
  - xs={2} sm={2} to size={{ xs: 2, sm: 2 }}



# CODE
### When using autocomplete + text search
- Validation:
  category: z.preprocess(
   /*
      * ISSUE: https://stackoverflow.com/questions/74256866/validating-optional-fields-in-react
      * using-zod
     */
    value => value === ''
      ? undefined
      : value,
    categoryOptionSchema.nullable().optional()
  ),
- Form
<CategoriesSearchByEntityField
  fullWidth
  isSearch
  entity={CategoryEntityEnum.PAGE}
  label=Category
  multiple={false}
  name="category"
/>

- In initial values
values.category = getCategoryInputValue(locale)(page.get('category') as any);

- initial values
const getCategoryInputValue = (locale: Locale) => (category: ICategory) => {
  return {
    label: getTranslatedField(category.get('translated'), locale, 'name'),
    value: { objectId: category.id },
  };
};

values.category = getCategoryInputValue(locale)(page.get('category') as any);