// who an Aldaron client is: a company, or a person working on their own
export enum ClientKindEnum {
  COMPANY = 'company',
  INDIVIDUAL = 'individual'
}

/**
 * Where an Aldaron client stands. A client is never deleted while it has a history: it is archived.
 * `anonymized` is set by the erasure of an individual client, which keeps the id, the amounts and the
 * dates but no personal data.
 */
export enum ClientStatusEnum {
  ACTIVE = 'active',
  ARCHIVED = 'archived',
  ANONYMIZED = 'anonymized'
}

// a fixed set of keys, never a key built from data, so every line can be indexed or filtered on
export interface IClientAddress {
  line1?: string;
  line2?: string;
  postalCode?: string;
  city?: string;
  country?: string;
}
