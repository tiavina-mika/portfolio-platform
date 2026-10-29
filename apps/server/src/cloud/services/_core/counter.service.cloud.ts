import { collections, USE_MASTER_KEY } from '@/constants/_core/constants';

const Counter = Parse.Object.extend(collections.Counter);

/**
 * Number of times a lost race for the very first draw of a sequence is retried. Only the creation
 * of the counter row itself can be lost — `name` is uniquely indexed, so the loser's save is
 * rejected and it simply reads the winner's row on the next pass. Two attempts are therefore
 * always enough; the third is there so a cold start under real concurrency never surfaces as an
 * error to the caller.
 */
const MAX_ATTEMPTS = 3;

/**
 * Next value of a named, monotonically increasing sequence, drawn atomically.
 *
 * The draw is a Mongo `$inc` on a single document, so two tickets opened in the same millisecond
 * get two different numbers — reading the last ticket's reference and adding one would hand them
 * the same one. A value is consumed even when the caller then fails, which is deliberate: a
 * sequence that never reuses a number is what makes a reference safe to quote.
 *
 * @param name the sequence to draw from — one row per name
 * @param startAt the value the sequence sits at before its first draw, so the first value handed
 *   out is `startAt + 1`
 * @returns the freshly drawn value, never handed out twice
 */
export const getNextSequenceValue = async (name: string, startAt = 0): Promise<number> => {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const existing = await new Parse.Query(Counter)
      .equalTo('name', name)
      .select(['name', 'value'])
      .first(USE_MASTER_KEY);
    const counter = existing ?? new Counter({ name, value: startAt });

    counter.increment('value', 1);

    try {
      const saved = await counter.save(null, USE_MASTER_KEY);

      return saved.get('value') as number;
    }
    catch (error) {
      // the unique index on `name` rejected a concurrent first draw — read the winner's row instead
      if (existing || attempt === MAX_ATTEMPTS) throw error;
    }
  }

  throw new Error(`Could not draw a value from the "${name}" sequence`);
};
