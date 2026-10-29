import {
  array, object, string,
} from 'zod';

export const sendInvitationSchema = object({
  // trimmed and lower-cased, like every other address
  email: string().email().nonempty().transform((value) => value.trim().toLowerCase()),
  roles: array(string()).min(1),
});
