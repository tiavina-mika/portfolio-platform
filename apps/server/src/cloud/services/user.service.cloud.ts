
import { USE_MASTER_KEY } from '@/utils/constants';
import { escapeText } from '@/utils/util';

export const removeRelationByUser = async (user: Parse.User, className: string): Promise<void> => {
  const queries = await new Parse.Query(className).equalTo('user', user).find();

  for (const query of queries) {
    // remove the user field
    query.unset('user');
    const isUpdatedByExists = await query.exists('updatedBy' as any);

    if (isUpdatedByExists) {
      query.unset('updatedBy');
    }
    const isCreatedBy = await query.exists('createdBy' as any);

    if (isCreatedBy) {
      query.unset('createdBy');
    }

    await query.save(null, {
      ...USE_MASTER_KEY,
      context: { userDeleted: true },
    });
  }
};

/**
 * unset relation fields linked to user after the account deletion
 * @param {*} classNames
 */
export const removeRelationsByUser = async (user: Parse.User, classNames: string[]): Promise<void> => {
  for (const className of classNames) {
    await removeRelationByUser(user, className);
  }
};

export const deleteOrDestroyRelation = async (user: Parse.User, className: string, field: string, type?: 'destroy' | 'delete'): Promise<void> => {
  await new Parse.Query(className)
    .equalTo(field, user)
    .each(async (entity) => {
      if (type === 'destroy') {
        await entity.destroy(USE_MASTER_KEY);
      }
      else if (type === 'delete') {
        entity.set('deleted', true);
        await entity.save(null, USE_MASTER_KEY);
      }
    }, USE_MASTER_KEY);
};

/**
 * query a user relation from another query
 * pointer = relation
 * ex: search a user who create a contact by its name or email
 * @param mainQuery
 * @param text
 * @param field pointer name
 */
export const searchUserPointerQuery = async (mainQuery: Parse.Query, text: string, field = 'user'): Promise<void> => {
  const formattedText = escapeText(text);
  let userPointerQuery = await new Parse.Query(Parse.User);

  userPointerQuery = Parse.Query.or(
    new Parse.Query(Parse.User).matches('lastName', formattedText),
    new Parse.Query(Parse.User).matches('firstName', formattedText),
    new Parse.Query(Parse.User).matches('username', formattedText)
  );

  mainQuery.matchesQuery(field, userPointerQuery);
};
