
import { TextField, type TextFieldProps } from '@mui/material';
import { DateTimePicker, DesktopDatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

type Props = {
  value?: Date | null | undefined;
  onChange: (value: any) => void;
  disableFuture?: boolean;
  withHour?: boolean;
  label?: string;
  inputFormat?: string;
} & TextFieldProps;

const DatePickerInput = ({
  value,
  disableFuture,
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
        label={label}
        value={date ? dayjs(date) : null}
        inputFormat={inputFormat ?? (withHour
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
        renderInput={(params: TextFieldProps) => (
          <TextField
            fullWidth
            color="primary"
            margin="dense"
            variant="standard"
            {...params}
            {...inputProps}
          />
        )}
      />
    </LocalizationProvider>
  );
};

export default DatePickerInput;
