
import {
  type TextFieldProps, Stack, FormHelperText, Typography,
} from '@mui/material';
import { DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { Dayjs } from 'dayjs';
import { ReactNode, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { isBeforeDate } from '@/utils/date.utils';

interface IErrors {
  start?: string;
  end?: string;
}

type Props = {
  onChange: (value: any) => void;
  value: null[] | Dayjs[];
  inputFormat?: string;
  separator?: string | ReactNode;
  hasError?: boolean;
} & Omit<TextFieldProps, 'variant'>;

const DateRangeInput = ({
  onChange, value = [null, null], inputFormat, separator, hasError, ...inputProps
}: Props) => {
  const [error, setError] = useState<IErrors | null>(null);
  const {
    t,
  } = useTranslation();
  const errorMessage = t('errors.startDateBeforeEndDate');

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Stack>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <DesktopDatePicker
            format={inputFormat ?? t('dateOnlyFormat')}
            label={t('start')}
            value={value[0]}
            onChange={(date) => {
              const start = date;
              const end = value[1];

              if (end) {
                const isStartBeforeEnd = isBeforeDate(start, end);

                if (isStartBeforeEnd) {
                  setError({ start: errorMessage });
                  return;
                }
              }

              onChange([start, end]);
            }}
            slotProps={{
              textField: {
                error: !!error?.start || hasError,
                variant: 'standard',
                className: 'flex1',
                ...(inputProps as object),
              },
            }}
          />
          {separator && <Typography>{separator}</Typography>}
          <DesktopDatePicker
            format={inputFormat ?? t('dateOnlyFormat')}
            label={t('end')}
            value={value[1]}
            onChange={(date) => {
              const end = date;
              const start = value[0];

              if (start) {
                const isStartBeforeEnd = isBeforeDate(start, end);

                if (isStartBeforeEnd) {
                  setError({ end: errorMessage });
                  return;
                }
              }

              // change value if no errors
              onChange([start, end]);
            }}
            slotProps={{
              textField: {
                error: !!error?.start || hasError,
                variant: 'standard',
                className: 'flex1',
                ...(inputProps as object),
              },
            }}
          />
        </Stack>
        {error && <FormHelperText error>{error.start ?? error.end}</FormHelperText>}
      </Stack>
    </LocalizationProvider>
  );
};

export default DateRangeInput;
