
import { USE_MASTER_KEY } from '@/utils/constants';
import { decrypt } from '@/utils/encrypt.utils';
import { escapeText, generateToken, isBoolean } from '@/utils/util';
import { getEncryptedEmailSchema } from '@/validations/auth.validation';
import { RoleNamesSchema } from '@/validations/role.validation';
import { SaveLanguageSchema } from '@/validations/user.validation';

import { getUserIdsFromRoles } from '../services/userRole.service.cloud';
import { sendEmailToUser } from '../utils/email.utils.cloud';
import { filtersDatesQuery, multiBooleanQuery } from '../utils/parse.utils.cloud';
import { isAdministrator } from '../utils/role.utils.cloud';
import { isUserFromBO } from '../utils/user.utils.cloud';
import { fromBO, parseFunction, parseFunctionValidation } from '../utils/utils.cloud';

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
    let query = await new Parse.Query(Parse.User);

    /*
     * full text search
     * should be before all other queries
     */
    if (search?.text) {
      const text = escapeText(search.text);

      query = Parse.Query.or(
        new Parse.Query(Parse.User).matches('lastName', text),
        new Parse.Query(Parse.User).matches('firstName', text),
        new Parse.Query(Parse.User).matches('username', text)
      );
    }

    if (ids && Array.isArray(ids) && ids.length > 0) {
      query.containedIn('objectId', ids);
    }

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

      if (search.platform) {
        query.containedIn('platforms.name', search.platform);
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
      filtersDatesQuery(query, search);
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

    return result;
  })
);

Parse.Cloud.define(
  'getUser',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.User | false> => {
    const { id, shouldMarkAsSeen } = request.params;
    const user = await new Parse.Query(Parse.User).equalTo('objectId', id).first(USE_MASTER_KEY);

    if (!user) {
      throw new Error('user:errors.userNotFound');
    }

    if (shouldMarkAsSeen) {
      user.set('seen', true);
      await user.save(null, USE_MASTER_KEY);
    }

    // false instead of undefined or null to avoid client serialization issues (the client return "ok" even if the page is not found)
    if (!user) return false;

    return user;
  })
);

Parse.Cloud.define(
  'deleteUser',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.User> => {
    const { id } = (request as any).params;
    const user = await new Parse.Query(Parse.User).equalTo('objectId', id).first(USE_MASTER_KEY);

    if (!user) {
      throw new Error('user:errors.userNotFound');
    }

    user.set('deleted', true);
    const updatedUser = await user.save(null, USE_MASTER_KEY);

    return updatedUser;
  })
);

Parse.Cloud.define(
  'getUserByEmail',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.User | boolean> => {
    const { email } = (request).params;
    const user = await new Parse.Query(Parse.User).equalTo('email', email).first(USE_MASTER_KEY);

    // should not throw an error
    if (!user) {
      return false;
    }

    return user;
  })
);


Parse.Cloud.define(
  'deleteUsers',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.User[] | undefined> => {
    const currentUser = request.user;

    if (!currentUser) return;
    const isAdmin = isAdministrator(currentUser);

    if (!isAdmin) {
      throw new Error('user:errors.accessDenied');
    }

    const { ids } = (request as any).params;
    const users: Parse.User[] = [];

    await new Parse.Query(Parse.User).containedIn('objectId', ids).each(async (user: Parse.User): Promise<void> => {
      user.set('deleted', true);
      const updatedUser = await user.save(null, USE_MASTER_KEY);

      users.push(updatedUser);
    }, USE_MASTER_KEY);

    return users;
  })
);

Parse.Cloud.define(
  'destroyUsers',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const currentUser = request.user;

    if (!currentUser) return;
    const isAdmin = isAdministrator(currentUser);

    if (!isAdmin) {
      throw new Error('user:errors.accessDenied');
    }

    const { ids } = (request as any).params;

    await new Parse.Query(Parse.User)
      .containedIn('objectId', ids)
      .equalTo('deleted', true)
      .each(async (user) => {
        await user.destroy(USE_MASTER_KEY);
      }, USE_MASTER_KEY);
  })
);

