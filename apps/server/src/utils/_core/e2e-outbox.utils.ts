import type { E2eOutboxFilter, E2eOutboxMessage } from '@shared/domain-types';

// in memory on purpose: the E2E server is a single process that lives exactly as long as the run
const outbox: E2eOutboxMessage[] = [];

export const recordE2eMessage = (message: Omit<E2eOutboxMessage, 'sentAt'>): void => {
  outbox.push({ ...message, sentAt: new Date().toISOString() });
};

export const findE2eMessages = ({ channel, to }: E2eOutboxFilter = {}): E2eOutboxMessage[] => (
  outbox.filter((message) => (
    (!channel || message.channel === channel) &&
    (!to || message.to.some((recipient) => recipient.includes(to)))
  ))
);
