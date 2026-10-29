const REPOSITORY_HOSTS = ['github', 'gitlab', 'bitbucket'];

const includesOrEmpty = (value: string | undefined, hosts: string[]): boolean =>
  !value || hosts.some((host) => value.includes(host));

export const isYoutubeUrl = (value?: string): boolean => includesOrEmpty(value, ['youtube']);
export const isRepositoryUrl = (value?: string): boolean => includesOrEmpty(value, REPOSITORY_HOSTS);
export const isNpmUrl = (value?: string): boolean => includesOrEmpty(value, ['npm']);
export const isCodesandboxUrl = (value?: string): boolean => includesOrEmpty(value, ['codesandbox']);
