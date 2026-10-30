import { PAGINATION } from '@/constants/_core/app.constants';
import { actionWithLoader } from '@/redux/actions/_core/util.action';
import {
  loadAuditLogsSlice,
  setAuditLogCountSlice,
  setAuditLogLoadingSlice,
  setCurrentAuditLogSlice,
} from '@/redux/reducers/_core/auditLog.reducer';
import { AppDispatch } from '@/redux/store';
import { fetchAuditLogByUserId, fetchAuditLogs } from '@/services/_core/auditLog.service';
import { IQueriesInput } from '@/types/_core/app.type';


export const loadAuditLogByUserId = (userId: string): any => {
  return actionWithLoader(
    async (dispatch: AppDispatch): Promise<void> => {
      const result = await fetchAuditLogByUserId(userId);

      dispatch(setCurrentAuditLogSlice((result as any) ?? null));
    },
    { localLoadingAction: setAuditLogLoadingSlice }
  );
};

export const loadAuditLogs = ({
  limit = PAGINATION.rowsPerPage,
  skip = 0,
  orderBy = 'timestamp',
  order = 'desc',
  search,
}: IQueriesInput): any => {
  return actionWithLoader(
    async (dispatch: AppDispatch): Promise<void> => {
      const result = await fetchAuditLogs({
        limit, skip, orderBy, order, search,
      });

      dispatch(loadAuditLogsSlice(result.results as any));
      dispatch(setAuditLogCountSlice(result.count));
    },
    { localLoadingAction: setAuditLogLoadingSlice }
  );
};
