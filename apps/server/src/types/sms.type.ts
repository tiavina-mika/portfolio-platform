export type SmsStatus = 'queued' | 'processing' | 'sent' | 'failed' | 'cancelled';

export type ISendSms = {
  /** the recipient's national digits, as phone numbers are stored (no dial code, no leading 0) */
  to: string;
  message: string;
  /**
   * The dial code of the recipient's country, bare or with its '+': it picks the provider that
   * texts that country. Left out, the number is read as one of the default country — a number
   * typed with no dial code, or stored without one.
   */
  dialCode?: string;
};

export type ISendSmsResponse = {
  success: boolean;
  message_id: string;
  status: SmsStatus;
} | undefined;

/** An SMS handed to a provider: its response, or the provider's own code and wording for the refusal. */
export type ISendSmsResult = {
  data?: NonNullable<ISendSmsResponse>;
  errorCode?: string;
  errorMessage?: string;
};

/**
 * What an SMS provider is handed: the national digits and the dial code of the recipient's country,
 * so each provider writes the number the way its own API takes it.
 */
export type SmsProviderInput = {
  nationalNumber: string;
  /** with its '+' ('+261') */
  dialCode: string;
  message: string;
};

export type SmsProviderResult = ISendSmsResult & {
  /** the provider refuses every text until its account is topped up: the staff has to be warned */
  isOutOfCredit?: boolean;
};

/** One SMS provider: sends one text and says how it went, never throws */
export type SmsProviderSender = (input: SmsProviderInput) => Promise<SmsProviderResult>;
