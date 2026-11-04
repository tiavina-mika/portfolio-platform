import { AsyncLocalStorage } from 'node:async_hooks';

import { getCountry } from '@shared/utils';

import type { Country } from '@shared/constants';

import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';

/**
 * Who is acting through a back-office function, for the code deep below it that cannot be handed the
 * request: the text search that has to read a phone number the way the agent writes it, and the list
 * filters and statistics that have to stay inside the countries the agent may work on.
 */
type AgentContext = {
  /** the country of the agent's own account — a number typed without a `+` is read in it */
  country: Country;
  /** the countries the agent's roles cover, `null` when nothing limits them */
  allowedCountries: string[] | null;
};

const agentContextStorage = new AsyncLocalStorage<AgentContext>();

/**
 * Runs `action` with the agent's context available to everything it calls, awaits included.
 * @param user the back-office account making the request
 * @param allowedCountries the countries its roles cover, `null` for all of them
 */
export const runAsAgent = <T>(
  user: Parse.User | undefined,
  allowedCountries: string[] | null,
  action: () => T
): T => (
  agentContextStorage.run({ country: getCountry(user?.get('country')), allowedCountries }, action)
);

/**
 * The country of the agent whose request is being served, or `undefined` outside a back-office
 * function (a job, a trigger, a public function) where nobody typed anything.
 */
export const getAgentCountry = (): Country | undefined => agentContextStorage.getStore()?.country;

/** The countries the agent may work on, or `null` when nothing limits them (and outside a request). */
export const getAgentAllowedCountries = (): string[] | null => (
  agentContextStorage.getStore()?.allowedCountries ?? null
);

/**
 * The countries a list may be read for: what the agent asked for, narrowed to what their roles allow.
 * @param requested the countries picked in the filter, none or an empty list for "all of mine"
 * @returns `undefined` when nothing limits the list, otherwise the countries to filter on — an empty
 * list when the agent asked for countries they may not read, which matches nothing
 */
export const scopeCountries = (requested?: string[]): string[] | undefined => {
  const allowed = getAgentAllowedCountries();

  if (!allowed) return requested?.length ? requested : undefined;
  if (!requested?.length) return allowed;

  return requested.filter((code) => allowed.includes(code));
};

/**
 * The country a figure is read for, refused when the agent's roles do not cover it. A figure read
 * without a country is the default country's, so that one is checked too.
 * @param countryCode what the client asked for
 */
export const resolveScopedCountry = (countryCode?: string | null): Country => {
  const country = getCountry(countryCode);
  const allowed = getAgentAllowedCountries();

  if (allowed && !allowed.includes(country.code)) {
    throw new Error(translate('error.unauthorizedToDoThisAction', DEFAULT_LANGUAGE));
  }

  return country;
};
