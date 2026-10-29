import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import SearchInput from '@/components/form/inputs/SearchInput';
import { IRenderSearchProps } from '@/types/app.type';

import PageAdvancedFilterForm from './PageAdvancedFilterForm';

const SearchPages = ({
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
      </Stack>
      <PageAdvancedFilterForm onSubmit={onAdvancedSearch} />
    </>
  );
};

export default SearchPages;
