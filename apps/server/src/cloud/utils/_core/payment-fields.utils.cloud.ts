const CORE_PAYMENT_TRACKED_FIELDS = ['payer', 'receiver'];

/**
 * Business domains (ride/request, or any other transaction-based domain) declare
 * which of their related-entity fields on Payment should be tracked for the
 * post-save snapshot job, and which include path to fetch them with.
 * Defaults the include path to the field name itself when not specified.
 * Lives outside payment.service.cloud.ts / payment.triggers.ts to avoid a circular
 * import between the two (the trigger needs to know which fields are tracked,
 * the service needs the same registry to build includes).
 */
const relatedFieldIncludes = new Map<string, string>();

export const registerPaymentRelatedField = (key: string, includePath: string = key): void => {
  relatedFieldIncludes.set(key, includePath);
};

export const isPaymentRelatedFieldDirty = (dirtyKeys: string[]): boolean => {
  return dirtyKeys.some(key => CORE_PAYMENT_TRACKED_FIELDS.includes(key) || relatedFieldIncludes.has(key));
};

export const getPaymentIncludesForDirtyKeys = (dirtyKeys: string[]): string[] => {
  return dirtyKeys
    .filter(key => CORE_PAYMENT_TRACKED_FIELDS.includes(key) || relatedFieldIncludes.has(key))
    .map(key => relatedFieldIncludes.get(key) ?? key);
};

/**
 * The domain fields registered on Payment (a ride, a booking, an order in another project). A
 * payment that gives another one back has to be filed under the same things the original was, or
 * it disappears from the very history it belongs to — and core has no way of naming them itself.
 */
export const getPaymentRelatedFieldKeys = (): string[] => [...relatedFieldIncludes.keys()];
