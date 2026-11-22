import { TargetEnum } from '@shared/types';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getRoleCurrentUserWorkspacesSelector } from '@/redux/reducers/_core/role.reducer';
import { changeWorkspaceSlice, getSettingsWorkspaceSelector } from '@/redux/reducers/_core/settings.reducer';

type UseWorkspace = {
  /** the workspace the signed-in person works in */
  workspace: TargetEnum;
  /** the workspaces their roles open, as the server computed them */
  workspaces: TargetEnum[];
  /** whether there is a choice to make: the selector is shown to nobody else */
  canSwitch: boolean;
  setWorkspace: (workspace: TargetEnum) => void;
};

/**
 * The workspace (portfolio or Aldaron) the back-office is read in, the ones the signed-in person may
 * pick from, and how to pick one. Choosing is a local preference that applies at once; what the person
 * may actually read is decided by the server from their roles.
 */
export const useWorkspace = (): UseWorkspace => {
  const dispatch = useDispatch();
  const workspace = useSelector(getSettingsWorkspaceSelector);
  const workspaces = useSelector(getRoleCurrentUserWorkspacesSelector);

  const setWorkspace = useCallback(
    (value: TargetEnum) => {
      dispatch(changeWorkspaceSlice(value));
    },
    [dispatch]
  );

  return {
    workspace, workspaces, canSwitch: workspaces.length > 1, setWorkspace,
  };
};
