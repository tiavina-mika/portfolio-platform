import { BrevoClient, BrevoError } from '@getbrevo/brevo';
import { E2eOutboxChannelEnum } from '@shared/domain-types';

import type {
  ICreateContactEmailParams,
  ICreateEmailContactResponse,
  ICreateEmailResponse,
  IGetContactsResponse,
  ISendEmail,
  ISendEmailResult,
} from '@/types/email.type';

import { APP_NAME, IS_E2E } from '@/constants/_core/constants';
import { recordE2eMessage } from '@/utils/_core/e2e-outbox.utils';
import { logger } from '@/utils/_core/logger';
import { getAdminEmailSender } from '@/utils/_core/user.utils';

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

const createContactAttributes = async (): Promise<void> => {
  const client = getBrevoClient();

  await Promise.all(
    CONTACT_ATTRIBUTES.map((attribute) => client.contacts.createAttribute(attribute))
  );
};

const ensureContactAttributes = (): Promise<void> => {
  if (!_contactAttributesReady) {
    _contactAttributesReady = createContactAttributes().catch((error: unknown) => {
      // Reset so it can be retried on the next call if it failed
      _contactAttributesReady = null;
      logger.error('createContactAttributes failed', {
        status: (error as BrevoError)?.statusCode,
        body: (error as BrevoError)?.body,
      });
    });
  }
  return _contactAttributesReady;
};

// ─── Public API ─────────────────────────────────────────────────────────────

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

    logger.info('create contact success', { data });
    return data;
  }
  catch (error: unknown) {
    logger.error('create contact failed', {
      status: (error as BrevoError)?.statusCode,
      body: (error as BrevoError)?.body,
    });
  }
};

export const getContacts = async (): Promise<IGetContactsResponse> => {
  try {
    const client = getBrevoClient();
    const data = await client.contacts.getContacts({ limit: 50, offset: 0 });

    logger.info('getContacts success:', data);
    return data;
  }
  catch (error: unknown) {
    logger.error('getContacts failed', {
      status: (error as BrevoError)?.statusCode,
      body: (error as BrevoError)?.body,
    });
  }
};

/**
 * Sends one transactional e-mail. A refusal comes back with Brevo's own code and message rather than
 * as a bare `undefined`: a notification records them on the recipient the e-mail failed for.
 */
export const sendEmailWithResult = async (values: ISendEmail): Promise<ISendEmailResult> => {
  // E2E runs keep the e-mail instead of calling Brevo, so a test can assert on what was sent
  if (IS_E2E) {
    recordE2eMessage({
      channel: E2eOutboxChannelEnum.EMAIL,
      to: values.to?.map((recipient) => recipient.email) ?? [],
      subject: values.subject,
      body: values.htmlContent ?? values.textContent ?? '',
    });
    return { data: { messageId: 'e2e' } };
  }

  try {
    const client = getBrevoClient();

    if (!values.sender) {
      values.sender = { email: getAdminEmailSender(), name: APP_NAME };
    }

    const data = await client.transactionalEmails.sendTransacEmail(values);

    logger.info('sendEmail success:', JSON.stringify(data));
    return { data };
  }
  catch (error: unknown) {
    const brevoError = error as BrevoError | undefined;
    const body = brevoError?.body as { code?: string; message?: string } | undefined;

    logger.warn('sendEmail failed', {
      status: brevoError?.statusCode,
      body: brevoError?.body,
    });

    return {
      errorCode: body?.code ?? (brevoError?.statusCode
        ? String(brevoError.statusCode)
        : undefined),
      errorMessage: body?.message ?? brevoError?.message,
    };
  }
};

export const sendEmail = async (values: ISendEmail): Promise<ICreateEmailResponse> => (
  (await sendEmailWithResult(values)).data
);
