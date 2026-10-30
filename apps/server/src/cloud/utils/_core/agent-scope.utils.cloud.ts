import { getCountry } from '@shared/utils';

import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import { USE_MASTER_KEY } from '@/constants/_core/constants';
import { getAgentAllowedCountries } from '@/utils/_core/agent-context.utils';

type Openable = ConstructorParameters<typeof Parse.Query>[0];

const throwOutOfScope = (): never => {
  throw new Error(translate('error.unauthorizedToDoThisAction', DEFAULT_LANGUAGE));
};

/*
 * the stored code is compared as it is: a code the platform does not know must not be read as the
 * default country's. Only a row with no country at all is the default country's.
 */
const isOutOfScope = (allowed: string[], object: Parse.Object): boolean => (
  !allowed.includes(object.get('country') || getCountry().code)
);

/**
 * Refuses rows of a country the acting back-office agent's roles do not cover. The functions that
 * open an object by its id read with the master key, which the country triggers never narrow, so
 * knowing the id of a payment from another country would otherwise be enough to open it.
 *
 * A row that does not exist is left to the caller, which already answers it its own way. Costs one
 * read, and only for an agent whose roles are limited to some countries.
 * @param className the collection the ids belong to
 * @param ids the objects the agent asks for
 */
export const assertInAgentCountries = async (
  className: Openable,
  ids?: string | string[] | null
): Promise<void> => {
  const allowed = getAgentAllowedCountries();
  const idList = [ids ?? []].flat();

  if (!allowed || idList.length === 0) return;

  const rows = await new Parse.Query(className)
    .containedIn('objectId', idList)
    .select(['country'])
    .limit(idList.length)
    .find(USE_MASTER_KEY);

  if (rows.some((row) => isOutOfScope(allowed, row))) throwOutOfScope();
};
