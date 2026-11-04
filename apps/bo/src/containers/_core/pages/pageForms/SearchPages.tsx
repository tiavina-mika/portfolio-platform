import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import SearchInput from '@/components/form/inputs/SearchInput';
import PageAdvancedFilterForm from '@/containers/_core/pages/pageForms/PageAdvancedFilterForm';
import { IRenderSearchProps } from '@/types/_core/app.type';


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
