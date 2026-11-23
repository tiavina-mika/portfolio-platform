import { USE_MASTER_KEY, collections } from '@/constants/_core/constants';

const findCounterService = (name: string): Promise<Parse.Object | undefined> => (
  new Parse.Query(collections.Counter)
    .select(['value'])
    .equalTo('name', name)
    .first(USE_MASTER_KEY)
);

/*
 * the first value of a sequence starts its row. Two first values asked at the same moment both try to
 * create it: the unique index on `name` refuses the second, which then reads the row the first wrote
 */
const findOrCreateCounterService = async (name: string): Promise<Parse.Object> => {
  const counter = await findCounterService(name);

  if (counter) return counter;

  try {
    return await new Parse.Object(collections.Counter, { name, value: 0 }).save(null, USE_MASTER_KEY);
  } catch (error) {
    if ((error as Parse.Error).code !== Parse.Error.DUPLICATE_VALUE) throw error;

    const created = await findCounterService(name);

    if (!created) throw error;

    return created;
  }
};

/**
 * The next value of a named sequence. The row is incremented by the database itself (`$inc`), never
 * read then written, so two calls at the same moment always get two different values, with no gap.
 * @param name the sequence, such as `quote-2026`
 * @returns the value just taken, from 1
 */
export const takeNextCounterValueService = async (name: string): Promise<number> => {
  const counter = await findOrCreateCounterService(name);

  counter.increment('value');

  const saved = await counter.save(null, USE_MASTER_KEY);

  return saved.get('value');
};
