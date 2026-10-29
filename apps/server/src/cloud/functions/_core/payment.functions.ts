import { collections, USE_MASTER_KEY } from '@/constants/_core/constants';
import { scopeCountries } from '@/utils/_core/agent-context.utils';
import { escapeText, isBoolean } from '@/utils/_core/utils';
import {
  getPaymentsSchema, getPaymentSchema, refundPaymentSchema, retryPaymentSchema,
} from '@/validations/_core/payment.validations';

import { alertOwnersOfLargeMoneyAction } from '../../services/_core/ownerAlert.service.cloud';
import { getPaymentLedgerSummary } from '../../services/_core/payment-list.service.cloud';
import { refundPaymentAPI, retryPaymentAPI } from '../../services/_core/payment.service.cloud';
import { buildUserTextQuery, searchUserPointerQuery } from '../../services/_core/user.service.cloud';
import { Payment } from '../../triggers/_core/payment.triggers';
import { assertInAgentCountries } from '../../utils/_core/agent-scope.utils.cloud';
import { convertIdToPointer, filtersDatesQuery } from '../../utils/_core/parse.utils.cloud';
import { fromBO } from '../../utils/_core/utils.cloud';
import { parseFunctionValidation } from '../../utils/_core/validation.utils.cloud';

/*
 * search keys with dedicated handling below — excluded from the generic `matches()` fallback
 * loop so a date range/array/pointer-name field never gets treated as a plain text regex match
 * (which either can't run or silently returns zero rows against a non-string field)
 */
const HANDLED_PAYMENT_SEARCH_KEYS = [
  'user', 'text', 'payer', 'receiver', 'status', 'type', 'service', 'failureReason', 'minAmount',
  'maxAmount', 'countries', 'createdAt', 'updatedAt',
];

/**
 * Own scalar/object fields of Payment — pointer fields (payer, receiver, paidBy, ...) are
 * selected dynamically from whatever is passed to `.include()` below, since the BO list/detail
 * columns are an open registry (see `registerPaymentIncludes` in apps/bo) and hardcoding a fixed
 * pointer list here would silently break any domain-registered include.
 */
const PAYMENT_OWN_FIELDS = [
  'type', 'status', 'amount', 'currency', 'service', 'paymentIntentId', 'snapshot',
  'failureReason', 'failureCode', 'refundReason', 'deleted', 'successAt', 'failedAt',
  'pendingAt',
  'commission', 'commissionRate', 'commissionMultiplier', 'refundedAmount',
  // why an operator sent a payment again, or gave money back by hand
  'manualReason',
  // how many times it was sent again, and when last — who asked comes with the `retriedBy` include
  'retryCount', 'retriedAt',
  // how a payment still waiting for its operator is followed (payment-settlement.service.cloud.ts)
  'providerReference', 'expiresAt', 'checkCount', 'settledBy',
  /*
   * `refundOf` is a pointer, so selecting it brings back the id and nothing else — which is all a
   * refund row needs to name the collection it gives back
   */
  'refundOf',
];

const getPaymentSelectFields = (includeFields: string[]): string[] => {
  const topLevelIncludeFields = includeFields.map(path => path.split('.')[0] || path);

  return [...new Set([...PAYMENT_OWN_FIELDS, ...topLevelIncludeFields])];
};

/**
 * Every movement of money one account was on either side of — the back-office links here from that
 * account's own page. A payment has no single "user" field: the two sides are `payer` and
 * `receiver`, so the scope is an `or` over the pair rather than an equality on one field.
 * @param userId the account the ledger is narrowed to
 * @returns a query matching the payments it paid and the ones it was paid
 */
const buildPaymentUserScopeQuery = (userId: string): Parse.Query => {
  const userPointer = convertIdToPointer(collections.User, userId);

  return Parse.Query.or(
    new Parse.Query(Payment).equalTo('payer', userPointer),
    new Parse.Query(Payment).equalTo('receiver', userPointer)
  );
};

