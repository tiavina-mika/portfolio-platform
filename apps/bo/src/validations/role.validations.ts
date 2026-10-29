import {
  any, array, object, string,
} from 'zod';

import i18n from '@/config/i18n';

export const roleSchema = object({
  name: string().min(1, i18n.t('form.error.required', { field: i18n.t('common:name') })),
  children: array(string()),
  ui: array(string()).optional(),
  rights: array(any()),
}).refine(
  (value: any) => {
    return !value.children.includes(value.name);
  },
  {
    message: 'Error',
    path: ['name'],
  }
);

export const rolesForUserSchema = object({
  roles: string()
    .min(1, i18n.t('form.error.required', { field: i18n.t('common:name') }))
    .array(),
});
