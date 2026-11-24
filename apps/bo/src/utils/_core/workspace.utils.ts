import { TargetEnum } from '@shared/types';

/**
 * The workspace the address the back-office was opened on stands for: the agency's when it is opened on
 * the agency's own domain (VITE_AGENCY_HOSTNAME), the portfolio's anywhere else. It only decides where a
 * person starts: a stored choice wins, and the roles still decide what they may open.
 */
export const getHostWorkspace = (): TargetEnum => {
  const agencyHostname = import.meta.env.VITE_AGENCY_HOSTNAME;

  return agencyHostname && window.location.hostname === agencyHostname
    ? TargetEnum.AGENCY
    : TargetEnum.PORTFOLIO;
};
