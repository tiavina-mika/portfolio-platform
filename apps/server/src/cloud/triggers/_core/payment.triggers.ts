
import type { Locale } from '@/types/app.type';

import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import { collections } from '@/constants/_core/constants';

import { isImpersonatedSessionService } from '../../services/_core/impersonation.service.cloud';
import { runJob } from '../../utils/_core/job.utils.cloud';
import { isPaymentRelatedFieldDirty } from '../../utils/_core/payment-fields.utils.cloud';
import { parseFunction, setBooleanFields, setStatusFields } from '../../utils/_core/utils.cloud';

export const Payment = Parse.Object.extend(collections.Payment);

Parse.Cloud.beforeSave(
  collections.Payment,
  parseFunction(async (request: Parse.Cloud.BeforeSaveRequest): Promise<void | undefined> => {
    const payment = request.object;
    const user = request.user;
    const dirtyKeys = payment.dirtyKeys();

    request.context.dirtyKeys = dirtyKeys;

    // block payment creation/edition while the caller is an impersonated session
    if (await isImpersonatedSessionService(user?.getSessionToken())) {
      const locale = (request.context.locale as Locale) ?? DEFAULT_LANGUAGE;

      throw new Error(translate('error.actionBlockedDuringImpersonation', locale));
    }

    setStatusFields(payment, request);

    // ----------- creation ----------- //
    if (!payment.existed()) {
      payment.set('deleted', false);
      payment.set('seen', false);
      payment.set('createdBy', user);
      return;
    }


    // ----------- update ----------- //
    payment.set('updatedBy', user);

    // set boolean fields (ex: deleted => { deletedAt: date, deletedBy: user })
    setBooleanFields(payment, request);
  })
);

Parse.Cloud.afterSave(
  collections.Payment,
  parseFunction(async (request: Parse.Cloud.AfterSaveRequest): Promise<void> => {
    const payment = request.object;
    const dirtyKeys: string[] = Array.isArray(request.context.dirtyKeys)
      ? request.context.dirtyKeys
      : [];

    if (isPaymentRelatedFieldDirty(dirtyKeys)) {
      await runJob('updatePaymentAfterSaveJob', { id: payment.id, dirtyKeys });
    }
  })
);