Parse.Cloud.define(
  'toggleBanUser',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.User | undefined> => {
    const currentUser = request.user;

    if (!currentUser) return;
    const isFromBO = isUserFromBO(currentUser);

    // only back office user can ban/not ban a user
    if (!isFromBO) {
      throw new Error('user:errors.accessDenied');
    }

    const { id, value = true } = request.params;
    const user = await new Parse.Query(Parse.User).equalTo('objectId', id).first(USE_MASTER_KEY);

    if (!user) {
      throw new Error('user:errors.userNotFound');
    }

    user.set('banned', value);
    const updatedUser = await user.save(null, USE_MASTER_KEY);

    return updatedUser;
  })
);

Parse.Cloud.define(
  'createSessionTokenForAUser',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.User | void> => {
    const currentUser = request.user;

    if (!currentUser) return;
    const isAdmin = isAdministrator(currentUser);

    if (!isAdmin) {
      throw new Error('user:errors.accessDenied');
    }

    const { fields } = request.params;
    const anonymousUser = await Parse.AnonymousUtils.logIn();

    if (fields && fields.length > 0) {
      for (const value of fields) {
        anonymousUser.set(value.field, value.value);
      }
    }

    const authData = anonymousUser.get('authData');
    const anonymousAuthData = authData.anonymous;

    const anonymousToken = anonymousAuthData.id + '-' + anonymousUser.get('username') + '-' + generateToken(10);
    const newAuthData = {
      ...authData,
      anonymous: {
        ...anonymousAuthData,
        token: anonymousToken,
      },
    };

    // update the authData to trigger a sessionToken creation
    anonymousUser.set('authData', newAuthData);
    const savedAnonymousUser = await anonymousUser.save(null, USE_MASTER_KEY);

    return savedAnonymousUser;
  })
);

Parse.Cloud.define(
  'toggleUserSeen',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const { id } = (request as any).params;
    const user = await new Parse.Query(Parse.User).equalTo('objectId', id).first(USE_MASTER_KEY);

    if (!user) {
      throw new Error('user:errors.userNotFound');
    }
    user.set('seen', !user.get('seen'));
    await user.save(null, USE_MASTER_KEY);
  })
);

Parse.Cloud.define(
  'isUserExistsByEmail',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<boolean> => {
    const { encryptedEmail } = (request).params;
    const decryptedEmail = decrypt(encryptedEmail, null, false); // text, use fixed key, no special char
    const user = await new Parse.Query(Parse.User).equalTo('username', decryptedEmail).first(USE_MASTER_KEY);

    return !!user;
  }),
  parseFunctionValidation(getEncryptedEmailSchema)
);

Parse.Cloud.define(
  'getUserIdsFromRoles',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<string[]> => {
    const { roleNames } = (request).params;
    const userIds = await getUserIdsFromRoles(roleNames);

    return userIds;
  }),
  parseFunctionValidation(RoleNamesSchema)
);

Parse.Cloud.define(
  'sendEmailToUser',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<boolean> => {
    const { email, subject, message } = (request).params;
    const user = await new Parse.Query(Parse.User).equalTo('email', email).first(USE_MASTER_KEY);

    if (!user) return false;

    const isSent = await sendEmailToUser(user, { subject, message });

    return !!isSent;
  })
);

/**
 * Get the number of new users (seen = false)
 * it's used to display the number of new users in the back office as notification
 */
Parse.Cloud.define(
  'getNewUsersCount',
  parseFunction(async (): Promise<number> => {
    const count = await new Parse.Query(Parse.User)
      .equalTo('seen', false)
      .equalTo('deleted', false)
      .limit(100)
      .count(USE_MASTER_KEY);

    return count;
  })
);

/**
 * Save the user language
 */
Parse.Cloud.define(
  'saveUserLanguage',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const { locale, userId } = request.params;
    const user = await new Parse.Query(Parse.User).equalTo('objectId', userId).first(USE_MASTER_KEY);

    if (!user) return;

    user.set('locale', locale);
    await user.save(null, USE_MASTER_KEY);
  }),
  parseFunctionValidation(SaveLanguageSchema)
);
