import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  FiAlertTriangle, FiCopy, FiMail, FiRefreshCw,
} from 'react-icons/fi';

import ActionsMenu from '@/components/ActionsMenu';
import Dialog from '@/components/Dialog';
import { MENU_ITEM_ICON_SIZE } from '@/constants/_core/ui/ui.constants';
import { IMenu } from '@/types/_core/app.type';
import { INotification } from '@/types/_core/notification.type';
import {
  getNotificationChannelCountsTotal, getNotificationMessage, getNotificationResendableChannels,
  getNotificationRetryableFailedCounts, getNotificationUnreadRecipientIds,
} from '@/utils/_core/notification.utils';

type Props = {
  notification: INotification;
  /** Opens the row's own panel — the message, the recipients and what the send is about. */
  onPreview?: () => void;
  /** Pushes the alert again to every recipient. */
  onResend?: () => void;
  /** Pushes the alert again only to the recipients who have not opened it. */
  onResendUnread?: () => void;
  /** Sends the send again to the recipients a provider refused, on every rebuildable channel. */
  onResendFailed?: () => void;
  onDelete?: () => void;
  /** Takes a binned send back out of the recycle bin — only the recycle-bin tab passes it. */
  onRestore?: () => void;
  /** Destroys a binned send for good, with its resend history — only the recycle-bin tab passes it. */
  onDestroy?: () => void;
  /** Back to the list, when the actions stand on the send's own page rather than on its row. */
  goToList?: () => void;
  /** Where the actions stand: on a list row, or in the header of the send's page. */
  type?: 'row' | 'preview';
};

/**
 * What can be done to one send, from its list row or from the header of its own page.
 *
 * The resends are separate actions rather than one with a scope, because they answer different
 * questions: "this person says they never got it" is the whole send again, "half the coach has not
 * seen the cancellation" is a reminder to the half that has not, and "the SMS provider was down" is
 * the refusals alone — and sending the first when another was meant re-alerts everyone it reached.
 */
const NotificationRowActions = ({
  notification, onPreview, onResend, onResendUnread, onResendFailed, onDelete, onRestore, onDestroy,
  goToList, type = 'row',
}: Props) => {
  const { t } = useTranslation(['common', 'user']);
  const [isConfirmingResend, setIsConfirmingResend] = useState(false);

  const recipientsCount = notification.toCount ?? notification.to?.length ?? 0;
  const unreadCount = getNotificationUnreadRecipientIds(notification).length;
  const failedCount = getNotificationChannelCountsTotal(
    getNotificationRetryableFailedCounts(notification, getNotificationResendableChannels(notification))
  );

  /*
   * the whole send again re-alerts every recipient, the ones it already reached included: on a
   * fan-out that is a whole coach pinged twice, so it is confirmed first, stating how many. A send
   * to one person goes straight out — there is nobody else to disturb by mistake.
   */
  const handleResend = () => {
    if (recipientsCount > 1) {
      setIsConfirmingResend(true);
      return;
    }

    onResend?.();
  };

  const handleCloseResendConfirmation = () => setIsConfirmingResend(false);

  const handleConfirmResend = () => {
    setIsConfirmingResend(false);
    onResend?.();
  };

  const menus: IMenu[] = [
    {
      label: t('user:notifications.resendPush'),
      icon: <FiRefreshCw size={MENU_ITEM_ICON_SIZE} />,
      onClick: handleResend,
      display: !!onResend,
    },
    {
      label: t('user:notifications.resendUnreadWithCount', { count: unreadCount }),
      icon: <FiMail size={MENU_ITEM_ICON_SIZE} />,
      onClick: () => onResendUnread?.(),
      // nothing to remind anyone of once everyone has opened it
      display: !!onResendUnread && unreadCount > 0,
    },
    {
      label: t('user:notifications.resendFailuresWithCount', { count: failedCount }),
      icon: <FiAlertTriangle size={MENU_ITEM_ICON_SIZE} />,
      onClick: () => onResendFailed?.(),
      // only what a provider refused, on a channel the send can be rebuilt on
      display: !!onResendFailed && failedCount > 0,
    },
    {
      label: t('user:notifications.copyPayload'),
      icon: <FiCopy size={MENU_ITEM_ICON_SIZE} />,
      onClick: () => {
        void navigator.clipboard?.writeText(JSON.stringify(notification.payload ?? {}, null, 2));
      },
      display: !!notification.payload,
    },
  ];

  return (
    <>
      <ActionsMenu
        goToList={goToList}
        label={getNotificationMessage(notification)}
        menus={menus}
        onDelete={onDelete}
        onDestroy={onDestroy}
        onPreview={onPreview}
        onRestore={onRestore}
        type={type}
        /*
         * binning a send can be reversed and says so; destroying it cannot, and the resend history goes
         * with it — the two must not share the same confirmation wording
         */
        dialogDescription={onDestroy
          ? t('infoMessages.onDestructionMessage')
          : t('sureToDelete', { value: getNotificationMessage(notification) })}
      />
      <Dialog
        description={t('user:notifications.confirmResendAllDescription', { count: recipientsCount })}
        onPrimaryButtonAction={handleConfirmResend}
        open={isConfirmingResend}
        primaryButtonText={t('user:notifications.resendPush')}
        title={t('user:notifications.confirmResendAllTitle')}
        toggle={handleCloseResendConfirmation}
      />
    </>
  );
};

export default NotificationRowActions;
