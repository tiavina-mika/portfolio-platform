import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import SearchInput from '@/components/form/inputs/SearchInput';
import CategoryAdvancedFilterForm from '@/containers/_core/categories/CategoryAdvancedFilterForm';
import { IRenderSearchProps } from '@/types/_core/app.type';


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
          onChange={onSearch}
          placeholder={t('cms:category.searchCategory')}
        />
      </Stack>
      <CategoryAdvancedFilterForm onSubmit={onAdvancedSearch} />
    </>
  );
};

export default SearchCategories;
