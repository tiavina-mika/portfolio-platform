import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { IReport, IReportState, IReportSummary } from '@/types/_core/report.type';

const initialState: IReportState = {
  loading: false,
  reports: [],
  count: 0,
  summary: null,
  targetHistory: [],
  targetHistoryLoading: false,
  report: null,
};

export const report = createSlice({
  name: 'report',
  initialState,
  reducers: {
    loadReportsSlice: (state: IReportState, action: PayloadAction<IReport[]>) => {
      state.reports = action.payload;
    },
    clearReportsSlice: (state: IReportState) => {
      state.reports = [];
    },
    setReportsCountSlice: (state: IReportState, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    clearReportsCountSlice: (state: IReportState) => {
      state.count = 0;
    },
    /*
     * merged rather than replaced: a decision answers with the report alone, while the row and the
     * page carry the target's name and report count that only a read of the queue resolves
     */
    updateReportInListSlice: (state: IReportState, action: PayloadAction<IReport>) => {
      const index = state.reports.findIndex(prevReport => prevReport.id === action.payload.id);

      if (index !== -1) {
        state.reports[index] = { ...state.reports[index], ...action.payload };
      }

      if (state.report?.id === action.payload.id) {
        state.report = { ...state.report, ...action.payload };
      }
    },
    loadReportSlice: (state: IReportState, action: PayloadAction<IReport>) => {
      state.report = action.payload;
    },
    setReportLoadingSlice: (state: IReportState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    loadReportSummarySlice: (state: IReportState, action: PayloadAction<IReportSummary>) => {
      state.summary = action.payload;
    },
    clearReportSummarySlice: (state: IReportState) => {
      state.summary = null;
    },
    loadReportTargetHistorySlice: (state: IReportState, action: PayloadAction<IReport[]>) => {
      state.targetHistory = action.payload;
    },
    clearReportTargetHistorySlice: (state: IReportState) => {
      state.targetHistory = [];
    },
    setReportTargetHistoryLoadingSlice: (state: IReportState, action: PayloadAction<boolean>) => {
      state.targetHistoryLoading = action.payload;
    },
  },
});

export const {
  loadReportsSlice,
  clearReportsSlice,
  setReportsCountSlice,
  clearReportsCountSlice,
  updateReportInListSlice,
  loadReportSlice,
  setReportLoadingSlice,
  loadReportSummarySlice,
  clearReportSummarySlice,
  loadReportTargetHistorySlice,
  clearReportTargetHistorySlice,
  setReportTargetHistoryLoadingSlice,
} = report.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 * NOTE: do not use RootState as state type to avoid import circular dependencies (from store.ts)
 * we can not commit to git if there is circular dependencies
 */
export const getReportSelector = (state: Record<string, any>): IReportState => state.report;
export const getReportReportsSelector = (state: Record<string, any>): IReport[] => state.report.reports;
export const getReportCountSelector = (state: Record<string, any>): number => state.report.count;
export const getReportReportSelector = (state: Record<string, any>): IReport | null =>
  state.report.report;
export const getReportSummarySelector = (state: Record<string, any>): IReportSummary | null =>
  state.report.summary;
export const getReportTargetHistorySelector = (state: Record<string, any>): IReport[] =>
  state.report.targetHistory;
export const getReportTargetHistoryLoadingSelector = (state: Record<string, any>): boolean =>
  state.report.targetHistoryLoading;

export default report.reducer;
