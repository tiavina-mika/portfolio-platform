import { MessageChannelEnum } from '@shared/types';

import type { ToggleSeenResult } from '@/types/utils.type';

import { DEFAULT_LANGUAGE } from '@/config/i18n';
import { collections, MAX_BULK_UPDATE_LIMIT, USE_MASTER_KEY } from '@/constants/_core/constants';
import { resolveScopedCountry, scopeCountries } from '@/utils/_core/agent-context.utils';
import {
  escapeText, isBoolean, renderTextAsHtml,
} from '@/utils/_core/utils';
import {
  getUsersSchema, getUserSchema, deleteUserSchema, deleteUsersSchema, destroyUsersSchema,
  toggleUsersSeenSchema, sendMessageToUserSchema,
} from '@/validations/_core/admins.validations';
import { banUserSchema, liftUserBanSchema } from '@/validations/_core/ban.validations';
import { roleNamesSchema } from '@/validations/_core/role.validations';

import { countBadgeObjects } from '../../services/_core/badgeCount.service.cloud';
import { attachUserListCounters, attachUserRoles } from '../../services/_core/user-list.service.cloud';
import {
  banUser, destroyBinnedUsers, getUserDetailsById, liftUserBan, redactUserDetailsSecrets,
} from '../../services/_core/user.service.cloud';
import { getUserIdsFromRoles } from '../../services/_core/userRole.service.cloud';
import { assertInAgentCountries } from '../../utils/_core/agent-scope.utils.cloud';
import { sendEmailToUser } from '../../utils/_core/email.utils.cloud';
import { filtersDatesQuery, multiBooleanQuery, scopeToAgentCountries } from '../../utils/_core/parse.utils.cloud';
import { assertCanActOnUser } from '../../utils/_core/role.utils.cloud';
import { sendSmsToUser } from '../../utils/_core/sms.utils.cloud';
import { getUserPhoneSearchQueries } from '../../utils/_core/user-search.utils.cloud';
import { isUserFromBO } from '../../utils/_core/user.utils.cloud';
import { actingUserContext, fromBO } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

Parse.Cloud.define(
  'getUsers',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<any> => {
    const {
      limit,
      skip,
      orderBy,
      order,
      filters,
      search,
      ids,
    } = request.params;
    let query = new Parse.Query(Parse.User);

    /*
     * full text search
     * should be before all other queries
     */
    if (search?.text) {
      const text = escapeText(search.text);

      query = Parse.Query.or(
        new Parse.Query(Parse.User).matches('lastName', text),
        new Parse.Query(Parse.User).matches('firstName', text),
        new Parse.Query(Parse.User).matches('username', text),
        // a member who signed up by phone is found by the number support was given, in any form
        ...getUserPhoneSearchQueries(search.text)
      );
    }

    if (ids && Array.isArray(ids) && ids.length > 0) {
      query.containedIn('objectId', ids);
    }

    // the countries the agent's roles cover, whether or not a filter asks for any
    const countries = scopeCountries(search?.countries);

    if (countries) query.containedIn('country', countries);

    query.limit(+limit).skip(+skip);

    // mainly for page (url)
    if (filters) {
      if (isBoolean(filters.deleted)) {
        query.equalTo('deleted', filters.deleted);
      }

      if (isBoolean(filters.seen)) {
        query.equalTo('seen', filters.seen);
      }

      if (filters.platform) {
        query.equalTo('platforms.name', filters.platform);
      }
      else if (isBoolean(filters.fromBO) && !filters.fromBO) {
        query.notEqualTo('platforms.name', 'bo');
      }
    }

    // Advanced search
    if (search) {
      if (search.lastName) {
        query.matches('lastName', escapeText(search.lastName));
      }
      if (search.firstName) {
        query.matches('firstName', escapeText(search.firstName));
      }
      if (search.email) {
        query.matches('username', escapeText(search.email));
      }
      if (search.sex) {
        query.containedIn('sex', search.sex);
      }

      // the advanced search form names the field `platforms`, the URL filters `platform`
      const searchedPlatforms = search.platforms ?? search.platform;

      if (searchedPlatforms) {
        query.containedIn('platforms.name', searchedPlatforms);
      }


      /*
       * "not verified" is a flag that is false *or never written*: an account created before the flag
       * existed has no field at all, so `equalTo(false)` would silently drop the oldest accounts
       */
      if (isBoolean(search.emailVerified)) {
        multiBooleanQuery(query, [search.emailVerified], 'emailVerified');
      }

      if (isBoolean(search.phoneVerified)) {
        multiBooleanQuery(query, [search.phoneVerified], 'phoneVerified');
      }

      if (isBoolean(search.verified)) {
        if (search.verified) {
          query.equalTo('verified', search.verified);
        }
        else {
          // verified field does not exist or is false
          query.notEqualTo('verified', true);
        }
      }

      // query dates
      filtersDatesQuery(query, search, ['birthday']);
      // [true, false] query
      multiBooleanQuery(query, search.isOnline, 'isOnline');
    }

    if (order === 'desc') {
      query.descending(orderBy);
    }
    else {
      query.ascending(orderBy);
    }

    const result: Record<string, any> = await query.withCount().find(USE_MASTER_KEY);

    /*
     * the per-row facts the list shows that are not stored on the user (today: how many vehicles
     * the account owns) are read for the whole page at once. The enriched users replace the
     * fetched ones rather than being written onto them: an object holding unsaved changes comes
     * out of `Parse._encode` as a bare pointer, stripped of every attribute
     */
    result.results = await attachUserListCounters(result.results);
    result.results = await attachUserRoles(result.results);
    // the list shows whether the second factor is on — never its encrypted secret or backup codes
    result.results = result.results.map(redactUserDetailsSecrets);

    return result;
  }, ['find'], collections.User),
  parseFunctionValidation(getUsersSchema)
);

