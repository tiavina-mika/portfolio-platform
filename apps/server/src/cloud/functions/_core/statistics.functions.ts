import { STATISTICS_UI_RIGHT } from '@/constants/_core/constants';
import { overviewStatisticsSchema } from '@/validations/_core/statistics.validations';

import { getOverviewStatistics } from '../../services/_core/statistics.service.cloud';
import { assertHasBoRight } from '../../utils/_core/role.utils.cloud';
import { fromBO } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

const DEFAULT_STATISTICS_MONTHS = 12;

Parse.Cloud.define(
  'getOverviewStatistics',
  fromBO(async (request: Parse.Cloud.FunctionRequest) => {
    const { months = DEFAULT_STATISTICS_MONTHS, country, locale } = request.params;

    // the platform-wide figures of the overview: the statistics right, not only some back-office role
    await assertHasBoRight(request.user!, STATISTICS_UI_RIGHT, locale);

    return getOverviewStatistics(months, country);
  }),
  parseFunctionValidation(overviewStatisticsSchema)
);
