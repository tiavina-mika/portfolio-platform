import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import SearchInput from '@/components/form/inputs/SearchInput';
import { IRenderSearchProps } from '@/types/app.type';

import ProjectAdvancedFilterForm from './ProjectAdvancedFilterForm';

const SearchProjects = ({
  onSearch, onAdvancedSearch,
}: IRenderSearchProps) => {
  const {
    t,
  } = useTranslation();

  return (
    <>
      <Stack direction="row" spacing={2}>
        <SearchInput
          name="text"
          onChange={onSearch}
          placeholder={t('cms:searchByPage')}
        />
        <SearchInput
          name="user"
          onChange={onSearch}
          placeholder={t('cms:searchByAuthor')}
        />
      </Stack>
      <ProjectAdvancedFilterForm onSubmit={onAdvancedSearch} />
    </>
  );
};

export default SearchProjects;
