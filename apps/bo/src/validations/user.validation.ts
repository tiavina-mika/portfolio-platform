import {
  object, string, literal, array, boolean, union,
} from 'zod';

import { dateForAdvancedSearchSchema } from './app.validations';

export const ABOUT_ME_LENGTH = 500;

const sexSchema = union([literal('male'), literal('female')]);

export const userFilterSchema = object({
  lastName: string().optional(),
  firstName: string().optional(),
  sex: array(string().optional()).optional().or(sexSchema).optional(),
  birthday: dateForAdvancedSearchSchema,
  createdAt: dateForAdvancedSearchSchema,
  updatedAt: dateForAdvancedSearchSchema,
  platforms: array(string().optional()).optional(),
  isOnline: array(boolean().optional()).optional(),
  verified: boolean().optional(),
});

export const usersRouteSearchParams = object({
  role: string().optional(),
  from: string().optional(),
  tab: string().optional(),
});
