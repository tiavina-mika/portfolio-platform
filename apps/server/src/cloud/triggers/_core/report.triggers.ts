import { collections } from '@/constants/_core/constants';

import { getAccountCountryCode, stampCountry } from '../../utils/_core/country.utils.cloud';
import { parseFunction, setBooleanFields } from '../../utils/_core/utils.cloud';

export const Report = Parse.Object.extend('Report');

Parse.Cloud.beforeSave(
  collections.Report,
  parseFunction(async (request: Parse.Cloud.BeforeSaveRequest): Promise<void> => {
    const report = request.object;

    //  ------- creation ------- //
    if (!report.existed()) {
      report.set('deleted', false);
      // a report belongs to the country of whoever filed it
      stampCountry(request, await getAccountCountryCode(report.get('reportedBy') ?? request.user));
      return;
    }

    // ------- update ------- //
    stampCountry(request);
    setBooleanFields(report, request);
  })
);
