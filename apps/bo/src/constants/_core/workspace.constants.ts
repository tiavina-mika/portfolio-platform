import { TargetEnum } from '@shared/types';

import { IMAGES } from '@/constants/_core/app.constants';
import { WEBSITE_SETTINGS_SECTIONS } from '@/constants/_core/settings.constants';
import { IWorkspaceConfig } from '@/types/_core/setting.type';
import { PATH_NAMES } from '@/utils/_core/pathnames';

/**
 * What each workspace shows: the one place to edit to add a workspace or to hide a section in one.
 * The workspace is named after a `TargetEnum` value, the same value a project or a content is
 * published on.
 */
export const WORKSPACES: Record<TargetEnum, IWorkspaceConfig> = {
  [TargetEnum.PORTFOLIO]: {
    labelKey: 'cms:target.portfolio',
    logo: { default: IMAGES.defaultLogo, white: IMAGES.whiteLogo },
    logoWidth: 80,
    icon: { black: IMAGES.blackIconLogo, white: IMAGES.whiteIconLogo },
    hiddenSettingsSections: [],
    // the clients, their quotes and missions are Aldaron's business, the portfolio has none
    hiddenMenuIds: [PATH_NAMES.clients, PATH_NAMES.quotes, PATH_NAMES.missions],
  },
  [TargetEnum.AGENCY]: {
    labelKey: 'cms:target.agency',
    logo: { default: IMAGES.agencyLogo, white: IMAGES.agencyWhiteLogo },
    logoWidth: 120,
    icon: { black: IMAGES.agencyBlackIconLogo, white: IMAGES.agencyWhiteIconLogo },
    // these forms edit the portfolio's website, which Aldaron does not have
    hiddenSettingsSections: WEBSITE_SETTINGS_SECTIONS,
    hiddenMenuIds: [],
  },
};
