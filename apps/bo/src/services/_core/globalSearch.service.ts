import Parse from 'parse';

import { locales } from '@/config/i18n';
import { GlobalSearchEntityKey, IGlobalSearchResults } from '@/types/_core/globalSearch.type';
import { toJSONWithId } from '@/utils/_core/parse.utils';

export const fetchGlobalSearchResults = async (text: string): Promise<IGlobalSearchResults> => {
  const rawResults: Record<GlobalSearchEntityKey, Parse.Object[]> = await Parse.Cloud.run('globalSearch', {
    text,
    locales,
  });

  return Object.fromEntries(
    Object.entries(rawResults).map(([key, items]) => [key, items.map((item) => toJSONWithId(item))])
  );
};
