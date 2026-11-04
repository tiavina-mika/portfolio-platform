import dayjs from 'dayjs';
import { isValidElement } from 'react';

import { IAdvancedSearchOption, ISelectOption } from '@/types/_core/app.type';

export interface IActiveFilterChip {
  name: string;
  label: string;
  value: string;
}

const CHIP_DATE_FORMAT = 'DD/MM/YYYY';

const isEmptyFilterValue = (value: unknown): boolean => {
  if (value === undefined || value === null || value === '') return true;
  if (Array.isArray(value)) return value.every(isEmptyFilterValue);
  return false;
};

const isDateValue = (value: unknown): boolean => value instanceof Date || dayjs.isDayjs(value);

const formatDateChipValue = (value: unknown): string =>
  dayjs(value as string | number | Date).format(CHIP_DATE_FORMAT);

// a DateRangeField value is a tuple of two nullable dates: [start, end]
const isDateRangeValue = (value: unknown): value is [unknown, unknown] =>
  Array.isArray(value) && value.length === 2 && value.some(isDateValue);

const formatDateRangeChipValue = ([start, end]: [unknown, unknown]): string => {
  if (start && end) return `${formatDateChipValue(start)} – ${formatDateChipValue(end)}`;
  if (start) return `≥ ${formatDateChipValue(start)}`;
  return `≤ ${formatDateChipValue(end)}`;
};

/**
 * strips the fields the reader left empty out of a submitted filter form. Every filter is on
 * screen at once, so an untouched field still reaches the submit handler holding '' (or a cleared
 * date range holding [null, null]) — sent as-is, those would narrow the list to nothing.
 * @param values the raw form values of the filter panel
 */
export const getFilledFilterValues = (values: Record<string, any>): Record<string, any> => (
  Object.fromEntries(
    Object.entries(values).filter(([, value]) => !isEmptyFilterValue(value))
  )
);

/*
 * fields whose input renders a fixed option list (ToggleButtonsField, SelectField, ...) always
 * pass it as an `options` prop — reuse that prop instead of duplicating a value → label map per
 * domain, so a stored enum value (e.g. "in_progress") displays as its translated label
 */
const getOptionsMap = (component: IAdvancedSearchOption['component']): Map<string, string> | null => {
  if (!isValidElement(component)) return null;

  const { options } = component.props as { options?: ISelectOption<any>[] };

  if (!Array.isArray(options)) return null;

  return new Map(options.map((option) => [String(option.value), String(option.label)]));
};

const formatSingleChipValue = (value: unknown, optionsMap: Map<string, string> | null): string => {
  if (isDateValue(value)) return formatDateChipValue(value);

  return optionsMap?.get(String(value)) ?? String(value);
};

const formatFilterChipValue = (value: unknown, optionsMap: Map<string, string> | null): string => {
  if (isDateRangeValue(value)) return formatDateRangeChipValue(value);

  if (Array.isArray(value)) {
    return value
      .filter((item) => !isEmptyFilterValue(item))
      .map((item) => formatSingleChipValue(item, optionsMap))
      .join(', ');
  }

  return formatSingleChipValue(value, optionsMap);
};

/**
 * derives the currently active advanced-search filters (as displayable chips) from the same
 * `fields` config already used to render the advanced search dialog — no separate label source
 * @param fields the advanced search field definitions (label + input) for the current domain
 * @param values the applied (checked) advanced search values, keyed by field name
 */
export const getActiveFilterChips = (
  fields: IAdvancedSearchOption[],
  values: Record<string, any>
): IActiveFilterChip[] =>
  fields
    .filter((field) => !isEmptyFilterValue(values[field.name]))
    .map((field) => ({
      name: field.name,
      label: field.label,
      value: formatFilterChipValue(values[field.name], getOptionsMap(field.component)),
    }));
