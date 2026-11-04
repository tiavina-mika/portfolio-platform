/**
 * Teaches the shared notification engine the sentences of the domain (the projects). Called once at
 * start-up by each app; calling it again changes nothing.
 *
 * The portfolio domain raises no notification of its own yet: when it does, register its catalogue
 * here with `registerNotificationMessageCatalogue` and `registerNotificationMessageValues` from
 * `@shared/utils`.
 */
export const registerDomainNotificationMessages = (): void => {
  // nothing to register until a project event is announced to its readers
};
