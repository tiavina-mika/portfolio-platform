/**
 * Which part of an accepted quote's fixed schedule a payment is: the deposit on acceptance, the
 * milestone in the middle of the work and the balance at the end.
 */
export enum PaymentKindEnum {
  DEPOSIT = 'deposit',
  MILESTONE = 'milestone',
  BALANCE = 'balance'
}

/**
 * Where a payment of a quote stands. `planned` has no due date yet, `due` has one; `paid` is recorded by
 * hand once the client paid. A payment is never deleted: a mistake is `cancelled` and replaced by a new
 * payment, so the history stays.
 */
export enum PaymentStatusEnum {
  PLANNED = 'planned',
  DUE = 'due',
  PAID = 'paid',
  CANCELLED = 'cancelled'
}

// how the client paid, recorded with the payment: nothing is collected online
export enum PaymentMethodEnum {
  TRANSFER = 'transfer',
  CARD = 'card',
  CASH = 'cash',
  OTHER = 'other'
}
