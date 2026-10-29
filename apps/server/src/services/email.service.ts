import { BrevoClient, BrevoError } from '@getbrevo/brevo';

import type {
  ICreateContactEmailParams,
  ICreateEmailContactResponse,
  ICreateEmailResponse,
  IGetContactsResponse,
  ISendEmail,
} from '@/types/email.type';

import { ADMIN_EMAIL_SENDER, APP_NAME } from '@/utils/constants';
import { logger } from '@/utils/logger';

/**
 * attributes for contact
 * see: https://app.brevo.com/contact/attribute/list
 */
const CONTACT_ATTRIBUTES = [
  { attributeCategory: 'normal' as const, attributeName: 'FIRSTNAME', type: 'text' as const },
  { attributeCategory: 'normal' as const, attributeName: 'LASTNAME', type: 'text' as const },
];

// ─── Singleton client ────────────────────────────────────────────────────────

let _client: BrevoClient | null = null;

const getBrevoClient = (): BrevoClient => {
  if (!_client) {
    _client = new BrevoClient({ apiKey: process.env.BREVO_API_KEY ?? '' });
  }
  return _client;
};

// ─── Contact attributes — initialized once ──────────────────────────────────

let _contactAttributesReady: Promise<void> | null = null;

/**
 * create attributes for contact
 * the attributes are the fields of the contact
 * and used as variables in the email template
 */
const createContactAttributes = async (): Promise<void> => {
  const client = getBrevoClient();

  await Promise.all(
    CONTACT_ATTRIBUTES.map((attribute) => client.contacts.createAttribute(attribute))
  );
};

const ensureContactAttributes = (): Promise<void> => {
  if (!_contactAttributesReady) {
    _contactAttributesReady = createContactAttributes().catch((error: unknown) => {
      // swallow error to avoid breaking the contact creation, reset so it is retried on the next call
      _contactAttributesReady = null;
      logger.error('createContactAttributes failed : ', (error as BrevoError)?.body);
    });
  }
  return _contactAttributesReady;
};

// ─── Public API ─────────────────────────────────────────────────────────────

/**
 * create contact in Brevo
 * see: https://app.brevo.com/contact/list/id/5
 * @param values
 * @param id
 * @returns
 */
export const createContactEmail = async (
  values: ICreateContactEmailParams,
  id?: string
): Promise<ICreateEmailContactResponse> => {
  try {
    const client = getBrevoClient();

    await ensureContactAttributes();

    const data = await client.contacts.createContact({
      ...values,
      attributes: {
        LASTNAME: values.attributes.lastName,
        FIRSTNAME: values.attributes.firstName ?? '',
        EMAIL: values.email,
        SMS: values.attributes.sms ?? '',
      },
      ...(id ? { ext_id: id } : {}),
    });

    logger.info('create contact success: ', JSON.stringify(data));
    return data;
  }
  catch (error: unknown) {
    logger.error('create contact failed : ', (error as BrevoError)?.body);
  }
};

export const getContacts = async (): Promise<IGetContactsResponse> => {
  try {
    const client = getBrevoClient();
    const data = await client.contacts.getContacts({ limit: 50, offset: 0 });

    logger.info('getContacts success: ', data);
    return data;
  }
  catch (error: unknown) {
    logger.error('getContacts failed : ', (error as BrevoError)?.body);
  }
};

export const sendEmail = async (values: ISendEmail): Promise<ICreateEmailResponse> => {
  try {
    const client = getBrevoClient();

    if (!values.sender) {
      values.sender = { email: ADMIN_EMAIL_SENDER!, name: APP_NAME };
    }

    const data = await client.transactionalEmails.sendTransacEmail(values);

    logger.info('sendEmail success : ', JSON.stringify(data));
    return data;
  }
  catch (error: unknown) {
    logger.error('sendEmail failed : ', (error as BrevoError)?.body);

    throw error;
  }
};
