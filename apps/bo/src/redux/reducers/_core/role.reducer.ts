import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

import {
  IHighestRoleAccount, IRole, IRolesDelegation, IRoleState, UIRoleEnum,
} from '@/types/_core/role.type';

const initialState: IRoleState = {
  loading: false,
  role: null,
  roles: [],
  userRoles: [],
  userRolesLoading: false,
  currentUserRoles: [],
  highestRoleAccounts: [],
  highestRoleAccountsLoading: false,
  rolesDelegation: null,
  rolesDelegationLoading: false,
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
    setUserRolesLoadingSlice: (state: IRoleState, action: PayloadAction<boolean>) => {
      state.userRolesLoading = action.payload;
    },
    loadCurrentUserRolesSlice: (state: IRoleState, action: PayloadAction<IRole[]>) => {
      state.currentUserRoles = action.payload;
    },
    loadHighestRoleAccountsSlice: (state: IRoleState, action: PayloadAction<IHighestRoleAccount[]>) => {
      state.highestRoleAccounts = action.payload;
    },
    setHighestRoleAccountsLoadingSlice: (state: IRoleState, action: PayloadAction<boolean>) => {
      state.highestRoleAccountsLoading = action.payload;
    },
    clearHighestRoleAccountsSlice: (state: IRoleState) => {
      state.highestRoleAccounts = [];
    },
    loadRolesDelegationSlice: (state: IRoleState, action: PayloadAction<IRolesDelegation>) => {
      state.rolesDelegation = action.payload;
    },
    setRolesDelegationLoadingSlice: (state: IRoleState, action: PayloadAction<boolean>) => {
      state.rolesDelegationLoading = action.payload;
    },
    clearRolesDelegationSlice: (state: IRoleState) => {
      state.rolesDelegation = null;
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
      state.userRoles = [];
    },
    clearCurrentUserRolesSlice: (state: IRoleState) => {
      state.currentUserRoles = [];
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
  setUserRolesLoadingSlice,
  loadCurrentUserIsAdminSlice,
  clearUserRolesSlice,
  loadCurrentUserRolesSlice,
  clearCurrentUserRolesSlice,
  loadHighestRoleAccountsSlice,
  clearHighestRoleAccountsSlice,
  setHighestRoleAccountsLoadingSlice,
  loadRolesDelegationSlice,
  setRolesDelegationLoadingSlice,
  clearRolesDelegationSlice,
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
export const getRoleUserRolesLoadingSelector = (
  state: Record<string, any>
): boolean => state.role.userRolesLoading;
export const getRoleCurrentUserRolesSelector = (
  state: Record<string, any>
): IRole[] => state.role.currentUserRoles;
export const getRoleHighestRoleAccountsSelector = (
  state: Record<string, any>
): IHighestRoleAccount[] => state.role.highestRoleAccounts;
export const getRoleHighestRoleAccountsLoadingSelector = (
  state: Record<string, any>
): boolean => state.role.highestRoleAccountsLoading;
export const getRoleRolesDelegationSelector = (state: Record<string, any>): IRolesDelegation | null => (
  state.role.rolesDelegation
);
export const getRoleRolesDelegationLoadingSelector = (
  state: Record<string, any>
): boolean => state.role.rolesDelegationLoading;
export const getRoleCurrentUserIsAdminSelector = (state: Record<string, any>): boolean => state.role.isAdmin;
// an owner, a super administrator, or a post carrying the staff right — the server enforces the bounds
export const getRoleCanManageStaffSelector = (state: Record<string, any>): boolean => (
  state.role.isAdmin ||
  state.role.currentUserRoles.some((role: IRole) => role.ui?.includes(UIRoleEnum.STAFF))
);

export default role.reducer;
