import { retryFailedPlatformPayments } from '../../services/_core/payment-retry.service.cloud';
import { reconcilePendingPayments } from '../../services/_core/payment-settlement.service.cloud';
import { updatePaymentAfterSave } from '../../services/_core/payment.service.cloud';
import { defineJob } from '../../utils/_core/job.utils.cloud';

type RequestParams = {
  id?: string;
  dirtyKeys?: string[];
};
defineJob('updatePaymentAfterSaveJob',
  async (
    request: Parse.Cloud.JobRequest<RequestParams>
  ): Promise<void> => {
    const { id, dirtyKeys } = request.params || {};

    if (!id || !dirtyKeys) return;

    await updatePaymentAfterSave(id, dirtyKeys);
  });

defineJob('retryFailedPlatformPaymentsJob',
  async (_request: Parse.Cloud.JobRequest<object>): Promise<void> => {
    await retryFailedPlatformPayments();
  });

defineJob('reconcilePendingPaymentsJob',
  async (_request: Parse.Cloud.JobRequest<object>): Promise<void> => {
    await reconcilePendingPayments();
  });
