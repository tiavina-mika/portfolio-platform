import i18n from '@/config/i18n';
import { ISelectOption, MiscTabEnum, MiscTab } from '@/types/_core/app.type';
import { UIRoleEnum } from '@/types/_core/role.type';

export const FILES_TO_DELETE = 100;
export const ORPHANED_EDITOR_FILES_OLDER_THAN_HOURS = 24;
export const BATCH_TEST_COUNT = 1000;

// tabs of the "Divers" page — each tab carries the UI right required to see it
export const MISC_TAB_OPTIONS: (ISelectOption<MiscTab> & { uiRight: UIRoleEnum })[] = [
  {
    value: MiscTabEnum.MIGRATIONS,
    label: i18n.t('common:misc.migrations'),
    uiRight: UIRoleEnum.MIGRATIONS,
  },
  {
    value: MiscTabEnum.CRON,
    label: i18n.t('common:misc.cron'),
    uiRight: UIRoleEnum.CRON,
  },
  {
    value: MiscTabEnum.TESTS,
    label: i18n.t('common:misc.tests'),
    uiRight: UIRoleEnum.TESTS,
  },
];
