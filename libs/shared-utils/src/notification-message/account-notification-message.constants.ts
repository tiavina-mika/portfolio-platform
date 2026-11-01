import {
  ACCOUNT_BANNED_STATUS, ACCOUNT_SUSPENDED_STATUS, ACCOUNT_UNBANNED_STATUS, NEW_DEVICE_LOGIN_STATUS,
  PASSWORD_RESET_DELAYED_STATUS, SUPPORT_SESSION_ENDED_STATUS, SUSPENSION_LIFTED_STATUS,
  TICKET_NEW_REPLY_FROM_AGENT_STATUS, TICKET_RESOLVED_STATUS,
} from '@shared/constants';

import type { NotificationMessageEntry } from './notification-message.type';

/**
 * Sanctions and security alerts, recognised by their status whatever type the row carries.
 *
 * They are looked up before the type's own catalogue, the way the app registers their resolver
 * first, so a sanction is never read as an event of the domain it happened to be filed under.
 */
export const ACCOUNT_NOTIFICATION_MESSAGES: Record<string, NotificationMessageEntry> = {
  [SUSPENSION_LIFTED_STATUS]: {
    push: {
      fr: 'Votre suspension est levée : vous pouvez de nouveau utiliser votre compte normalement.',
      en: 'Your suspension has been lifted: you can use your account normally again.',
      mg: 'Nesorina ny fampiatoana anao: afaka mampiasa ny kaontinao indray ianao.',
    },
    app: {
      fr: 'Votre suspension a été levée, vous pouvez à nouveau utiliser l\'application normalement',
      en: 'Your suspension has been lifted, you can use the app normally again',
      mg: 'Voafoana ny sazinao, afaka mampiasa ny application indray ianao',
    },
  },
  [ACCOUNT_SUSPENDED_STATUS]: {
    push: {
      fr: 'Votre compte est temporairement suspendu suite à des signalements. Ouvrez l\'application ' +
        'pour le détail.',
      en: 'Your account is temporarily suspended following reports. Open the app for the details.',
      mg: 'Naato vetivety ny kaontinao noho ny fitarainana. Sokafy ny application raha hijery ny ' +
        'antsipiriany.',
    },
    app: {
      fr: 'Votre compte est suspendu à titre préventif, le temps que notre équipe examine un signalement.',
      en: 'Your account is suspended as a precaution while our team reviews a report.',
      mg: 'Ampiatoana vonjimaika ny kaontinao mandritra ny fandinihan\'ny ekipanay tatitra iray.',
    },
  },
  [`${ACCOUNT_SUSPENDED_STATUS}#until`]: {
    push: {
      fr: 'Votre compte est temporairement suspendu suite à des signalements. Ouvrez l\'application ' +
        'pour le détail.',
      en: 'Your account is temporarily suspended following reports. Open the app for the details.',
      mg: 'Naato vetivety ny kaontinao noho ny fitarainana. Sokafy ny application raha hijery ny ' +
        'antsipiriany.',
    },
    app: {
      fr: 'Votre compte est suspendu à titre préventif jusqu\'au {{date}}, le temps que notre ' +
        'équipe examine un signalement.',
      en: 'Your account is suspended as a precaution until {{date}} while our team reviews a report.',
      mg: 'Ampiatoana vonjimaika hatramin\'ny {{date}} ny kaontinao mandritra ny fandinihan\'ny ' +
        'ekipanay tatitra iray.',
    },
  },
  [ACCOUNT_BANNED_STATUS]: {
    push: {
      fr: 'Votre compte a été suspendu. Consultez l\'e-mail que nous vous avons envoyé pour en ' +
        'connaître la raison.',
      en: 'Your account has been suspended. Check the e-mail we sent you to learn why.',
      mg: 'Naato ny kaontinao. Jereo ny mailaka nalefanay aminao hahafantaranao ny antony.',
    },
    app: {
      fr: 'Votre compte a été suspendu',
      en: 'Your account has been banned',
      mg: 'Voarara ny kaontinao',
    },
  },
  [ACCOUNT_UNBANNED_STATUS]: {
    push: {
      fr: 'Votre compte est réactivé. Bon retour sur Portfolio !',
      en: 'Your account has been reactivated. Welcome back to Portfolio!',
      mg: 'Navelona indray ny kaontinao. Tongasoa indray eto amin\'ny Portfolio!',
    },
    app: {
      fr: 'Votre compte a été réactivé. Vous pouvez à nouveau utiliser l\'application.',
      en: 'Your account has been reactivated. You can use the app again.',
      mg: 'Voavelona indray ny kaontinao. Afaka mampiasa ny application indray ianao.',
    },
  },
  [NEW_DEVICE_LOGIN_STATUS]: {
    push: {
      fr: 'Nouvelle connexion détectée sur votre compte. Si ce n\'est pas vous, changez votre mot ' +
        'de passe immédiatement.',
      en: 'New login detected on your account. If this wasn\'t you, change your password immediately.',
      mg: 'Fidirana vaovao voafantina tamin\'ny kaontinao. Raha tsy ianao no nanao izany, ovay avy ' +
        'hatrany ny tenimiafinao.',
    },
    app: {
      fr: 'Nouvelle connexion détectée sur votre compte. Si ce n\'est pas vous, changez votre mot de passe.',
      en: 'New login detected on your account. If this wasn\'t you, change your password.',
      mg: 'Fidirana vaovao voafantina tamin\'ny kaontinao. Raha tsy ianao no nanao izany, ovay ny ' +
        'tenimiafinao.',
    },
  },
  /* the device is what lets the member recognise the sign-in — it is named wherever it is known */
  [`${NEW_DEVICE_LOGIN_STATUS}#withDevice`]: {
    push: {
      fr: 'Nouvelle connexion à votre compte depuis {{device}}. Si ce n\'est pas vous, changez ' +
        'votre mot de passe.',
      en: 'New sign-in to your account from {{device}}. If it wasn\'t you, change your password.',
      mg: 'Fidirana vaovao tamin\'ny kaontinao avy amin\'ny {{device}}. Raha tsy ianao no nanao ' +
        'izany, ovay ny tenimiafinao.',
    },
    app: {
      fr: 'Nouvelle connexion à votre compte depuis {{device}}. Si ce n\'est pas vous, changez ' +
        'votre mot de passe.',
      en: 'New sign-in to your account from {{device}}. If it wasn\'t you, change your password.',
      mg: 'Fidirana vaovao tamin\'ny kaontinao avy amin\'ny {{device}}. Raha tsy ianao no nanao ' +
        'izany, ovay ny tenimiafinao.',
    },
  },
  /*
   * the date is left to the app: a lock screen shows a short warning, the details are one tap away —
   * where the member can cancel the change with "it wasn't me", or sign in, which cancels it too
   */
  [PASSWORD_RESET_DELAYED_STATUS]: {
    push: {
      fr: 'Un changement de mot de passe a été demandé sur votre compte. Si ce n\'est pas vous, ' +
        'ouvrez l\'application pour l\'annuler.',
      en: 'A password change was requested on your account. If it wasn\'t you, open the app to ' +
        'cancel it.',
      mg: 'Nisy nangataka ny hanova ny tenimiafina amin\'ny kaontinao. Raha tsy ianao no nanao ' +
        'izany, sokafy ny application mba hanafoana azy.',
    },
    app: {
      fr: 'Un changement de mot de passe a été demandé sur votre compte, après une longue période ' +
        'sans connexion. Si ce n\'est pas vous, touchez ici pour l\'annuler.',
      en: 'A password change was requested on your account after a long period without sign-in. ' +
        'If it wasn\'t you, tap here to cancel it.',
      mg: 'Nisy nangataka ny hanova ny tenimiafina amin\'ny kaontinao taorian\'ny fotoana ela ' +
        'tsy nidirana. Raha tsy ianao no nanao izany, tsindrio eto mba hanafoana azy.',
    },
  },
  [SUPPORT_SESSION_ENDED_STATUS]: {
    push: {
      fr: 'Notre équipe support a consulté votre compte pour traiter votre demande. Si vous n\'avez ' +
        'contacté personne, écrivez-nous.',
      en: 'Our support team accessed your account to handle your request. If you contacted no one, ' +
        'get in touch with us.',
      mg: 'Nijery ny kaontinao ny ekipan\'ny support mba hikarakara ny fangatahanao. Raha tsy ' +
        'nifandray taminay ianao, mifandraisa aminay.',
    },
    app: {
      fr: 'Notre équipe support a consulté votre compte pour traiter votre demande. Si vous n\'avez ' +
        'contacté personne, écrivez-nous.',
      en: 'Our support team accessed your account to handle your request. If you contacted no one, ' +
        'get in touch with us.',
      mg: 'Nijery ny kaontinao ny ekipan\'ny support mba hikarakara ny fangatahanao. Raha tsy ' +
        'nifandray taminay ianao, mifandraisa aminay.',
    },
  },
};

