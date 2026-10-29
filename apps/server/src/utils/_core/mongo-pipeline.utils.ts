/**
 * Adds 1 for every grouped document matching `condition` — a filtered count inside `$group`, so
 * several counts over the same documents come out of a single pass instead of one query each.
 * @param condition a Mongo boolean expression
 * @returns the `$sum` accumulator
 */
export const mongoCountWhen = (condition: unknown): Record<string, unknown> => ({
  $sum: { $cond: [condition, 1, 0] },
});

/**
 * Adds `value` (0 when missing) for every grouped document matching `condition`.
 * @param condition a Mongo boolean expression
 * @param value the expression to add, e.g. `$amount`
 * @returns the `$sum` accumulator
 */
export const mongoSumWhen = (condition: unknown, value: unknown): Record<string, unknown> => ({
  $sum: { $cond: [condition, { $ifNull: [value, 0] }, 0] },
});

/**
 * The object id held by a stored pointer column (`<Class>$<objectId>`). The separator goes through
 * `$literal` because a bare `'$'` string is read by Mongo as a field path, not as a character.
 * @param pointerField `$`-prefixed storage path of the pointer, e.g. `$_p_ride`
 * @returns the Mongo expression, null when the pointer is missing
 */
export const mongoPointerIdExpression = (pointerField: string): Record<string, unknown> => ({
  $arrayElemAt: [{ $split: [pointerField, { $literal: '$' }] }, 1],
});

/**
 * The stored pointer value (`<Class>$<objectId>`) built from an id — what a `$lookup` on a pointer
 * column (`_p_<field>`) has to be joined on.
 * @param className class the pointer points at
 * @param idField `$`-prefixed path of the id, e.g. `$_id`
 * @returns the Mongo expression
 */
export const mongoPointerExpression = (className: string, idField: string): Record<string, unknown> => ({
  $concat: [`${className}$`, idField],
});
