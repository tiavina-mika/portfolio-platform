import {
  Box,
  Checkbox,
  Chip,
  FormControl,
  FormHelperText,
  InputLabel,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Select,
  SelectChangeEvent,
  SxProps,
  Theme,
} from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';


import { CHIP_FONT_SIZE, INPUT_CHIP_HEIGHT, INPUT_CHIP_RADIUS } from '@/constants/_core/ui/ui.constants';
import { ISelectOption } from '@/types/_core/app.type';
import { getTintedBackground } from '@/utils/_core/theme/tokens.utils';

const isAllSelected = (options: ISelectOption[], selected: any) =>
  options.length > 0 && selected.length === options.length;

type Props = {
  value?: any;
  label?: string;
  onChange: (values: any[]) => void;
  error?: string;
  autoWidth?: boolean;
  helperText?: string;
  sx?: SxProps<Theme>;
  options: ISelectOption[];
  bgcolor?: string;
};

const CheckedMultiSelectInput = ({
  value,
  onChange,
  options,
  sx,
  label,
  error,
  helperText,
  autoWidth,
  bgcolor = 'background.paper',
}: Props) => {
  const [selected, setSelected] = useState<any[]>([]);

  useEffect(() => {
    if (value && Array.isArray(value)) {
      setSelected(value);
    }
  }, [value]);

  /**
   * get only the value without the label
   */
  const formatValue = (inputValue: any) => {
    const selectedOptions: ISelectOption[] = options.filter((option: ISelectOption) =>
      inputValue?.includes(option.value)
    );
    const selectedValues = selectedOptions.map((option: ISelectOption) => option.value);

    return selectedValues;
  };

  /**
   * render each picked option as a chip — a comma-joined string truncates into an unreadable
   * fragment as soon as three or four options are picked, whereas chips wrap and stay countable
   */
  const renderValue = (selected: unknown): ReactNode => {
    if (!selected) return '';
    const pickedOptions = options.filter(
      (option: ISelectOption) => (selected as any[]).includes(option.value)
    );

    return (
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {pickedOptions.map((option: ISelectOption) => (
          <Chip
            key={option.value}
            label={option.label}
            sx={(theme: Theme) => ({
              height: INPUT_CHIP_HEIGHT,
              borderRadius: `${INPUT_CHIP_RADIUS}px`,
              fontSize: CHIP_FONT_SIZE,
              border: 'none',
              color: theme.palette.primary.dark,
              backgroundColor: getTintedBackground(theme, theme.palette.primary.main),
            })}
          />
        ))}
      </Box>
    );
  };

  const handleChange = (event: SelectChangeEvent<any>) => {
    const inputValue = event.target.value;

    if (inputValue[inputValue.length - 1] === 'all') {
      const allValues =
        inputValue.filter((v: any) => v !== 'all').length === options.length
          ? []
          : options.map((option: ISelectOption) => option.value);

      setSelected(allValues as any);
      onChange(allValues);
      return;
    }
    setSelected(inputValue);
    onChange(inputValue);
  };

  return (
    <FormControl sx={{ minWidth: 120 }}>
      {label && <InputLabel id="multiple-select-label">{label}</InputLabel>}
      <Select
        multiple
        autoWidth={autoWidth}
        labelId="multiple-select-label"
        onChange={handleChange}
        renderValue={renderValue}
        sx={{ bgcolor, ...sx }}
        value={formatValue(selected)}
      >
        <MenuItem value="all">
          <ListItemIcon>
            <Checkbox
              checked={isAllSelected(options, selected)}
              indeterminate={selected.length > 0 && selected.length < options.length}
            />
          </ListItemIcon>
          <ListItemText primary="Select All" />
        </MenuItem>
        {options.map((option: ISelectOption) => (
          <MenuItem key={option.value} value={option.value}>
            <ListItemIcon>
              <Checkbox checked={selected.includes(option?.value)} />
            </ListItemIcon>
            <ListItemText primary={option.label} />
          </MenuItem>
        ))}
      </Select>
      {error && <FormHelperText error>{error}</FormHelperText>}
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  );
};

export default CheckedMultiSelectInput;
