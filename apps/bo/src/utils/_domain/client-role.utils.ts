import i18n from '@/config/i18n';
import { registerRightsEntities } from '@/constants/_core/user.constants';
import { CLIENT_COLLECTION } from '@/constants/_domain/client.constants';

/**
 * Side-effect only: registers the Aldaron clients on the generic role rights table, so a role can be
 * given the rights to read, create or edit them. Imported once for effect from
 * `config/domain-registrations.ts`. A right is not enough on its own: the role must also open the
 * Aldaron workspace, which the server checks on every call.
 */
registerRightsEntities([
  {
    label: i18n.t('project:client.clients'),
    className: CLIENT_COLLECTION,
  },
], 'operations');
