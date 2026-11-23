import { Stack } from '@mui/material';
import { useTranslation } from 'react-i18next';

import SearchInput from '@/components/form/inputs/SearchInput';
import ToggleButtonsField from '@/components/form/inputs/ToggleButtonsField';
import AdvancedSearchForm from '@/components/search/AdvancedSearchForm';
import { CLIENT_KIND_OPTIONS } from '@/constants/_domain/client.constants';
import { IRenderSearchProps } from '@/types/_core/app.type';
import { ClientFiltersInput, clientFilterSchema } from '@/validations/_domain/client.validations';

// the search box (a part of the name or of the e-mail) and the filter on the kind of client
const SearchClients = ({ onSearch, onAdvancedSearch }: IRenderSearchProps) => {
  const { t } = useTranslation(['project']);

  return (
    <>
      <Stack direction="row" spacing={2}>
        <SearchInput name="text" onChange={onSearch} placeholder={t('project:client.searchClient')} />
      </Stack>
      <AdvancedSearchForm<ClientFiltersInput>
        onSubmit={onAdvancedSearch}
        schema={clientFilterSchema}
        fields={[
          {
            label: t('project:client.kind'),
            name: 'kind',
            component: <ToggleButtonsField name="kind" options={CLIENT_KIND_OPTIONS} />,
          },
        ]}
      />
    </>
  );
};

export default SearchClients;
