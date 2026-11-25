import { TargetEnum } from '@shared/types';

/**
 * The workspace the address the back-office was opened on stands for: the agency's when it is opened on
 * the agency's own domain (VITE_AGENCY_HOSTNAME), the portfolio's anywhere else. A value with a port
 * (localhost:5175) is compared with the host, port included, so a second local dev server can stand for the
 * agency; one without a port is compared with the hostname alone. It only decides where a
 * person starts: a stored choice wins, and the roles still decide what they may open.
 */
export const getHostWorkspace = (): TargetEnum => {
  const agencyHostname = import.meta.env.VITE_AGENCY_HOSTNAME;

  const openedOn = agencyHostname?.includes(':') ? window.location.host : window.location.hostname;

  return agencyHostname && openedOn === agencyHostname
    ? TargetEnum.AGENCY
    : TargetEnum.PORTFOLIO;
};

/**
 * The address an admin with no role writes to, for the workspace of the domain the back-office was opened
 * on: the agency's own sender (VITE_AGENCY_ADMIN_EMAIL_SENDER) on its domain, the portfolio's anywhere else
 * and while the agency one is unset.
 */
export const getAdminContactEmail = (): string => {
  const agencyEmail = import.meta.env.VITE_AGENCY_ADMIN_EMAIL_SENDER;

  return (getHostWorkspace() === TargetEnum.AGENCY && agencyEmail) || import.meta.env.VITE_ADMIN_EMAIL_SENDER || '';
};
