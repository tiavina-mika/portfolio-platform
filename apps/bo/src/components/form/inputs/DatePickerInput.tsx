
import { type TextFieldProps } from '@mui/material';
import { DateTimePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  value?: Date | null | undefined;
  onChange: (value: any) => void;
  disableFuture?: boolean;
  disablePast?: boolean;
  withHour?: boolean;
  label?: string;
  inputFormat?: string;
} & Omit<TextFieldProps, 'onChange' | 'value'>;

const DatePickerInput = ({
  value,
  disableFuture,
  disablePast,
  onChange,
  label,
  inputFormat,
  withHour = false,
  ...inputProps
}: Props) => {
  const {
    t,
  } = useTranslation();
  const [date, setDate] = useState<Date | null>(null);

  useEffect(() => {
    if (!value) return;
    setDate(value);
  }, [value]);

  const handleChange = (newDate: Date | null) => {
    setDate(newDate);
    onChange(newDate);
  };

  let Component: any = DesktopDatePicker;

  if (withHour) {
    Component = DateTimePicker;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Component
        disableFuture={disableFuture}
        disablePast={disablePast}
        label={label}
        value={date ? dayjs(date) : null}
        format={inputFormat ?? (withHour
          ? t('fullDateFormat')
          : t('dateOnlyFormat'))}
        onChange={(value: Date | Dayjs | null) =>
          handleChange(
            value
              ? dayjs.isDayjs(value)
                ? value.toDate()
                : value
              : null
          )
        }
        slotProps={{
          textField: {
            fullWidth: true,
            color: 'primary',
            // outlined like every other control: the underline variant is not part of the design
            variant: 'outlined',
            ...inputProps,
          },
        }}
      />
    </LocalizationProvider>
  );
};

export default DatePickerInput;
