export type PaymentSnapshotBuilder = (entity: Parse.Object) => Record<string, any>;

/**
 * Business domains (ride/request, or any other transaction-based domain) declare
 * how to snapshot their own related-entity field on a Payment (e.g. 'ride', 'request').
 * Keeps this generic util free of ride/request-specific knowledge.
 */
const paymentSnapshotBuilders = new Map<string, PaymentSnapshotBuilder>();

export const registerPaymentSnapshotBuilder = (key: string, builder: PaymentSnapshotBuilder): void => {
  paymentSnapshotBuilders.set(key, builder);
};

export const setPaymentSnapshot = (
  payment: Parse.Object, dirtyKeys: string[] = []
): Record<string, any> => {
  const prevSnapshot = payment.get('snapshot') || {};
  const snapshot: Record<string, any> = { ...prevSnapshot };
  const payer = payment.get('payer');
  const receiver = payment.get('receiver');

  if (payer && dirtyKeys.includes('payer')) {
    snapshot.payer = {
      ...prevSnapshot.payer,
      id: payer.id,
      firstName: payer.get('firstName'),
      lastName: payer.get('lastName'),
    };
  }

  if (receiver && dirtyKeys.includes('receiver')) {
    snapshot.receiver = {
      ...prevSnapshot.receiver,
      id: receiver.id,
      firstName: receiver.get('firstName'),
      lastName: receiver.get('lastName'),
    };
  }

  paymentSnapshotBuilders.forEach((builder, key) => {
    const entity = payment.get(key);

    if (entity && dirtyKeys.includes(key)) {
      snapshot[key] = { ...prevSnapshot[key], ...builder(entity) };
    }
  });

  return snapshot;
};