Parse.Cloud.define(
  'getUser',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.User | false> => {
    const { id, shouldMarkAsSeen, include = [] } = request.params;

    if (id !== request.user?.id) await assertInAgentCountries(collections.User, id);
    const user = await getUserDetailsById(id, include);

    if (!user) {
      throw new Error('user:errors.userNotFound');
    }

    if (shouldMarkAsSeen) {
      user.set('seen', true);
      /*
       * saved even when the account is already seen: the trigger keeps `seenAt` on the first
       * admin who opened it and records this visit under `lastSeenAt`/`seenCount` instead, which
       * is what makes "opened 4 times, last by Marie" answerable at all. The acting-user context
       * is what stops that record naming nobody — the master key carries no session.
       */
      await user.save(null, { ...USE_MASTER_KEY, ...actingUserContext(request.user) });
    }

    // false instead of undefined or null to avoid client serialization issues (the client return "ok" even if the page is not found)
    if (!user) return false;

    return redactUserDetailsSecrets(user);
  }, ['get'], collections.User),
  parseFunctionValidation(getUserSchema)
);

Parse.Cloud.define(
  'deleteUser',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.User> => {
    const { id } = (request as any).params;

    await assertInAgentCountries(collections.User, id);
    const user = await new Parse.Query(Parse.User).equalTo('objectId', id).first(USE_MASTER_KEY);

    if (!user) {
      throw new Error('user:errors.userNotFound');
    }

    user.set('deleted', true);
    const updatedUser = await user.save(null, USE_MASTER_KEY);

    return updatedUser;
  }, ['update'], collections.User),
  parseFunctionValidation(deleteUserSchema)
);

Parse.Cloud.define(
  'deleteUsers',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.User[]> => {
    const { ids } = (request as any).params;
    const users: Parse.User[] = [];

    await scopeToAgentCountries(new Parse.Query(Parse.User)).containedIn('objectId', ids).each(async (user: Parse.User): Promise<void> => {
      user.set('deleted', true);
      const updatedUser = await user.save(null, USE_MASTER_KEY);

      users.push(updatedUser);
    }, USE_MASTER_KEY);

    return users;
  }, ['delete'], collections.User),
  parseFunctionValidation(deleteUsersSchema)
);

/*
 * Erases accounts for good. Gated by the `destroy` right on users, like every other permanent
 * deletion (`destroyObjects`), so it can be given to the post that handles erasure requests rather
 * than wait for an owner. Two safeguards stay: only an account already moved to the bin (`deleted`)
 * is erased, and an owner's or super-administrator's account only by one of them. The owners are told.
 */
Parse.Cloud.define(
  'destroyUsers',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const { ids, locale = DEFAULT_LANGUAGE } = request.params;

    await destroyBinnedUsers(request.user!, ids, locale);
  }, ['destroy'], collections.User),
  parseFunctionValidation(destroyUsersSchema)
);

