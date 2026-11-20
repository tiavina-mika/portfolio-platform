import { AdminAccountDeletionReasonEnum } from '@shared/types';
import { z } from 'zod';

/*
 * Deleting an account from the back-office is a decision taken on someone else's account: the reason
 * is required, and "other" says nothing until it is written out. A shape plus a predicate rather than
 * one refined object: the server adds the ids the deletion is for around it, and the back-office
 * puts its own translated message on the refusal.
 */
export const adminAccountDeletionShape = {
  reason: z.enum(AdminAccountDeletionReasonEnum),
  reasonDetails: z.string().trim().max(500).optional(),
};

export const hasAdminAccountDeletionDetails = (
  value: { reason: AdminAccountDeletionReasonEnum; reasonDetails?: string }
): boolean => value.reason !== AdminAccountDeletionReasonEnum.OTHER || !!value.reasonDetails;
