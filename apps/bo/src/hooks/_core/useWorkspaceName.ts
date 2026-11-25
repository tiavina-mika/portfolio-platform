import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';

import { WORKSPACES } from '@/constants/_core/workspace.constants';
import { getSettingsIsAuthenticatedSelector, getSettingsWorkspaceSelector } from '@/redux/reducers/_core/settings.reducer';
import { getHostWorkspace } from '@/utils/_core/workspace.utils';

/**
 * The name of the workspace the back-office brands itself with (Portfolio or Aldaron), in the language
 * of the interface: the one the signed-in person works in, and before sign-in the one of the address the
 * page was opened on, since their roles are not known yet.
 */
export const useWorkspaceName = (): string => {
  const { t } = useTranslation();
  const isAuthenticated = useSelector(getSettingsIsAuthenticatedSelector);
  const selectedWorkspace = useSelector(getSettingsWorkspaceSelector);

  const workspace = isAuthenticated ? selectedWorkspace : getHostWorkspace();

  return t(WORKSPACES[workspace].labelKey);
};
