import { filter, isNull } from '@/utils/_core/utils';

/**
 * get values from a Parse.Object or a plain JSON object (some domains are still live
 * Parse.Object instances, others have been converted to JSON during the migration)
 * @param {Parse.Object | Record<string, any>} parseObject
 * @param {Array|Set} fields
 * @param [dest]
 */
export const getValues = (
  parseObject: Parse.Object | Record<string, any>,
  fields: string[],
  dest: Record<string, any> = {}
) => {
  if (parseObject == null) {
    // makes it work with redux-form initialValues
    return null;
  }

  fields.forEach((field: string) => {
    const value = typeof (parseObject as Parse.Object).get === 'function'
      ? (parseObject as Parse.Object).get(field)
      : (parseObject as Record<string, any>)[field];

    if (value != null) {
      dest[field] = value;
    }
  });
  return dest;
};

/**
 * Reads one field off either a live Parse.Object (through `.get()`) or a plain JSON object.
 * Some domains still reach the interface as Parse.Object instances and others as JSON, so any
 * component rendering both shapes has to go through this rather than through either accessor.
 */
export const getObjectField = <T = any>(
  parseObject: Parse.Object | Record<string, any>,
  field: string
): T | undefined => (
  typeof (parseObject as Parse.Object).get === 'function'
    ? (parseObject as Parse.Object).get(field)
    : (parseObject as Record<string, any>)[field]
);

export const setValue = (parseObject: Parse.Object, name: string, value: any): void => {
  const oldValue = parseObject.get(name);

  if (isNull(value)) {
    parseObject.unset(name);
  }
  else if (oldValue !== value) {
    parseObject.set(name, value);
  }
};

/**
 * . null or undefined values aren't set
 * . a value is set only when it's different
 * @param parseObject
 * @param values
 * @param {Array|Set} names (optional), ensures we only set the right properties
 */
export const setValues = (
  parseObject: Parse.Object,
  values: Record<string, any>,
  names: Record<string, any>
): void => {
  if (names) {
    values = filter(values, names);
  }
  for (const key in values) {

    if (!Object.prototype.hasOwnProperty.call(values, key)) {
      continue;
    }
    const value = values[key];

    setValue(parseObject, key, value);
  }
};

export const convertIdToPointer = <O extends Parse.Object | Parse.User>(
  className: string,
  id: string
): O => {
  return { __type: 'Pointer', className, objectId: id } as unknown as O;
};

/**
 * Parse.Object#toJSON() only includes `objectId`, not `id` — but every IXxx type in this
 * codebase declares `id`. Always go through this helper when serializing a Parse instance
 * for the Redux store so consumers can keep reading `.id`.
 */
export const toJSONWithId = <T = any>(parseObject: Parse.Object | Parse.User): T => {
  return { id: parseObject.id, ...parseObject.toJSON() } as T;
};

export const convertIdsToPointer = <O extends Parse.Object | Parse.User>(
  className: string,
  ids: string[]
): O[] => {
  return ids.map((id: string) => convertIdToPointer<O>(className, id));
};

/**
 * optimistic locking guard for concurrent edits.
 * `expectedUpdatedAt` is the `updatedAt` the admin last saw when opening the edit form; `current`
 * is the object freshly re-fetched right before save. If another admin saved in between, the two
 * timestamps diverge and the save must be rejected instead of silently overwriting their change.
 * Skipped (no-op) when there is nothing to compare against (create flow, or caller didn't pass one).
 */
export const assertNoConcurrentEdit = (
  current: { updatedAt?: string | Date },
  expectedUpdatedAt?: string | Date
): void => {
  if (!expectedUpdatedAt || !current.updatedAt) return;

  if (new Date(current.updatedAt).getTime() !== new Date(expectedUpdatedAt).getTime()) {
    throw new Error('common:errors.concurrentEdit');
  }
};

export const parseDBJsonToJson = (
  dbJson: Record<string, any>,
  fieldsToIgnore: string[] = []
): Record<string, any> => {
  return Object.fromEntries(
    Object.entries(dbJson)
      .filter(([key]) => !fieldsToIgnore.includes(key))
      .map(([key, value]) => {
        if (key.startsWith('_p')) {
          // _p_user -> user
          const newKey = key.replace('_p_', '');

          return [newKey, value];
        }
        return [key, value];
      })
  );
};
