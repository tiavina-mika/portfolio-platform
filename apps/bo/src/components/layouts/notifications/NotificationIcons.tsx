import { Badge, Tooltip } from '@mui/material';
import { useNavigate } from '@tanstack/react-router';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FiMessageCircle, FiUserPlus } from 'react-icons/fi';
import { useSelector } from 'react-redux';

import { goToList } from '@/redux/actions/util.action';
import { getAppNotificationsSelector } from '@/redux/reducers/app.reducer';
import { COLLECTIONS, NOTIFICATION_COLLECTIONS } from '@/utils/constants';

interface IOption {
  icon: ReactNode;
  color: 'info' | 'error' | 'secondary' | 'primary' | 'success' | 'warning';
  key: typeof NOTIFICATION_COLLECTIONS[number];
  label: string;
  onClick: () => void;
}
const NotificationIcons = () => {
  const { t } = useTranslation(['project', 'route']);
  const navigate = useNavigate();
  const notifications = useSelector(getAppNotificationsSelector);

  const notificationOptions: IOption[] = [
    {
      icon: <FiMessageCircle />,
      color: 'secondary',
      key: COLLECTIONS.contact, // collection name
      label: t('user:contacts.contacts'),
      onClick: () => navigate(goToList('contacts', { tab: t('route:tabs.news') })),
    },
    {
      icon: <FiUserPlus />,
      color: 'secondary',
      key: COLLECTIONS.user, // collection name
      label: t('user:users'),
      onClick: () => navigate(goToList('users', { tab: t('route:tabs.news') })),
    },
  ];

  return (
    <>
      {notificationOptions.map((notification: IOption, index: number) => (
        <Tooltip key={notification.key + index} title={notification.label}>
          <Badge
            badgeContent={notifications[notification.key]}
            color={notification.color as any || 'secondary'}
            css={{ '&:hover': { cursor: 'pointer' } }}
            max={99}
            onClick={notification.onClick}
          >
            {notification.icon}
          </Badge>
        </Tooltip>
      ))}
    </>
  );
};

export default NotificationIcons;
