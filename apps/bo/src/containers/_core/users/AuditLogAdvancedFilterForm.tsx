import { useTranslation } from 'react-i18next';

import DateRangeField from '@/components/form/fields/DateRangeField';
import ToggleButtonsField from '@/components/form/inputs/ToggleButtonsField';
import AdvancedSearchForm from '@/components/search/AdvancedSearchForm';
import { AuditLogFiltersInput } from '@/types/_core/auditLog.type';
import { auditLogFilterSchema } from '@/validations/_core/auditLog.validations';

type Props = {
  onSubmit: (values: AuditLogFiltersInput) => void;
};

const AuditLogAdvancedFilterForm = ({
  onSubmit,
}: Props) => {
  const {
    t,
  } = useTranslation();

  return (
    <AdvancedSearchForm<AuditLogFiltersInput>
      onSubmit={onSubmit}
      schema={auditLogFilterSchema}
      fields={[
        {
          label: t('common:deletedAt'),
          name: 'timestamp',
          component: <DateRangeField name="timestamp" />,
        },
        {
          label: t('user:auditLogs.initiatedBy'),
          name: 'deletionInitiatedBy',
          component: (
            <ToggleButtonsField
              isMulti
              name="deletionInitiatedBy"
              options={[
                {
                  label: t('user:auditLogs.byUser'),
                  value: 'user',
                },
                {
                  label: t('user:auditLogs.byAdmin'),
                  value: 'admin',
                },
                {
                  label: t('user:auditLogs.bySystem'),
                  value: 'system',
                },
              ]}
            />
          ),
        },
      ]}
    />
  );
};

export default AuditLogAdvancedFilterForm;
