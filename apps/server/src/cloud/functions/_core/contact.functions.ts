import { TargetEnum } from '@shared/types';

import {
  collections, RECAPTCHA_VERIFICATION_FAILED, USE_MASTER_KEY,
} from '@/constants/_core/constants';
import { verifyRecaptchaToken } from '@/utils/_core/recaptcha.utils';
import { isInWorkspaces } from '@/utils/_core/rights.utils';
import {
  confirmNewsletterSubscriptionSchema, createPublicContactSchema, getContactsSchema,
  getContactSchema, subscribeToNewsletterSchema,
} from '@/validations/_core/contact.validations';

import {
  getContactByIdService, getContactsService,
} from '../../services/_core/contact.service.cloud';
import {
  confirmNewsletterSubscriptionService, subscribeToNewsletterService,
} from '../../services/_core/newsletter.service.cloud';
import { Contact } from '../../triggers/_core/contact.triggers';
import { getUserWorkspaces, resolveWorkspace } from '../../utils/_core/role.utils.cloud';
import { fromBO, parseFunction } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

/**
 * The public website's way in: a visitor has no account, so the reCAPTCHA token stands in for the
 * session and is verified here rather than on the website's own server. It used to be verified
 * there and the row then written straight to `POST /parse/classes/Contact`, a write any caller
 * holding the app id could make with no token at all.
 */
Parse.Cloud.define(
  'createPublicContact',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const {
      email, phone, name, message, acceptNewsLetter, locale, recaptchaToken, target,
    } = request.params;

    if (!(await verifyRecaptchaToken(recaptchaToken))) {
      throw new Error(RECAPTCHA_VERIFICATION_FAILED);
    }

    const contact = new Contact();

    contact.set('email', email);
    contact.set('name', name);
    contact.set('message', message);
    // the workspace the message is read in; the portfolio site sends none
    contact.set('target', target ?? TargetEnum.PORTFOLIO);

    // optional; stored without the separators a person types (spaces, dots, dashes, parentheses)
    if (phone) contact.set('phone', phone.replace(/[\s().-]/g, ''));

    if (acceptNewsLetter) contact.set('acceptNewsLetter', acceptNewsLetter);

    const context = locale ? { locale } : {};

    await contact.save(null, { ...USE_MASTER_KEY, context });

    /*
     * the form's newsletter box: the Contact triggers only react to it on an edited contact, so a new
     * contact never subscribed anyone. Same double opt-in as the newsletter form.
     */
    if (acceptNewsLetter) {
      await subscribeToNewsletterService(email, locale);
    }
  }),
  parseFunctionValidation(createPublicContactSchema)
);

/**
 * Newsletter sign-up from the public website — same reasoning as `createPublicContact`. It only
 * records the address as pending and e-mails a confirmation link (double opt-in), see
 * `subscribeToNewsletterService`.
 */
Parse.Cloud.define(
  'subscribeToNewsletter',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<void> => {
    const {
      email, language, target, recaptchaToken,
    } = request.params;

    if (!(await verifyRecaptchaToken(recaptchaToken))) {
      throw new Error(RECAPTCHA_VERIFICATION_FAILED);
    }

    await subscribeToNewsletterService(email, language, target);
  }),
  parseFunctionValidation(subscribeToNewsletterSchema)
);

/**
 * The link of the confirmation e-mail, opened on the website. No reCAPTCHA: the token is random and
 * can only come from the e-mail this server sent to the address.
 */
Parse.Cloud.define(
  'confirmNewsletterSubscription',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<boolean> => (
    confirmNewsletterSubscriptionService(request.params.token)
  )),
  parseFunctionValidation(confirmNewsletterSubscriptionSchema)
);

type GetContactsResult = { results: Parse.Object[]; count: number };

Parse.Cloud.define(
  'getContacts',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<GetContactsResult> => {
    const {
      limit, skip, orderBy, order, filters, search, include = [], locale,
    } = request.params;

    // the workspace the agent works in, if their roles open it: Aldaron's quote requests are never listed to others
    const workspace = await resolveWorkspace(request.user, request.params.workspace, locale);

    return getContactsService({
      limit, skip, orderBy, order, filters, search, include, workspace,
    });
  }, ['find'], collections.Contact),
  parseFunctionValidation(getContactsSchema)
);

Parse.Cloud.define(
  'getContact',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object | false> => {
    const { id, include = [] } = request.params;

    const contact = await getContactByIdService(id, include);

    // false instead of undefined or null to avoid client serialization issues (the client return "ok" even if the page is not found)
    if (!contact) return false;

    // a message filed in a workspace the account cannot work in does not exist for it
    if (!isInWorkspaces([contact.get('target')], await getUserWorkspaces(request.user))) return false;

    return contact;
  }, ['get'], collections.Contact),
  parseFunctionValidation(getContactSchema)
);
