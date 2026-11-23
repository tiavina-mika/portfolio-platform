import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import SearchInput from '@/components/form/inputs/SearchInput';
import { IRenderSearchProps } from '@/types/_core/app.type';

// the search box: a part of the number or of the title; the status is picked with the tabs
const SearchQuotes = ({ onSearch }: IRenderSearchProps) => {
  const { t } = useTranslation(['project']);

  return (
    <Stack direction="row" spacing={2}>
      <SearchInput name="text" onChange={onSearch} placeholder={t('project:quote.searchQuote')} />
    </Stack>
  );
};

export default SearchQuotes;
