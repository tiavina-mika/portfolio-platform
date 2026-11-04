import { useTranslation } from 'react-i18next';

import SearchInput from '@/components/form/inputs/SearchInput';
import NotificationAdvancedFilterForm from '@/containers/_core/notification/NotificationAdvancedFilterForm';
import { IRenderSearchProps } from '@/types/_core/app.type';

type Props = {
  /** how many active sends each category holds, stated next to its filter option */
  typeCounts?: Record<string, number>;
} & IRenderSearchProps;

const SearchNotifications = ({
  onSearch, onAdvancedSearch, typeCounts,
}: Props) => {
  const { t } = useTranslation(['user']);

  return (
    <>
      {/*
        * one box for the whole row rather than a control per field: an operator looking for a send
        * has the status, a phrase from the message, or the sender's name in hand, and which of the
        * three it is is not something they should have to answer before typing. The category, the
        * read rate and the rest stay in the panel below, for narrowing a screen rather than
        * finding a row.
        */}
      <SearchInput
        name="text"
        onChange={onSearch}
        placeholder={t('user:notifications.search')}
      />
      <NotificationAdvancedFilterForm onSubmit={onAdvancedSearch} typeCounts={typeCounts} />
    </>
  );
};

export default SearchNotifications;
