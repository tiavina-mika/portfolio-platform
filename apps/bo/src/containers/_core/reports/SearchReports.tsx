import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import SearchInput from '@/components/form/inputs/SearchInput';
import ReportAdvancedFilterForm from '@/containers/_core/reports/ReportAdvancedFilterForm';
import { IRenderSearchProps } from '@/types/_core/app.type';

/**
 * The two things an operator types when they already know what they are looking for: the name of
 * what was reported, and the name of whoever filed it. Everything else the queue can be narrowed
 * by lives in the panel underneath, since it is picked from a list rather than typed.
 */
const SearchReports = ({ onAdvancedSearch, onSearch }: IRenderSearchProps) => {
  const { t } = useTranslation(['user']);

  return (
    <>
      <Stack direction="row" spacing={2}>
        <SearchInput
          name="target"
          onChange={onSearch}
          placeholder={t('user:reports.targetPlaceholder')}
        />
        <SearchInput
          name="reportedBy"
          onChange={onSearch}
          placeholder={t('user:reports.reportedByPlaceholder')}
        />
      </Stack>
      <ReportAdvancedFilterForm onSubmit={onAdvancedSearch} />
    </>
  );
};

export default SearchReports;
