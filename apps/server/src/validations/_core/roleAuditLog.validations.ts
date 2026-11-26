import { string } from 'zod';

import { paginationQuerySchema, workspaceFieldSchema } from './util.validations';

export const getRoleAuditLogsSchema = paginationQuerySchema.extend({
  // narrows the trail to one role, for the role preview
  roleName: string().optional(),
  workspace: workspaceFieldSchema,
});
