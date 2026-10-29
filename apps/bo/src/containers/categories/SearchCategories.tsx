import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import SearchInput from '@/components/form/inputs/SearchInput';
import { IRenderSearchProps } from '@/types/app.type';

import CategoryAdvancedFilterForm from './CategoryAdvancedFilterForm';

const SearchCategories = ({
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
          placeholder={t('cms:category.searchCategory')}
          onChange={onSearch}
        />
      </Stack>
      <CategoryAdvancedFilterForm onSubmit={onAdvancedSearch} />
    </>
  );
};

export default SearchCategories;