/**
 * Support tickets — the team's answer to something the member sent. A row with no status at all is
 * an agent's answer — the only one there was.
 */
export const TICKET_NOTIFICATION_MESSAGES: Record<string, NotificationMessageEntry> = {
  [TICKET_RESOLVED_STATUS]: {
    push: {
      fr: 'Votre demande de support a été traitée. Vous pouvez la rouvrir en répondant si besoin',
      en: 'Your support request has been resolved. You can reopen it by replying if needed',
      mg: 'Voavaha ny fangatahana fanampiana nataonao. Azonao sokafana indray amin\'ny famaliana raha ilaina',
    },
    app: {
      fr: 'Votre demande au support est résolue.',
      en: 'Your support request has been resolved.',
      mg: 'Voavaha ny fangatahanao tany amin\'ny support.',
    },
  },
  [TICKET_NEW_REPLY_FROM_AGENT_STATUS]: {
    push: {
      fr: 'Vous avez reçu une nouvelle réponse à votre demande de support',
      en: 'You have received a new reply to your support request',
      mg: 'Nahazo valiny vaovao ho an\'ny fangatahana fanampiana nataonao ianao',
    },
    app: {
      fr: 'Le support a répondu à votre demande.',
      en: 'Support replied to your request.',
      mg: 'Namaly ny fangatahanao ny support.',
    },
  },
};