Parse.Cloud.define(
  'banUser',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.User> => {
    const currentUser = request.user!;
    const isFromBO = isUserFromBO(currentUser);

    // only back office users can ban a user
    if (!isFromBO) {
      throw new Error('user:errors.accessDenied');
    }

    const {
      userId, type, reason, reasonDetails, until,
    } = request.params;
    const user = await new Parse.Query(Parse.User).equalTo('objectId', userId).first(USE_MASTER_KEY);

    if (!user) {
      throw new Error('user:errors.userNotFound');
    }

    // an owner or super-admin can only be banned by another one
    await assertCanActOnUser(currentUser, user, currentUser.get('locale') ?? DEFAULT_LANGUAGE);
    // and only by an administrator whose roles cover the member's country
    resolveScopedCountry(user.get('country'));

    // the email is sent to the banned user, so it must use their own locale, not the admin's
    const locale = user.get('locale') ?? DEFAULT_LANGUAGE;

    return banUser(user, currentUser, { type, reason, reasonDetails, until, locale });
  }, ['update'], collections.User),
  parseFunctionValidation(banUserSchema)
);

Parse.Cloud.define(
  'liftUserBan',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.User> => {
    const currentUser = request.user!;
    const isFromBO = isUserFromBO(currentUser);

    // only back office users can lift a user ban
    if (!isFromBO) {
      throw new Error('user:errors.accessDenied');
    }

    const { userId } = request.params;
    const user = await new Parse.Query(Parse.User).equalTo('objectId', userId).first(USE_MASTER_KEY);

    if (!user) {
      throw new Error('user:errors.userNotFound');
    }

    await assertCanActOnUser(currentUser, user, currentUser.get('locale') ?? DEFAULT_LANGUAGE);
    resolveScopedCountry(user.get('country'));

    // the email is sent to the lifted user ban, so it must use their own locale, not the admin's
    const locale = user.get('locale') ?? DEFAULT_LANGUAGE;

    return liftUserBan(user, locale, currentUser);
  }, ['update'], collections.User),
  parseFunctionValidation(liftUserBanSchema)
);

/**
 * `_User`'s own "mark as seen" — separate from the generic `bulkToggleEntitiesSeen` because the
 * class can only be written with the master key, and shaped the same way otherwise: one `saveAll`
 * instead of a save per account, and `notEqualTo` so an account already in the target state is
 * left alone rather than having its first-seen date rewritten by a re-save.
 */
Parse.Cloud.define(
  'toggleUsersSeen',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<ToggleSeenResult> => {
    const { ids = [], value = true } = (request as any).params;

    const users = await scopeToAgentCountries(new Parse.Query(Parse.User))
      .containedIn('objectId', ids)
      .notEqualTo('seen', value)
      .select(['objectId', 'seen'])
      .limit(MAX_BULK_UPDATE_LIMIT)
      .find(USE_MASTER_KEY);

    users.forEach((user: Parse.User) => user.set('seen', value));

    // names the admin behind this master-key write in the audit fields — see `getActingUser`
    await Parse.Object.saveAll(users, { ...USE_MASTER_KEY, ...actingUserContext(request.user) });

    return {
      toggledIds: users.map((user: Parse.User): string => user.id),
      count: await countBadgeObjects(collections.User),
    };
  }, ['update'], collections.User),
  parseFunctionValidation(toggleUsersSeenSchema)
);

Parse.Cloud.define(
  'getUserIdsFromRoles',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<string[]> => {
    const { roleNames } = (request).params;
    const userIds = await getUserIdsFromRoles(roleNames);

    return userIds;
  }, ['find'], collections.User),
  parseFunctionValidation(roleNamesSchema)
);

/**
 * Send a one-off message written by an administrator to a single user, through the channel they
 * chose. The recipient is identified by the id of the account, on both channels: a member who signed
 * up by phone has no email to look them up by, and the address or the handset a message goes to is
 * the one held on that account rather than one the caller supplies.
 */
Parse.Cloud.define(
  'sendMessageToUser',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<boolean> => {
    const {
      userId, channel, subject, message,
    } = (request).params;

    await assertInAgentCountries(collections.User, userId);

    const user = await new Parse.Query(Parse.User)
      .equalTo('objectId', userId)
      .select(['email', 'phone', 'firstName', 'lastName', 'locale'])
      .first(USE_MASTER_KEY);

    if (!user) return false;

    if (channel === MessageChannelEnum.SMS) {
      return sendSmsToUser(user, message);
    }

    // a member with no address has no mailbox: that is an email not sent, not one lost on the way
    if (!user.get('email')) return false;

    // an email without a subject line reaches the mailbox as an empty header, so it is not sent
    if (!subject) return false;

    /*
     * what the operator typed is text, not markup: the field is a plain textarea, so its line
     * breaks have to be made explicit or the email arrives as one block, and a `<` in it would
     * otherwise be read as a tag by the mail client
     */
    const isSent = await sendEmailToUser(user, { subject, message: renderTextAsHtml(message) });

    return !!isSent;
  }, ['update'], collections.User),
  parseFunctionValidation(sendMessageToUserSchema)
);
