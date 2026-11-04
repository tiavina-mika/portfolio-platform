import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import SearchInput from '@/components/form/inputs/SearchInput';
import ProjectAdvancedFilterForm from '@/containers/_domain/project/ProjectAdvancedFilterForm';
import { IRenderSearchProps } from '@/types/_core/app.type';

const SearchProjects = ({ onSearch, onAdvancedSearch }: IRenderSearchProps) => {
  const { t } = useTranslation();

  return (
    <>
      <Stack direction="row" spacing={2}>
        <SearchInput
          name="text"
          onChange={onSearch}
          placeholder={t('project:project.searchByName')}
        />
      </Stack>
      <ProjectAdvancedFilterForm onSubmit={onAdvancedSearch} />
    </>
  );
};

export default SearchProjects;
