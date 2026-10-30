import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';

import Items from '@/components/Items';
import { FONT_FAMILY_MONO } from '@/constants/_core/ui/ui.constants';
import NotificationSenderCell from '@/containers/_core/notification/NotificationSenderCell';
import NotificationStatusChip from '@/containers/_core/notification/NotificationStatusChip';
import { ISelectOption } from '@/types/_core/app.type';
import { INotification } from '@/types/_core/notification.type';
import { displayDate } from '@/utils/_core/date.utils';
import { getNotificationMessage, getNotificationReadRatioLabel } from '@/utils/_core/notification.utils';
import { getNotificationTypeLabelByValue } from '@/utils/_core/user.utils';

const classes = {
  code: {
    fontFamily: FONT_FAMILY_MONO,
  },
};

type Props = {
  notification: INotification;
};

/**
 * What a send is, in the order a support ticket quotes it: the reference, what it was about, the
 * state it announced, the words the recipient read, and who raised it.
 */
const NotificationInfos = ({ notification }: Props) => {
  const { t } = useTranslation(['common', 'user']);

  const items: ISelectOption<ReactNode>[] = [
    {
      label: t('user:notifications.id'),
      value: <Box component="code" css={classes.code}>{notification.id}</Box>,
    },
    {
      label: t('user:notifications.type'),
      value: <Chip color="primary" label={getNotificationTypeLabelByValue(notification.type)} size="small" />,
    },
    {
      label: t('user:notifications.status'),
      value: <NotificationStatusChip notification={notification} />,
    },
    {
      label: t('common:message'),
      value: getNotificationMessage(notification) || t('user:notifications.noMessage'),
    },
    {
      label: t('user:notifications.from'),
      value: <NotificationSenderCell notification={notification} />,
    },
    {
      label: t('user:notifications.sentAt'),
      value: displayDate(notification.createdAt, true),
    },
    {
      label: t('user:notifications.readRate'),
      value: getNotificationReadRatioLabel(notification),
    },
  ];

  return <Items items={items} />;
};

export default NotificationInfos;
