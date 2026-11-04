import { globalSearchSchema } from '@/validations/_core/globalSearch.validations';

import { globalSearch } from '../../services/_core/globalSearch.service.cloud';
import { fromBO } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

Parse.Cloud.define(
  'globalSearch',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<any> => {
    const { text, locales } = request.params;
    const trimmedText = text.trim();

    // avoid a broad, mostly-noisy match on a single character
    if (trimmedText.length < 2) return {};

    // fromBO() throws before reaching here when shouldLogin (default true) and no user is set
    return globalSearch(request.user!, trimmedText, locales);
  }),
  parseFunctionValidation(globalSearchSchema)
);
