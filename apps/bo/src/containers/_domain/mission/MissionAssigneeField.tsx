import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';

import SelectField from '@/components/form/fields/SelectField';
import { loadMissionAssignees } from '@/redux/actions/_domain/mission.action';
import { ISelectOption } from '@/types/_core/app.type';
import { IMissionAssignee } from '@/types/_domain/mission.type';

type Props = {
  // the teammate of the mission edited, shown before the team is loaded
  initialAssignee?: IMissionAssignee | null;
};

/**
 * Who does the work: a member of the team, among the accounts whose roles open the Aldaron workspace.
 * Optional: a mission can wait for someone to take it.
 */
const MissionAssigneeField = ({ initialAssignee }: Props) => {
  const { t } = useTranslation(['project']);
  const dispatch = useDispatch();
  const [assignees, setAssignees] = useState<IMissionAssignee[]>(initialAssignee ? [initialAssignee] : []);

  useEffect(() => {
    dispatch(loadMissionAssignees((team: IMissionAssignee[]) => {
      // a teammate who since left the Aldaron roles stays shown on the mission they hold
      const isKept = !initialAssignee || team.some((assignee) => assignee.id === initialAssignee.id);

      setAssignees(isKept ? team : [initialAssignee, ...team]);
    }));
  }, [dispatch, initialAssignee]);

  const options = useMemo((): ISelectOption[] => assignees.map((assignee) => ({
    label: assignee.name,
    value: assignee.id,
  })), [assignees]);

  return (
    <SelectField
      isClearable
      label={t('project:mission.assignee')}
      name="assignee"
      options={options}
      placeholder={t('project:mission.noAssignee')}
    />
  );
};

export default MissionAssigneeField;
