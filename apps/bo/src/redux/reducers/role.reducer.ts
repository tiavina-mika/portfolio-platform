import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import type { IRole, IRoleState } from '@/types/role.type';

const initialState: IRoleState = {
  loading: false,
  role: null,
  roles: [],
  userRoles: [],
  currentUserRoles: [],
  isAdmin: false,
};

export const role = createSlice({
  name: 'role',
  initialState,
  reducers: {
    addRoleSlice: (state: IRoleState, action: PayloadAction<IRole>) => {
      state.roles = [action.payload, ...state.roles];
    },
    loadRolesSlice: (state: IRoleState, action: PayloadAction<IRole[]>) => {
      state.roles = action.payload;
    },
    loadUserRolesSlice: (state: IRoleState, action: PayloadAction<IRole[]>) => {
      state.userRoles = action.payload;
    },
    loadCurrentUserRolesSlice: (state: IRoleState, action: PayloadAction<IRole[]>) => {
      state.currentUserRoles = action.payload;
    },
    loadCurrentUserIsAdminSlice: (state: IRoleState, action: PayloadAction<boolean>) => {
      state.isAdmin = action.payload;
    },
    loadRoleSlice: (state: IRoleState, action: PayloadAction<IRole>) => {
      state.role = action.payload;
    },
    clearRoleSlice: (state: IRoleState) => {
      state.role = null;
    },
    clearRolesSlice: (state: IRoleState) => {
      state.roles = [];
    },
    clearUserRolesSlice: (state: IRoleState) => {
      state.currentUserRoles = [];
    },
    clearCurrentUserRolesSlice: (state: IRoleState) => {
      state.userRoles = [];
    },
    setRoleLoadingSlice: (state: IRoleState, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    destroyRoleSlice: (state: IRoleState, action: PayloadAction<string>) => {
      const filteredRoles = state.roles.filter(role => role.id !== action.payload);

      state.roles = filteredRoles;
    },
    updateRolesByRoleSlice: (state: IRoleState, action: PayloadAction<IRole>) => {
      const newRoles = [];

      for (const role of state.roles) {
        if (role.id === action.payload.id) {
        // push the updated role to the first line
          newRoles.unshift(action.payload);
        }
        else {
          newRoles.push(role);
        }
      }

      state.roles = newRoles;
      state.role = action.payload;
    },
  },
});

export const {
  setRoleLoadingSlice,
  clearRoleSlice,
  loadRoleSlice,
  loadRolesSlice,
  clearRolesSlice,
  updateRolesByRoleSlice,
  addRoleSlice,
  loadUserRolesSlice,
  loadCurrentUserIsAdminSlice,
  clearUserRolesSlice,
  loadCurrentUserRolesSlice,
  clearCurrentUserRolesSlice,
  destroyRoleSlice,
} = role.actions;

/*
 * ---------------------------------------------- //
 * ------------------ SELECTOR ------------------ //
 * ---------------------------------------------- //
 * NOTE: do not use RootState as state type to avoid import circular dependencies (from store.ts)
 * we can not commit to git if there is circular dependencies
 */
export const getRoleRoleSelector = (state: Record<string, any>): IRole => state.role.role;
export const getRoleLoadingSelector = (state: Record<string, any>): boolean => state.role.loading;
export const getRoleRolesSelector = (state: Record<string, any>): IRole[] => state.role.roles;
export const getRoleUserRolesSelector = (state: Record<string, any>): IRole[] => state.role.userRoles;
export const getRoleCurrentUserRolesSelector = (
  state: Record<string, any>
): IRole[] => state.role.currentUserRoles;
export const getRoleCurrentUserIsAdminSelector = (state: Record<string, any>): boolean => state.role.isAdmin;

export default role.reducer;
