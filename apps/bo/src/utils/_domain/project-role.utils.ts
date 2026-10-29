import i18n from '@/config/i18n';
import { registerRightsEntities } from '@/constants/_core/user.constants';
import { PROJECT_COLLECTION } from '@/constants/_domain/project.constants';

/**
 * Side-effect only: registers the project entity on the generic role rights table. Imported once
 * for effect from `config/domain-registrations.ts`, the composition point loaded eagerly at app
 * startup.
 */
registerRightsEntities([
  {
    label: i18n.t('project:project.projects'),
    className: PROJECT_COLLECTION,
  },
], 'operations');
