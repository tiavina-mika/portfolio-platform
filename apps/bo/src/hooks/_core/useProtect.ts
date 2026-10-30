import { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { getRoleCurrentUserRolesSelector } from '@/redux/reducers/_core/role.reducer';
import { IHasRights } from '@/types/_core/role.type';
import { getRights } from '@/utils/_core/role.utils';

export const useProtect = (className: string): IHasRights => {
  const roles = useSelector(getRoleCurrentUserRolesSelector);

  const protections = useMemo(() => {
    return getRights(roles, className);
  }, [roles, className]);

  return protections;
};
