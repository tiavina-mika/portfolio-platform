import { ContactChangeTypeEnum } from '@shared/types';
import Parse from 'parse';

import { IFileCloud } from '@/types/_core/file.type';
import { Locale } from '@/types/_core/setting.type';
import {
  BanUserInput, IPhone, IUser, IUserCloudInput, SendMessageInput,
} from '@/types/_core/user.type';
import { IToggleSeenResult } from '@/types/_core/utils.type';
import { uploadFilesAPI } from '@/utils/_core/file.utils';
import { setValues, toJSONWithId } from '@/utils/_core/parse.utils';
import { escapeText } from '@/utils/_core/utils';

/*
 * ----------------------------------------------------- //
 * ------------------- Parse queries ------------------- //
 * ----------------------------------------------------- //
 */
/**
 * query a user relation from another query
 * pointer = relation
 * ex: search a user who create a contact by its name (the username, email and phone are protected
 * columns: a query constraint on them is refused for a client session)
 * @param mainQuery
 * @param text
 * @param field pointer name
 */
export const searchUserPointerQuery = (
  mainQuery: Parse.Query,
  text: string,
  field = 'user'
): void => {
  const formattedText = escapeText(text);

  const userPointerQuery = Parse.Query.or(
    new Parse.Query(Parse.User).matches('lastName', formattedText),
    new Parse.Query(Parse.User).matches('firstName', formattedText)
  );

  mainQuery.matchesQuery(field, userPointerQuery);
};

export const fetchCurrentAuthUserJson = async (): Promise<IUser | undefined> => {
  const currentUser = await Parse.User.currentAsync(); // it can throw (rarely)

  return currentUser ? toJSONWithId<IUser>(currentUser) : undefined;
};

export const getCurrentUser = async (): Promise<Parse.User | undefined> => {
  const currentUser = await Parse.User.currentAsync(); // it can throw (rarely)

  return currentUser ?? undefined;
};

export const fetchUsers = async (
  params: IUserCloudInput
): Promise<{ results: IUser[]; count: number }> => {
  if (params.filters?.roles && params.filters.roles.length > 0) {
    params.ids = await Parse.Cloud.run('getUserIdsFromRoles', { roleNames: params.filters.roles });
  }

  // result with count
  const result: Record<string, any> = await Parse.Cloud.run('getUsers', params);

  /*
   * the roles shown in the list come attached to each user by `getUsers`, not read from here: a
   * role is only readable by its own holders and by the highest-level roles, so reading them from
   * the back-office session left the Roles column empty for exactly the accounts an administrator
   * most needs to spot — an OWNER seen by anyone who is not one
   */
  const users: IUser[] = result.results.map((user: Parse.Object) => toJSONWithId<IUser>(user));

  return { results: users, count: result.count };
};

export const fetchUsersForExport = async (
  queries: Record<string, any>,
  maxRows: number
): Promise<{ results: IUser[]; count: number }> => {
  const result: Record<string, any> = await Parse.Cloud.run('getUsers', {
    ...queries,
    limit: maxRows,
    skip: 0,
  });

  return {
    results: result.results.map((user: Parse.Object) => toJSONWithId<IUser>(user)),
    count: result.count,
  };
};

export const deleteUserByIdInCloud = async (id: string): Promise<{ id: string }> => {
  return Parse.Cloud.run('deleteUser', { id });
};

export const deleteUsersByIdsInCloud = async (ids: string[]): Promise<IUser[]> => {
  const updatedUsers = await Parse.Cloud.run('deleteUsers', { ids });

  return updatedUsers.map((user: Parse.Object) => toJSONWithId<IUser>(user));
};

export const destroyUsersInCloud = async (ids: string[]): Promise<{ code?: number } | undefined> => {
  return Parse.Cloud.run('destroyUsers', { ids });
};

export const banUserInCloud = async (userId: string, values: BanUserInput): Promise<IUser> => {
  const updatedUser = await Parse.Cloud.run('banUser', { userId, ...values });

  return toJSONWithId<IUser>(updatedUser);
};

export const liftUserBanInCloud = async (userId: string): Promise<IUser> => {
  const updatedUser = await Parse.Cloud.run('liftUserBan', { userId });

  return toJSONWithId<IUser>(updatedUser);
};

export const toggleUsersSeenInCloud = async (
  ids: string[],
  value: boolean
): Promise<IToggleSeenResult> => {
  return Parse.Cloud.run('toggleUsersSeen', { ids, value });
};

export const updateCurrentUserProfile = async (
  values: Record<string, any>
): Promise<IUser | undefined> => {
  const currentUser = await Parse.User.currentAsync();

  if (!currentUser) return undefined;
  setValues(currentUser, values, ['lastName', 'firstName']);

  await currentUser.save();

  return toJSONWithId<IUser>(currentUser);
};

export const sendMessageToUserInCloud = async (values: SendMessageInput): Promise<boolean> => {
  return Parse.Cloud.run('sendMessageToUser', values);
};

/*
 * The ways support helps a member back into an account they can no longer reach. Each one names the
 * account by its id and carries the reason it is done for, which the server writes in the member's
 * history; `locale` is the administrator's, for the error they may get back.
 */
type AccountHelpCloudInput = {
  userId: string;
  reason: string;
  locale: Locale;
};

export const resendMemberPhoneVerificationCodeInCloud = async (
  input: AccountHelpCloudInput
): Promise<boolean> => {
  return Parse.Cloud.run('resendMemberPhoneVerificationCode', input);
};

export const sendMemberPasswordResetCodeInCloud = async (input: AccountHelpCloudInput): Promise<boolean> => {
  return Parse.Cloud.run('sendMemberPasswordResetCode', input);
};

export const changeMemberContactInCloud = async (
  input: AccountHelpCloudInput & { type: `${ContactChangeTypeEnum}`; email?: string; phone?: IPhone }
): Promise<void> => {
  await Parse.Cloud.run('changeMemberContact', input);
};

export const changeMemberCountryInCloud = async (
  input: AccountHelpCloudInput & { country: string }
): Promise<void> => {
  await Parse.Cloud.run('changeMemberCountry', input);
};

/**
 * one account, for its detail page — marked as seen on the way. Its roles are a separate read
 * (`fetchRolesForUser`), so the page does not wait for them before it is drawn
 */
export const fetchUser = async (id: string, include: string[]): Promise<IUser | undefined> => {
  const user = await Parse.Cloud.run('getUser', {
    id,
    shouldMarkAsSeen: true,
    include,
  });

  if (!user) return undefined;

  return toJSONWithId<IUser>(user);
};

export const updateCurrentUserProfileImage = async ({
  file, folder, locale,
}: {
  file: File;
  folder: string;
  locale: Locale;
}): Promise<IFileCloud | undefined> => {
  const currentUser = await Parse.User.currentAsync();
  const sessionToken = currentUser?.getSessionToken() ?? '';
  const userId = currentUser?.id ?? '';

  const files = await uploadFilesAPI({
    files: [file],
    folder,
    userId,
    sessionToken,
    locale,
  });

  const [image] = files;

  // the endpoint answers with one entry per uploaded file, but an empty answer must not blank the picture
  if (!image) return undefined;

  currentUser?.set('image', image);
  await currentUser?.save();

  return image;
};

export const verifyBOInvitationToken = async (token: string): Promise<{ email: string }> => {
  return Parse.Cloud.run('verifyBOInvitationToken', { token });
};
