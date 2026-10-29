import MenuItem from '@mui/material/MenuItem';
import Select, { type SelectChangeEvent } from '@mui/material/Select';
import { useTranslation } from 'react-i18next';

import type { ISelectOption } from '@/types/_core/app.type';

type Props = {
  /** the country whose currency the money figures are read in */
  value: string;
  /** the countries to pick from: the select stands aside when there is nothing to choose */
  options: ISelectOption[];
  onChange: (country: string) => void;
};

/**
 * Picks the country the money figures of the back-office (dashboard, finance, payments, statistics)
 * are read for. Each country pays in its own currency and amounts of two currencies are never added
 * up, so the figures describe one country at a time. With a single country there is nothing to pick:
 * it renders nothing.
 */
const MoneyCountrySelect = ({ value, options, onChange }: Props) => {
  const { t } = useTranslation(['common']);

  if (options.length < 2) return null;

  const handleChange = (event: SelectChangeEvent) => onChange(event.target.value);

  return (
    <Select
      inputProps={{ 'aria-label': t('common:country') }}
      onChange={handleChange}
      size="small"
      value={value}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
      ))}
    </Select>
  );
};

export default MoneyCountrySelect;
