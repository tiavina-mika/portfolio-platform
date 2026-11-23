import { TargetEnum } from '@shared/types';

import ContactQuoteAction from '@/containers/_domain/quote/ContactQuoteAction';
import { registerContactDetailActions } from '@/utils/_core/contact.utils';

/**
 * Side-effect only: adds "Create the client and the quote" under the messages of the agency workspace —
 * the quote requests of its site. Imported once for effect from `config/domain-registrations.ts`.
 */
registerContactDetailActions([
  {
    id: 'quoteFromContact',
    workspaces: [TargetEnum.AGENCY],
    component: ContactQuoteAction,
  },
]);
