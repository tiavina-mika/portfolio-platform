import i18n from '@/config/i18n';
import { registerRightsEntities } from '@/constants/_core/user.constants';
import { PAYMENT_COLLECTION } from '@/constants/_domain/payment.constants';

/**
 * Side-effect only: registers the payments of the Aldaron quotes on the generic role rights table, so a
 * role can be given the rights to read them, record them as paid (`update`) and correct them (`create`,
 * which writes the replacement of a cancelled payment). Nobody deletes a payment. Imported once for effect
 * from `config/domain-registrations.ts`; the role must also open the Aldaron workspace, which the server
 * checks on every call.
 */
registerRightsEntities([
  {
    label: i18n.t('project:payment.payments'),
    className: PAYMENT_COLLECTION,
  },
], 'operations');
