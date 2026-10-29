import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import SearchInput from '@/components/form/inputs/SearchInput';
import ArticleAdvancedFilterForm from '@/containers/articles/ArticleAdvancedFilterForm';
import { IRenderSearchProps } from '@/types/app.type';

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
          placeholder={t('cms:searchByPage')}
          onChange={onSearch}
        />
        <SearchInput
          name="user"
          placeholder={t('cms:searchByAuthor')}
          onChange={onSearch}
        />
      </Stack>
      <ArticleAdvancedFilterForm onSubmit={onAdvancedSearch} />
    </>
  );
};

export default SearchArticles;
