import type { LanguageCode } from './language.constants';

/** Which side of the figure a currency symbol is written on: "40 000 Ar" is `after`, "€40" `before`. */
export type CurrencySymbolPosition = 'before' | 'after';

/**
 * The SMS providers the server can send through. MMSDuck takes the national number (no dial code),
 * so it can only serve Madagascar: another country needs a provider that takes it with its dial code.
 */
export type SmsProvider = 'mmsduck';

export type Country = {
  name: string;
  code: string;
  dialCode: string;
  language: LanguageCode;
  /**
   * Languages the app is offered in for a member of this country, the default one first. A country
   * lists only the languages it has translations for and its members speak.
   */
  languages: readonly LanguageCode[];
  /**
   * ISO 4217 code — what amounts are stored and reported as. Amounts are whole units of it: right
   * for the ariary, which has no subunit in use; a currency with cents needs them stored in cents.
   */
  currency: string;
  /**
   * How an amount is written for a member. The ariary's own symbol, not its ISO code: "40 000 Ar"
   * is what a price looks like in Madagascar, and "MGA" is a code for banks and statements.
   */
  currencySymbol: string;
  currencySymbolPosition: CurrencySymbolPosition;
  locale: string;
  /**
   * IANA name of the country's clock — never a fixed offset, which cannot follow daylight saving
   * time or a country changing its rules. Statistics days, receipts and scheduled jobs are read on
   * this clock.
   */
  timeZone: string;
  /**
   * A mobile number as stored: no dial code, no national trunk prefix (the leading 0). One of the
   * operator `prefixes`, then digits up to `nationalNumberLength`.
   */
  mobilePhone: {
    nationalNumberLength: number;
    /**
     * How the national digits are read out loud, group by group: [2, 2, 3, 2] writes 341234567 as
     * "34 12 345 67". Any digit beyond the sizes stays in the last group.
     */
    groupSizes: readonly number[];
    /** What is dialled before the national number inside the country ("034 12 345 67"): "" if nothing */
    trunkPrefix: string;
    prefixes: readonly string[];
  };
  /**
   * Money rules written in the country's currency, so each country sets its own bounds instead of
   * inheriting the ariary figures: a floor of 500 is a deterrent in ariary and nothing in euros.
   */
  pricing: {
    /**
     * Bounds of the total withheld from a passenger who cancels (platform penalty plus driver
     * compensation): a pure percentage has no floor on a cheap booking and no ceiling on a dear one.
     */
    passengerCancellationPenalty: { min: number; max: number };
    /** Bounds of the penalty a driver owes for cancelling a ride that had passengers */
    driverCancellationPenalty: { min: number; max: number };
    /** Step by which a driver moves the price of one stop up or down */
    stopPriceAdjustmentStep: number;
    /** Step of the price filter of the ride search */
    searchPriceStep: number;
  };
  /**
   * National emergency numbers the SOS offers: free, and reachable without mobile data. Fixed keys,
   * so each app can name them in its own language.
   */
  emergencyNumbers: {
    police: string;
    firefighters: string;
  };
  /**
   * The provider that texts the numbers of this country, or `null` when none does. A sign-up by
   * phone, an emergency contact and an answer by SMS all need a number a text reaches, so they are
   * only open to a country with a provider — a number of any other country would never receive its
   * code, or would text a stranger holding the same digits in the provider's own country.
   */
  sms: { provider: SmsProvider } | null;
  support: {
    /** the address the support team answers at */
    email: string;
    /**
     * Mobile operators the support team has a line with, in the order the lines are offered. A
     * caller pays far less to reach a line on its own network (and some have credit for one
     * operator only), so support publishes one number per operator rather than a single one.
     */
    phoneOperators: readonly string[];
    /**
     * Shown while an environment sets no real line, so the "call us" blocks are never empty.
     * Placeholders: each app's environment variables win over them.
     */
    placeholderPhones: Readonly<Record<string, string>>;
  };
  /**
   * What a receipt printed for a payment in this country carries beyond the payment itself.
   * Lines of the company's legal identity (registration, tax number…) as the country requires
   * them — none until the company's details exist.
   */
  receipt: {
    legalMentions: readonly string[];
  };
  /** How the company is reached publicly in this country: website footer, contact page, metadata. */
  contact: {
    email: string;
    phone: string;
    addressLines: readonly string[];
  };
};

/** Every country the platform runs in, by ISO 3166-1 alpha-2 code. */
export const COUNTRIES = {
  MG: {
    name: 'Madagascar',
    code: 'MG',
    dialCode: '+261',
    language: 'fr',
    languages: ['fr', 'mg', 'en'],
    currency: 'MGA',
    currencySymbol: 'Ar',
    currencySymbolPosition: 'after',
    locale: 'fr',
    timeZone: 'Indian/Antananarivo',
    // 032/037 Orange, 033 Airtel, 034/038 Yas (Mvola)
    mobilePhone: {
      nationalNumberLength: 9,
      groupSizes: [2, 2, 3, 2],
      trunkPrefix: '0',
      prefixes: ['32', '33', '34', '37', '38'],
    },
    pricing: {
      passengerCancellationPenalty: { min: 500, max: 20000 },
      driverCancellationPenalty: { min: 2000, max: 15000 },
      stopPriceAdjustmentStep: 500,
      searchPriceStep: 5000,
    },
    emergencyNumbers: {
      police: '117',
      firefighters: '118',
    },
    sms: { provider: 'mmsduck' },
    support: {
      email: 'support@example.com',
      phoneOperators: ['yas', 'airtel', 'orange'],
      // TODO: dummy lines until the real support numbers are provided
      placeholderPhones: {
        yas: '+261 34 00 000 01',
        airtel: '+261 33 00 000 02',
        orange: '+261 32 00 000 03',
      },
    },
    // TODO: the company's legal identity lines (registration, tax number) once the company exists
    receipt: { legalMentions: [] },
    // TODO: dummy contact info until real contact details are provided
    contact: {
      email: 'contact@example.com',
      phone: '+261 34 00 000 00',
      addressLines: ['Antananarivo, Madagascar'],
    },
  },
} as const satisfies Record<string, Country>;

export type CountryCode = keyof typeof COUNTRIES;

export const DEFAULT_COUNTRY_CODE: CountryCode = 'MG';

export const DEFAULT_COUNTRY = COUNTRIES[DEFAULT_COUNTRY_CODE];
