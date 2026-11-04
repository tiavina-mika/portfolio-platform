import { string } from 'zod';

import { paginationQuerySchema } from './util.validations';

export const getRoleAuditLogsSchema = paginationQuerySchema.extend({
  // narrows the trail to one role, for the role preview
  roleName: string().optional(),
});