Parse.Cloud.define(
  'getPayments',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<any> => {
    const {
      limit,
      skip,
      orderBy,
      order,
      filters,
      search,
      include = [],
    } = request.params;

    /*
     * the account scope stands as the query the rest is narrowed from, rather than as a constraint
     * added to it further down: it is an `or`, and a query carries only one — so it has to be there
     * before the text search below builds its own
     */
    const userScopeQuery = filters?.user
      ? buildPaymentUserScopeQuery(filters.user)
      : undefined;

    let query = userScopeQuery ?? new Parse.Query(Payment);

    if (search) {
      /*
       * full text search
       * should be before all other queries
       */
      if (search?.text) {
        // read off the members themselves: the snapshot copy keeps a first and a last name, no `name`
        const usersQuery = buildUserTextQuery(search.text);
        const textQuery = Parse.Query.or(
          new Parse.Query(Payment).matchesQuery('payer', usersQuery),
          new Parse.Query(Payment).matchesQuery('receiver', usersQuery)
        );

        /*
         * the two `or`s are joined rather than one replacing the other — the account scope must
         * survive a search typed on top of it. Joined only when both exist: `and` is built from the
         * raw clauses of what it is given, and an unconstrained query would put an empty one in it.
         */
        query = userScopeQuery
          ? Parse.Query.and(userScopeQuery, textQuery)
          : textQuery;
      }


      Object.keys(search).forEach((key: string) => {
        if (search[key] && !HANDLED_PAYMENT_SEARCH_KEYS.includes(key)) {
          query.matches(key, escapeText(search[key]));
        }
      });

      if (search.payer) {
        searchUserPointerQuery(query, search.payer, 'payer');
      }
      if (search.receiver) {
        searchUserPointerQuery(query, search.receiver, 'receiver');
      }
      if (search.status) {
        query.containedIn('status', search.status);
      }
      if (search.type) {
        query.containedIn('type', search.type);
      }
      if (search.service) {
        query.containedIn('service', search.service);
      }
      /*
       * an exact match, not a regex: the reasons come from `getPaymentLedgerSummary`, which reads
       * back the messages the gateway actually produced, so the filter is picked from a list
       * rather than typed — matching a substring of one of them would silently widen it
       */
      if (search.failureReason) {
        query.equalTo('failureReason', search.failureReason);
      }
      if (search.minAmount) {
        query.greaterThanOrEqualTo('amount', +search.minAmount);
      }
      if (search.maxAmount) {
        query.lessThanOrEqualTo('amount', +search.maxAmount);
      }

      // query dates
      filtersDatesQuery(query, search);
    }

    // the countries the agent's roles cover, whether or not a filter asks for any
    const countries = scopeCountries(search?.countries);

    if (countries) query.containedIn('country', countries);

    const includeFields = ['payer', 'receiver', 'paidBy', ...include];

    query.select(getPaymentSelectFields(includeFields))
      .limit(+limit)
      .skip(+skip)
      .equalTo('deleted', false)
      .include(includeFields);

    if (filters) {
      // override the deleted query below
      if (isBoolean(filters?.deleted)) {
        query.equalTo('deleted', filters.deleted);
      }
      if (filters?.status) {
        query.equalTo('status', filters.status);
      }
      if (filters?.type) {
        query.equalTo('type', filters.type);
      }
    }

    if (order === 'desc') {
      query.descending(orderBy);
    }
    else {
      query.ascending(orderBy);
    }

    const result: Record<string, any> = await query.withCount().find(USE_MASTER_KEY);

    return result;
  }, ['find'], collections.Payment),
  parseFunctionValidation(getPaymentsSchema)
);

/**
 * What the payments list states above its rows: the ledger totals, the status and direction
 * breakdowns, per-operator health, and the failure reasons the filter offers. Kept apart from
 * `getPayments` so the figures describe the whole ledger rather than the page the operator has
 * currently filtered down to.
 */
Parse.Cloud.define(
  'getPaymentLedgerSummary',
  fromBO(
    async (request: Parse.Cloud.FunctionRequest) => getPaymentLedgerSummary(request.params.country),
    ['find'],
    collections.Payment
  )
);

Parse.Cloud.define(
  'getPayment',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Parse.Object | false> => {
    const { id, include = [] } = request.params;

    await assertInAgentCountries(collections.Payment, id);
    const includeFields = ['receiver', 'payer', ...include];
    const payment = await new Parse.Query(Payment)
      .equalTo('objectId', id)
      .select(getPaymentSelectFields(includeFields))
      .include(includeFields)
      .first(USE_MASTER_KEY);

    // false instead of undefined or null to avoid client serialization issues (the client return "ok" even if the page is not found)
    if (!payment) return false;

    return payment;
  }, ['get'], collections.Payment),
  parseFunctionValidation(getPaymentSchema)
);

/**
 * BO-only: retry any FAILED payment (any type/direction) — operator-triggered, no ownership check.
 * It sends real money, so it needs the update right on Payment: the same one a refund needs. Being
 * a back-office user at all used to be enough, which let a read-only support role move money.
 */
Parse.Cloud.define(
  'retryPayment',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Record<string, any>> => {
    const { id, reason } = request.params;

    await assertInAgentCountries(collections.Payment, id);

    return retryPaymentAPI(id, request.user, reason);
  }, ['update'], collections.Payment),
  parseFunctionValidation(retryPaymentSchema)
);

/**
 * BO-only: give a settled passenger collection back — all of it, or the part of it named by
 * `amount` — as a new payment out of the merchant account towards the account it was taken from.
 * It moves real money and cannot be undone, so the caller needs the update right on Payment: the
 * same one a retry needs.
 */
Parse.Cloud.define(
  'refundPayment',
  fromBO(async (request: Parse.Cloud.FunctionRequest): Promise<Record<string, any>> => {
    const { id, amount, reason } = request.params;

    await assertInAgentCountries(collections.Payment, id);

    const result = await refundPaymentAPI(id, amount, reason);

    // a refund the operator refused moved no money: only one sent, or still on its way, is reported
    if (result.success || result.isPending) {
      await alertOwnersOfLargeMoneyAction('refund', request.user!, {
        amount: result.payment?.get('amount'),
        currency: result.payment?.get('currency'),
        reference: id,
      });
    }

    return result;
  }, ['update'], collections.Payment),
  parseFunctionValidation(refundPaymentSchema)
);
