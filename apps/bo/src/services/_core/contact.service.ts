import Parse from 'parse';

import { IContact } from '@/types/_core/contact.type';
import { toJSONWithId } from '@/utils/_core/parse.utils';

export const fetchContact = async (id: string, include: string[] = []): Promise<IContact | undefined> => {
  const contact = await Parse.Cloud.run('getContact', { id, include });

  return contact?.toJSON ? toJSONWithId<IContact>(contact) : contact;
};
