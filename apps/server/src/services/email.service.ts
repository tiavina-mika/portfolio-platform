import {
  ContactsApi, CreateAttribute, CreateContact, SendSmtpEmail, TransactionalEmailsApi,
} from '@getbrevo/brevo';

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
  {
    type: 'normal',
    name: 'FIRSTNAME',
    attributeType: CreateAttribute.TypeEnum.Text,
  },
  {
    type: 'normal',
    name: 'LASTNAME',
    attributeType: CreateAttribute.TypeEnum.Text,
  },
];

/**
 * set key for api instance
 * @param apiInstance
 */
const setKey = (apiInstance: any) => {
  const apiKey = apiInstance.authentications.apiKey;

  apiKey.apiKey = process.env.BREVO_API_KEY;

  const partnerKey = apiInstance.authentications.partnerKey;

  partnerKey.apiKey = process.env.BREVO_API_KEY;
};

/**
 * create attributes for contact
 * the attributes are the fields of the contact
 * and used as variables in the email template
 * @param type
 * @param name
 * @param values
 * @returns
 */
type CreateAttributeType = 'normal' | 'transactional' | 'category' | 'calculated' | 'global';
const createAttribute = async (
  type: 'normal' | 'transactional' | 'category' | 'calculated' | 'global',
  name: string,
  values: CreateAttribute
) => {
  const apiInstance = new ContactsApi();

  setKey(apiInstance);

  let attributes: any = new CreateAttribute();

  attributes = {
    ...attributes,
    ...values,
  };

  const data = await apiInstance.createAttribute(type, name, attributes);

  return data;
};

const createContactAttributes = async () => {
  try {
    const result = await Promise.all(CONTACT_ATTRIBUTES.map(async (attribute) => {
      const data = await createAttribute(
        attribute.type as CreateAttributeType,
        attribute.name,
        { type: attribute.attributeType }
      );

      return data.body;
    }));

    return result;
  }
  catch (error) {
    // swallow error to avoid breaking the contact creation
    logger.error('createContactAttributes failed : ', (error as any)?.body);
  }
};

/**
 * create contact in Brevo
 * see: https://app.brevo.com/contact/list/id/5
 * @param values
 * @param id
 * @returns
 * @throws
 */
export const createContactEmail = async (
  values: ICreateContactEmailParams,
  id?: string
): Promise<ICreateEmailContactResponse> => {
  try {
    const apiInstance = new ContactsApi();

    setKey(apiInstance);

    /**
     * NOTE: the attributes swallow the error if the attribute already exists
     * so we can create the contact even if the attribute already exists
     */
    await createContactAttributes();

    let contactEmail: any = new CreateContact();

    contactEmail = {
      ...contactEmail,
      ...values,
      attributes: {
        LASTNAME: values.attributes.lastName,
        FIRSTNAME: values.attributes.firstName,
        EMAIL: values.email,
        SMS: values.attributes.sms,
        // WHATSAPP: values.attributes.sms,
      },
    };

    if (id) {
      contactEmail.extId = id;
    }

    const data = await apiInstance.createContact(contactEmail);

    logger.info('create contact success: ', JSON.stringify(data));
    return data;
  }
  catch (error) {
    logger.error('create contact failed : ', (error as any)?.body);
  }
};

export const getContacts = async (): Promise<IGetContactsResponse> => {
  try {
    const apiInstance = new ContactsApi();

    setKey(apiInstance);

    const opts = {
      limit: 50,
      offset: 0,
    };

    const data = await apiInstance.getContacts(opts.limit, opts.offset);

    logger.info('getContacts success: ', data);
    return data;
  }
  catch (error) {
    logger.error('getContacts failed : ', (error as any)?.body);
  }
};

export const sendEmail = async (values: ISendEmail): Promise<ICreateEmailResponse> => {
  try {
    const apiInstance = new TransactionalEmailsApi();

    setKey(apiInstance);
    const sendSmtpEmail: any = new SendSmtpEmail();

    if (!values.sender) {
      values.sender = { email: ADMIN_EMAIL_SENDER!, name: APP_NAME };
    }

    const emailValues = { ...sendSmtpEmail, ...values };

    const data = await apiInstance.sendTransacEmail(emailValues);

    logger.info('sendEmail success : ', JSON.stringify(data.body));
    return data;
  }
  catch (error) {
    logger.error('sendEmail failed : ', (error as any)?.body);

    throw error;
  }
};
