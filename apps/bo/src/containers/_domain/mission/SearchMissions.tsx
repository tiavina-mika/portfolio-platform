import { Stack } from '@mui/material';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import SearchInput from '@/components/form/inputs/SearchInput';
import ToggleButtonsField from '@/components/form/inputs/ToggleButtonsField';
import AdvancedSearchForm from '@/components/search/AdvancedSearchForm';
import { IRenderSearchProps, ISelectOption } from '@/types/_core/app.type';
import { MissionFiltersInput, missionFilterSchema } from '@/validations/_domain/mission.validation';

// the search box (a part of the title) and "my missions", the ones given to the signed-in user
const SearchMissions = ({ onSearch, onAdvancedSearch }: IRenderSearchProps) => {
  const { t } = useTranslation(['project']);

  const assigneeOptions = useMemo((): ISelectOption<boolean>[] => [
    { label: t('project:mission.myMissions'), value: true },
  ], [t]);

  return (
    <>
      <Stack direction="row" spacing={2}>
        <SearchInput name="text" onChange={onSearch} placeholder={t('project:mission.searchMission')} />
      </Stack>
      <AdvancedSearchForm<MissionFiltersInput>
        onSubmit={onAdvancedSearch}
        schema={missionFilterSchema}
        fields={[
          {
            label: t('project:mission.assignee'),
            name: 'mine',
            component: <ToggleButtonsField name="mine" options={assigneeOptions} />,
          },
        ]}
      />
    </>
  );
};

export default SearchMissions;
