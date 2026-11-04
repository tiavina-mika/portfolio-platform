import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import SearchInput from '@/components/form/inputs/SearchInput';
import ArticleAdvancedFilterForm from '@/containers/_core/articles/ArticleAdvancedFilterForm';
import { IRenderSearchProps } from '@/types/_core/app.type';

const SearchArticles = ({
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
      <ArticleAdvancedFilterForm onSubmit={onAdvancedSearch} />
    </>
  );
};

export default SearchArticles;
