import { TargetEnum } from '@shared/types';

/** The credentials of one Cloudinary account, as the SDK takes them in the options of a call. */
export type CloudinaryCredentials = {
  cloud_name: string;
  api_key: string;
  api_secret: string;
};

/** What the SDK needs to reach another account than its default one; empty for the default account. */
export type CloudinaryCallOptions = Partial<CloudinaryCredentials>;

/** A stored file: its address names the account that holds it. */
export type CloudinaryFileRef = { publicId: string; url?: string };

const CLOUDINARY_DELIVERY_PREFIX = 'https://res.cloudinary.com/';

/**
 * The agency's own Cloudinary account, when the three variables of it are set. A partial set counts as
 * not set (the boot refuses it, see validateEnv), so a half-written configuration never reaches the SDK.
 */
export const getAgencyCloudinaryCredentials = (): CloudinaryCredentials | undefined => {
  const {
    AGENCY_CLOUDINARY_NAME: cloudName,
    AGENCY_CLOUDINARY_API_KEY: apiKey,
    AGENCY_CLOUDINARY_API_SECRET: apiSecret,
  } = process.env;

  if (!cloudName || !apiKey || !apiSecret) return undefined;

  return { cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret };
};

/**
 * The Cloudinary account that stores the files of a workspace: the agency's own when it has one, the
 * portfolio's (the SDK default, see initializeCloudinary) otherwise.
 */
export const getCloudinaryName = (workspace: TargetEnum = TargetEnum.PORTFOLIO): string | undefined => (
  (workspace === TargetEnum.AGENCY ? getAgencyCloudinaryCredentials()?.cloud_name : undefined) ||
  process.env.CLOUDINARY_NAME
);

/**
 * The options that point an SDK call at the account of a workspace. Empty for the portfolio and for an
 * agency without an account of its own: the SDK then uses the default one.
 */
export const getCloudinaryCallOptions = (
  workspace: TargetEnum = TargetEnum.PORTFOLIO
): CloudinaryCallOptions => (
  (workspace === TargetEnum.AGENCY ? getAgencyCloudinaryCredentials() : undefined) ?? {}
);

/**
 * The workspace whose account holds a file, read from the cloud name in its address
 * (`https://res.cloudinary.com/<cloud name>/…`). A file with no address, from another host or from the
 * portfolio's account — every file stored before the agency had its own — belongs to the portfolio's.
 */
export const getFileWorkspace = (file?: { url?: string } | null): TargetEnum => {
  const agencyName = getAgencyCloudinaryCredentials()?.cloud_name;

  if (!agencyName || !file?.url?.startsWith(`${CLOUDINARY_DELIVERY_PREFIX}${agencyName}/`)) {
    return TargetEnum.PORTFOLIO;
  }

  return TargetEnum.AGENCY;
};

/** The options that point an SDK call at the account that holds a file. */
export const getFileCallOptions = (file?: { url?: string } | null): CloudinaryCallOptions => (
  getCloudinaryCallOptions(getFileWorkspace(file))
);

/** One workspace per distinct account, for what has to run on every account (the purge jobs). */
export const getCloudinaryWorkspaces = (): TargetEnum[] => (
  getAgencyCloudinaryCredentials() ? [TargetEnum.PORTFOLIO, TargetEnum.AGENCY] : [TargetEnum.PORTFOLIO]
);

/** The names of every account the platform stores files in, for checking where a file lives. */
export const getCloudinaryNames = (): string[] => (
  getCloudinaryWorkspaces()
    .map((workspace) => getCloudinaryName(workspace))
    .filter((name): name is string => !!name)
);
