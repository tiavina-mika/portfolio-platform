import { useTranslation } from 'react-i18next';

import Dialog from '@/components/Dialog';
import { MISSION_FORM_ID } from '@/constants/_domain/mission.constants';
import { IMission, IMissionFormValues, IMissionPrefill } from '@/types/_domain/mission.type';

import MissionForm from './MissionForm';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: IMissionFormValues) => void;
  // the mission edited, left out to create one
  mission?: IMission | null;
  // on a new mission, the accepted quote it is created from
  prefill?: IMissionPrefill | null;
  loading?: boolean;
};

/**
 * The mission form in a dialog, shared by "New mission", "Edit" and "Create the mission" on an accepted
 * quote. The dialog stays open on a refusal, so nothing typed is lost; the page closes it once saved.
 */
const MissionFormDialog = ({
  open, onClose, onSubmit, mission, prefill, loading,
}: Props) => {
  const { t } = useTranslation(['project', 'common']);

  const getTitle = (): string => {
    if (mission) return t('project:mission.editMission', { title: mission.title });
    if (prefill) return t('project:mission.createMissionFromQuote', { number: prefill.quote.number });

    return t('project:mission.createMission');
  };

  return (
    <Dialog
      fullWidth
      formId={MISSION_FORM_ID}
      loading={loading}
      maxWidth="md"
      open={open}
      primaryButtonText={t('common:save')}
      title={getTitle()}
      toggle={onClose}
    >
      {/* keyed on the mission, so the form starts again from it each time the dialog opens */}
      {open && (
        <MissionForm
          key={mission?.id ?? `new-${prefill?.quote.id ?? ''}`}
          mission={mission}
          onSubmit={onSubmit}
          prefill={prefill}
        />
      )}
    </Dialog>
  );
};

export default MissionFormDialog;
