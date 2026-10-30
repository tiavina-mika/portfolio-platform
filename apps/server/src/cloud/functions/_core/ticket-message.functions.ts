import { getCountry } from '@shared/utils';

import type { DBRights, Locale } from '@/types/app.type';

import { DEFAULT_LANGUAGE, translate } from '@/config/i18n';
import { collections } from '@/constants/_core/constants';
import { TicketMessageSenderRoleEnum } from '@/types/ticket.type';
import {
  sendTicketMessageSchema, getTicketMessagesSchema, updateTicketStatusSchema,
  updateTicketPrioritySchema, assignTicketSchema,
} from '@/validations/_core/ticket-message.validations';

import {
  assignTicketService, createTicketMessageService, getTicketById, getTicketMessagesService,
  updateTicketPriorityService, updateTicketStatusService,
} from '../../services/_core/ticket-message.service.cloud';
import { assertInAgentCountries } from '../../utils/_core/agent-scope.utils.cloud';
import { getAllowedCountryCodes, hasRight, isRequestFromManager } from '../../utils/_core/role.utils.cloud';
import { fromBO, parseFunction } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

/**
 * `sendTicketMessage`/`getTicketMessages` are callable by both the ticket's owner (mobile) and
 * a BO agent holding the given `Contact` rights — unlike a plain `fromBO(...)` call, which only
 * ever allows BO users, so the caller kind is resolved here and checked against the appropriate
 * rule. Reading a thread asks for `get` only, so a read-only support post can follow a ticket;
 * answering it asks for `update`.
 */
const assertCanAccessTicket = async (
  ticket: Parse.Object,
  request: Parse.Cloud.FunctionRequest,
  contactRights: DBRights[],
  locale: Locale = DEFAULT_LANGUAGE
): Promise<boolean> => {
  const { user } = request;

  if (!user) throw new Error(translate('error.pleaseLogin', locale));

  const isFromBO = await isRequestFromManager(request);

  if (isFromBO) {
    const hasUserRight = await hasRight(user, collections.Contact, contactRights);

    if (!hasUserRight) throw new Error(translate('error.unauthorizedToDoThisAction', locale));

    // this guard is not wrapped by fromBO, so the countries of the agent's roles are read here
    const allowedCountries = await getAllowedCountryCodes(user);

    if (allowedCountries && !allowedCountries.includes(ticket.get('country') || getCountry().code)) {
      throw new Error(translate('error.unauthorizedToDoThisAction', locale));
    }

    return isFromBO;
  }

  const ticketUser = ticket.get('user');

  if (ticketUser?.id !== user.id) {
    throw new Error(translate('error.unauthorizedToDoThisAction', locale));
  }

  return isFromBO;
};

Parse.Cloud.define(
  'sendTicketMessage',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
    const {
      ticketId, message, attachments, isInternal, locale = DEFAULT_LANGUAGE,
    } = request.params;
    const { user } = request;
    const ticket = await getTicketById(ticketId);
    const isFromBO = await assertCanAccessTicket(ticket, request, ['update'], locale);

    return createTicketMessageService({
      ticket,
      ticketOwner: ticket.get('user'),
      sender: user,
      senderRole: isFromBO ? TicketMessageSenderRoleEnum.AGENT : TicketMessageSenderRoleEnum.CUSTOMER,
      message,
      attachments,
      // a note only exists inside the back office, so the flag is dropped for any other caller
      isInternal: isFromBO && !!isInternal,
    });
  }),
  parseFunctionValidation(sendTicketMessageSchema)
);

type GetTicketMessagesResult = { results: Parse.Object[]; count: number };

Parse.Cloud.define(
  'getTicketMessages',
  parseFunction(async (request: Parse.Cloud.FunctionRequest): Promise<GetTicketMessagesResult> => {
    const {
      ticketId, limit, skip, locale = DEFAULT_LANGUAGE,
    } = request.params;
    const ticket = await getTicketById(ticketId);
    const isFromBO = await assertCanAccessTicket(ticket, request, ['get'], locale);

    return getTicketMessagesService({
      ticketId, limit, skip, includeInternal: isFromBO,
    });
  }),
  parseFunctionValidation(getTicketMessagesSchema)
);

Parse.Cloud.define(
  'updateTicketStatus',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
    const { ticketId, status } = request.params;

    await assertInAgentCountries(collections.Contact, ticketId);

    return updateTicketStatusService(ticketId, status);
  }, ['update'], collections.Contact),
  parseFunctionValidation(updateTicketStatusSchema)
);

Parse.Cloud.define(
  'updateTicketPriority',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
    const { ticketId, priority } = request.params;

    await assertInAgentCountries(collections.Contact, ticketId);

    return updateTicketPriorityService(ticketId, priority);
  }, ['update'], collections.Contact),
  parseFunctionValidation(updateTicketPrioritySchema)
);

Parse.Cloud.define(
  'assignTicket',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object> => {
    const { ticketId, agentId } = request.params;

    await assertInAgentCountries(collections.Contact, ticketId);

    return assignTicketService(ticketId, agentId);
  }, ['update'], collections.Contact),
  parseFunctionValidation(assignTicketSchema)
);
