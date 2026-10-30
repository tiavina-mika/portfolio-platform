import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import SearchInput from '@/components/form/inputs/SearchInput';
import PaymentAdvancedFilterForm from '@/containers/_core/payments/PaymentAdvancedFilterForm';
import { IRenderSearchProps } from '@/types/_core/app.type';


const SearchPayments = ({
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
          placeholder={t('user:payments.search')}
        />
      </Stack>
      <PaymentAdvancedFilterForm onSubmit={onAdvancedSearch} />
    </>
  );
};

export default SearchPayments;
