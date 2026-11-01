import { TicketSubjectEnum, TicketSubjectGroupEnum } from '@shared/types';

/**
 * The subjects of the app's subject picker, under their heading, in display order. Shared so the
 * server accepts exactly the subjects the app offers.
 */
export const TICKET_SUBJECT_GROUPS = [
  {
    group: TicketSubjectGroupEnum.TRUST,
    subjects: [TicketSubjectEnum.SAFETY, TicketSubjectEnum.VERIFICATION],
  },
  {
    group: TicketSubjectGroupEnum.ACCOUNT_AND_APP,
    subjects: [TicketSubjectEnum.ACCOUNT, TicketSubjectEnum.TECH, TicketSubjectEnum.OTHER],
  },
] as const;

