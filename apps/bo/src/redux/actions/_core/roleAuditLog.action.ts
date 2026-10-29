import { PAGINATION } from '@/constants/_core/app.constants';
import { actionWithLoader } from '@/redux/actions/_core/util.action';
import {
  loadRoleAuditLogsSlice,
  setRoleAuditLogCountSlice,
  setRoleAuditLogLoadingSlice,
} from '@/redux/reducers/_core/roleAuditLog.reducer';
import { AppDispatch } from '@/redux/store';
import { fetchRoleAuditLogs } from '@/services/_core/roleAuditLog.service';
import { IQueriesInput } from '@/types/_core/app.type';

export const loadRoleAuditLogs = ({
  limit = PAGINATION.rowsPerPage,
  skip = 0,
  orderBy = 'timestamp',
  order = 'desc',
  roleName,
}: IQueriesInput & { roleName?: string }): any => {
  return actionWithLoader(
    async (dispatch: AppDispatch): Promise<void> => {
      const result = await fetchRoleAuditLogs({
        limit, skip, orderBy, order, roleName,
      });

      dispatch(loadRoleAuditLogsSlice(result.results));
      dispatch(setRoleAuditLogCountSlice(result.count));
    },
    {
      localLoadingAction: setRoleAuditLogLoadingSlice,
      collection: '_Role',
      action: 'find',
    }
  );
};
