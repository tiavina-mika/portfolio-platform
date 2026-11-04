import { useSelector } from 'react-redux';

import type { ISelectOption } from '@/types/_core/app.type';

import { getRoleCurrentUserIsAdminSelector, getRoleCurrentUserRolesSelector } from '@/redux/reducers/_core/role.reducer';
import { getCountryOptions } from '@/utils/_core/country.utils';
import { getAllowedCountryCodes } from '@/utils/_core/role.utils';


/**
 * The countries the signed-in user may pick in a filter or in the app bar: all of them, or only those
 * their roles cover. Narrowing the choices spares them a list that comes back empty; the server is
 * what actually refuses the others.
 */
export const useAllowedCountryOptions = (): ISelectOption[] => {
  const roles = useSelector(getRoleCurrentUserRolesSelector);
  const isAdmin = useSelector(getRoleCurrentUserIsAdminSelector);
  const allowed = getAllowedCountryCodes(roles, isAdmin);

  return getCountryOptions().filter((option) => !allowed || allowed.includes(String(option.value)));
};
