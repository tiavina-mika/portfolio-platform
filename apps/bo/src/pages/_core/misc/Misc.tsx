/* eslint-disable @cspell/spellchecker */
import { useNavigate, useRouterState } from '@tanstack/react-router';
import Parse from 'parse';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';

import Head from '@/components/Head';
import {
  BATCH_TEST_COUNT, FILES_TO_DELETE, MISC_TAB_OPTIONS, ORPHANED_EDITOR_FILES_OLDER_THAN_HOURS,
} from '@/constants/_core/misc.constants';
import JobsStatus from '@/containers/_core/misc/jobs/JobsStatus';
import MiscTabs from '@/containers/_core/misc/MiscTabs';
import { useToggle } from '@/hooks/_core/useToggle';
import MiscButton from '@/pages/_core/misc/MiscButton';
import TestEmailsModal from '@/pages/_core/misc/TestEmailsModal';
import TestSmsModal from '@/pages/_core/misc/TestSmsModal';
import { createOrUpdateArticle } from '@/redux/actions/_core/article.action';
import {
  clearRecycleBinInCloud, purgeOrphanedEditorFilesInCloud,
} from '@/redux/actions/_core/misc.action';
import { createBatchTest, deleteBatchTest } from '@/redux/actions/_core/test.action';
import { getRoleCurrentUserRolesSelector } from '@/redux/reducers/_core/role.reducer';
import { miscRoute } from '@/routes/protected/_core/misc.routes';
import { MiscOption, MiscTab, MiscTabEnum } from '@/types/_core/app.type';
import { canAccessTo } from '@/utils/_core/role.utils';

const testArticle = {
  categories: [{
    __multiple: 'Pointer',
    className: 'Category',
    objectId: 'BhSBy8MQev',
  }],
  translated: {
    en: {
      slug: '',
      tags: '',
      metaTitle: '',
      metaDescription: '',
      description: '',
      title: '',
      content: '',
    },
    fr: {
      slug: 'baudelaire-les-fleurs-du-mal',
      tags: 'baudelaire, poésie',
      metaTitle: 'Baudelaire - Les Fleurs du Mal',
      metaDescription: 'Extrait de "Les Fleurs du Mal" de Charles Baudelaire',
      description: 'Extrait du célèbre recueil de poèmes "Les Fleurs du Mal" de Charles Baudelaire.',
      title: 'Les Fleurs du Mal - Charles Baudelaire',
      content: `<h3 class="custom-heading">Extrait</h3>
        <p>Recueil: Les Fleurs du Mal</p>
        <blockquote>
          <p>Homme libre, toujours tu chériras la mer !<br />
          La mer est ton miroir ; tu contemples ton âme<br />
          Dans le déroulement infini de sa lame,<br />
          Et ton esprit n’est pas un gouffre moins amer.</p>
        </blockquote>
        <p>Charles Baudelaire</p>`,
    },
    mg: {
      slug: '',
      tags: '',
      metaTitle: '',
      metaDescription: '',
      description: '',
      title: '',
      content: '',
    },
  },
};

const Misc = () => {
  const navigate = useNavigate();
  const router = useRouterState();
  const dispatch = useDispatch();
  const {
    t,
  } = useTranslation();
  const roles = useSelector(getRoleCurrentUserRolesSelector);
  const { open: isTestEmailsOpen, toggle: toggleTestEmails } = useToggle();
  const { open: isTestSmsOpen, toggle: toggleTestSms } = useToggle();

  // only keep the tabs the current role is allowed to see
  const availableTabOptions = MISC_TAB_OPTIONS.filter(
    (option) => canAccessTo(roles, undefined, undefined, option.uiRight)
  );

  const searchParams: { tab?: MiscTab } = miscRoute.useSearch();
  const tab = searchParams.tab ?? availableTabOptions[0]?.value;

  const handleTabChange = (value: MiscTab) => {
    navigate({ to: router.location.pathname, search: { tab: value } } as any);
  };

  const handleClearFilesInCloud = () => dispatch(clearRecycleBinInCloud(FILES_TO_DELETE));
  const handlePurgeOrphanedEditorFiles = () => (
    dispatch(purgeOrphanedEditorFilesInCloud(ORPHANED_EDITOR_FILES_OLDER_THAN_HOURS))
  );
  const handleCreateBatchTest = () => dispatch(createBatchTest(BATCH_TEST_COUNT));
  const handleDeleteBatchTest = () => dispatch(deleteBatchTest());
  const handleCreateArticle = () => dispatch(createOrUpdateArticle({ values: testArticle }));
  const handleCreateRide = async () => {
    await Parse.Cloud.run('createRideMock');
  };

  const migrationsOptions: MiscOption[] = [
    {
      color: 'red',
      label: `${t('misc.clearFilesFromRecycleBinInCloud')} (${FILES_TO_DELETE})`,
      action: handleClearFilesInCloud,
      withSeparator: true,
    },
    {
      color: 'red',
      label: `${t('misc.purgeOrphanedEditorFilesInCloud')} (${ORPHANED_EDITOR_FILES_OLDER_THAN_HOURS}h+)`,
      action: handlePurgeOrphanedEditorFiles,
    },
  ];

  const testsOptions: MiscOption[] = [
    {
      color: 'green',
      label: t('misc.createRideMock'),
      action: handleCreateRide,
      withSeparator: true,
    },
    {
      color: 'red',
      label: `${t('misc.createBatchTest')} (${BATCH_TEST_COUNT})`,
      action: handleCreateBatchTest,
      withSeparator: true,
    },
    {
      color: 'red',
      label: t('misc.deleteBatchTest'),
      action: handleDeleteBatchTest,
      withSeparator: true,
    },
    {
      color: 'red',
      label: t('misc.createArticle'),
      action: handleCreateArticle,
      withSeparator: true,
    },
    {
      color: 'grey',
      label: t('misc.testEmails'),
      action: toggleTestEmails,
      withSeparator: true,
    },
    {
      color: 'grey',
      label: t('misc.testSms'),
      action: toggleTestSms,
    },
  ];

  return (
    <>
      <Head title={t('misc.miscellaneous')} />
      <div className="flexColumn center flex1 stretchSelf" css={{ gap: 24 }}>
        <MiscTabs onTabChange={handleTabChange} options={availableTabOptions} tab={tab} />
        {tab === MiscTabEnum.MIGRATIONS && (
          <div className="flexColumn center" css={{ gap: 12 }}>
            {migrationsOptions.map((option, index) => (
              <MiscButton
                action={option.action}
                color={option.color}
                key={index}
                label={option.label}
                withSeparator={option.withSeparator}
              />
            ))}
          </div>
        )}
        {tab === MiscTabEnum.CRON && <JobsStatus />}
        {tab === MiscTabEnum.TESTS && (
          <div className="flexColumn center" css={{ gap: 12 }}>
            {testsOptions.map((option, index) => (
              <MiscButton
                action={option.action}
                color={option.color}
                key={index}
                label={option.label}
                withSeparator={option.withSeparator}
              />
            ))}
          </div>
        )}
      </div>
      <TestEmailsModal open={isTestEmailsOpen} toggle={toggleTestEmails} />
      <TestSmsModal open={isTestSmsOpen} toggle={toggleTestSms} />
    </>
  );
};

export default Misc;
