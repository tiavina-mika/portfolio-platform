import { getFaqContentLocale, getFaqThemes } from '@shared/faq';

import type { FaqLocale, FaqTheme } from '@shared/faq';

import { getFaqSchema } from '@/validations/_core/faq.validations';

import { parseFunction } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

type FaqResponse = {
  themes: FaqTheme[];
  contentLocale: FaqLocale;
};

/*
 * The FAQ is served from the JSON the website reads too, so editing it and deploying the server is
 * enough for the app to show it: no release goes through the stores. Each country has its own set of
 * JSON files, and the default country's is read when the asked one has none. Public on purpose — the answers
 * are read before signing up, and by a member who can no longer sign in.
 */
Parse.Cloud.define(
  'getFaq',
  parseFunction((request: Parse.Cloud.FunctionRequest): Promise<FaqResponse> => {
    const locale: string = request.params.locale ?? 'fr';
    const country: string | undefined = request.params.country;

    return Promise.resolve({
      themes: getFaqThemes(locale, country),
      contentLocale: getFaqContentLocale(locale, country),
    });
  }),
  parseFunctionValidation(getFaqSchema)
);
