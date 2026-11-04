// An e-mail or SMS kept in memory instead of being sent, when the server runs for the E2E suite

export enum E2eOutboxChannelEnum {
  EMAIL = 'email',
  SMS = 'sms'
}

/** An e-mail or SMS the E2E server kept instead of handing it to Brevo or MMSDuck */
export type E2eOutboxMessage = {
  channel: E2eOutboxChannelEnum;
  to: string[];
  subject?: string;
  body: string;
  sentAt: string;
};

export type E2eOutboxFilter = {
  channel?: E2eOutboxChannelEnum;
  /** matches when one of the recipients contains this text */
  to?: string;
};

