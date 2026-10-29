import { useNavigate } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import Head from '@/components/Head';
import { goToJobs } from '@/redux/actions/app.action';
import { clearRecycleBinInCloud } from '@/redux/actions/misc.action';

import MiscButton from './MiscButton';


const FILES_TO_DELETE = 100;

const Misc = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    t,
  } = useTranslation();

  /**
   * button with action used for each misc action
   * @param color
   * @param label
   * @param action
   * @param withSeparator
   * @returns
   */
  const miscButton = (color: string, label: string, action: () => void, withSeparator = false): ReactNode => {
    return (
      <MiscButton
        action={action}
        color={color}
        label={label}
        withSeparator={withSeparator}
      />
    );
  };

  const handleGoToJobs = () => navigate(goToJobs());
  const handleClearFilesInCloud = () => dispatch(clearRecycleBinInCloud(FILES_TO_DELETE));


  return (
    <>
      <Head title={t('misc.miscellaneous')} />
      <div className="flexColumn center flex1 stretchSelf" css={{ gap: 12 }}>
        {miscButton('green', t('misc.showJobStatus'), handleGoToJobs, true)}
        {miscButton(
          'red',
          `${t('misc.clearFilesFromRecycleBinInCloud')} (${FILES_TO_DELETE})`,
          handleClearFilesInCloud,
          true
        )}
      </div>
    </>
  );
};

export default Misc;
