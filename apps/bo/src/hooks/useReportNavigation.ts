import { useNavigate } from '@tanstack/react-router';
import { useCallback } from 'react';

import { goToReport } from '@/redux/actions/_core/report.action';
import { goToUser } from '@/redux/actions/_core/user.action';
import { IReport, ReportTargetTypeEnum } from '@/types/_core/report.type';

/**
 * Where the report file leads: to the thing that was reported, to the account that filed a report,
 * to another report. Shared by the queue's side sheet and the report's own page, which are the same
 * file in two surfaces and have to go to the same places.
 *
 * Only an account has a page to open here, so `openTarget` does nothing for any other kind of
 * target — callers hide the link with `isReportTargetOpenable` rather than relying on that.
 * @returns the navigation callbacks
 */
export const useReportNavigation = () => {
  const navigate = useNavigate();

  const openTarget = useCallback((report: Pick<IReport, 'targetType' | 'targetId'>) => {
    switch (report.targetType) {
      case ReportTargetTypeEnum.USER:
        navigate(goToUser(report.targetId));
        break;
      default:
        break;
    }
  }, [navigate]);

  const openUser = useCallback((userId: string) => navigate(goToUser(userId)), [navigate]);

  const openReport = useCallback((reportId: string) => navigate(goToReport(reportId)), [navigate]);

  return { openTarget, openUser, openReport };
};
