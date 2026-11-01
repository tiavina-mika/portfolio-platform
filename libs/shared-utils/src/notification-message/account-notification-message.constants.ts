import {
  ACCOUNT_BANNED_STATUS, ACCOUNT_UNBANNED_STATUS, NEW_DEVICE_LOGIN_STATUS,
  PASSWORD_RESET_DELAYED_STATUS, SUPPORT_SESSION_ENDED_STATUS, SUSPENSION_LIFTED_STATUS,
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
