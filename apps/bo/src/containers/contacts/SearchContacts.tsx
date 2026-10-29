import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import SearchInput from '@/components/form/inputs/SearchInput';
import { IRenderSearchProps } from '@/types/app.type';

import ContactAdvancedFilterForm from './ContactAdvancedFilterForm';

const SearchContacts = ({
  onSearch, onAdvancedSearch,
}: IRenderSearchProps) => {
  const {
    t,
  } = useTranslation(['user']);

  return (
    <>
      <Stack direction="row" spacing={2}>
        <SearchInput
          name="text"
          onChange={onSearch}
          placeholder={t('user:contacts.search')}
        />
      </Stack>
      <ContactAdvancedFilterForm onSubmit={onAdvancedSearch} />
    </>
  );
};

export default SearchContacts;
