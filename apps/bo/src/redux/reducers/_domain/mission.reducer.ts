import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import { IMission, IMissionState } from '@/types/_domain/mission.type';

const initialState: IMissionState = {
  missions: [],
  count: 0,
};

export const mission = createSlice({
  name: 'mission',
  initialState,
  reducers: {
    loadMissionsSlice: (state: IMissionState, action: PayloadAction<IMission[]>) => {
      state.missions = action.payload;
    },
    setMissionsCountSlice: (state: IMissionState, action: PayloadAction<number>) => {
      state.count = action.payload;
    },
    // a mission just created leads the list, where the reader who typed it expects to find it
    addMissionToMissionsSlice: (state: IMissionState, action: PayloadAction<IMission>) => {
      state.missions = [action.payload, ...state.missions];
      state.count += 1;
    },
    updateMissionInMissionsSlice: (state: IMissionState, action: PayloadAction<IMission>) => {
      state.missions = state.missions.map((item) => (item.id === action.payload.id ? action.payload : item));
    },
    clearMissionsSlice: (state: IMissionState) => {
      state.missions = [];
      state.count = 0;
    },
  },
});

export const {
  loadMissionsSlice,
  setMissionsCountSlice,
  addMissionToMissionsSlice,
  updateMissionInMissionsSlice,
  clearMissionsSlice,
} = mission.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 * NOTE: do not use RootState as state type to avoid import circular dependencies (from store.ts)
 */
export const getMissionMissionsSelector = (state: Record<string, any>): IMission[] => state.mission.missions;
export const getMissionCountSelector = (state: Record<string, any>): number => state.mission.count;

export default mission.reducer;
