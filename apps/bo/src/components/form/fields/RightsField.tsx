import { Box, FormHelperText } from '@mui/material';
import { Controller, useFormContext } from 'react-hook-form';

import { FORM_WORKBENCH_BREAKPOINT } from '@/constants/_core/ui.constants';
import { useBreakpoint } from '@/hooks/_core/useBreakpoint';
import { IRole } from '@/types/_core/role.type';

import RightsMasterDetailInput from '../inputs/RightsMasterDetailInput';
import RightsMatrixInput from '../inputs/RightsMatrixInput';

type Props = {
  name: string;
  currentUserRoles: IRole[];
  /** the filter typed by the admin, held by the form container so its card header can own the search box */
  search: string;
};

const RightsField = ({
  name, currentUserRoles, search,
}: Props) => {
  const {
    control,
    formState: {
      errors,
    },
  } = useFormContext();
  // a desktop reads the rights as a grid; a narrower screen picks one resource at a time
  const isSmallScreen = useBreakpoint(FORM_WORKBENCH_BREAKPOINT);
  const RightsInput = isSmallScreen
    ? RightsMasterDetailInput
    : RightsMatrixInput;

  return (
    <Controller
      control={control}
      name={name}
      render={({
        field: {
          value, onChange, onBlur,
        },
      }) => (
        <Box>
          <RightsInput
            currentUserRoles={currentUserRoles}
            search={search}
            value={value}
            /*
             * checkboxes never lose focus the way a text/select input does, so under the app's
             * `mode: 'onBlur'` form validation, `isValid` would never re-run after a checkbox
             * change — call onBlur right after onChange to trigger revalidation, same effect
             * other fields get "for free" from a real blur event
             */
            onChange={(nextValue) => {
              onChange(nextValue);
              onBlur();
            }}
          />
          {errors[name] && <FormHelperText error>{(errors as any)[name]}</FormHelperText>}
        </Box>
      )}
    />
  );
};

export default RightsField;
