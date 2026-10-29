import {
  Card, CardContent, Typography, Stack,
  type Theme,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import { useNavigate } from '@tanstack/react-router';
import { type ReactNode, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { FaLockOpen } from 'react-icons/fa';
import {
  FiExternalLink,
  FiFileText, FiLayers, FiLayout, FiMessageCircle, FiPackage, FiPlusCircle, FiUsers,
} from 'react-icons/fi';
import { useSelector } from 'react-redux';

import { goToAddArticle } from '@/redux/actions/article.action';
import { goToAddPage } from '@/redux/actions/page.action';
import { goToAddProject } from '@/redux/actions/project.action';
import { goToList } from '@/redux/actions/util.action';
import { getRoleCurrentUserRolesSelector } from '@/redux/reducers/role.reducer';
import { COLLECTIONS } from '@/utils/constants';
import { canAccessTo } from '@/utils/role.utils';


const ICON_SIZE = 24;

type Option = {
  onClick: () => void;
  icon: ReactNode;
  label: string;
  show: boolean;
  type?: 'list' | 'add';
};

const classes = {
  home: {
    // minHeight: '100vh',
    position: 'relative' as const,
  },
  content: (theme: Theme) => ({
    display: 'flex',
    justifyContent: 'center',
    gap: 24,
    flexWrap: 'wrap' as const,
    [theme.breakpoints.up('lg')]: {
      width: '60%',
    },
    [theme.breakpoints.up('xl')]: {
      width: '50%',
    },
  }),
  card: (theme: Theme) => ({
    cursor: 'pointer',
    borderRadius: theme.shape.borderRadius,
    width: 160,
    height: 120,
    transition: theme.transitions.create(['background-color'], {
      duration: theme.transitions.duration.shortest,
    }),
    '&:hover': {
      backgroundColor: theme.palette.primary.light,
    },
  }),
};
const Home = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const roles = useSelector(getRoleCurrentUserRolesSelector);

  const options: Option[] = useMemo(() => {
    return [
      {
        label: t('cms:article'),
        icon: <FiFileText size={ICON_SIZE} />,
        onClick: () => navigate(goToAddArticle()),
        show: canAccessTo(roles, COLLECTIONS.article, 'create'),
        type: 'add',
      },
      {
        label: t('cms:page'),
        icon: <FiLayout size={ICON_SIZE} />,
        onClick: () => navigate(goToAddPage()),
        show: canAccessTo(roles, COLLECTIONS.page, 'create'),
        type: 'add',
      },
      {
        label: t('cms:category.categories'),
        icon: <FiLayers size={ICON_SIZE} />,
        onClick: () => navigate(goToList('categories')),
        show: canAccessTo(roles, COLLECTIONS.category, 'find'),
        type: 'list',
      },
      {
        label: t('user:users'),
        icon: <FiUsers size={ICON_SIZE} />,
        onClick: () => navigate(goToList('users')),
        show: canAccessTo(roles, COLLECTIONS.user, 'find'),
        type: 'list',
      },
      {
        label: t('user:contacts.contacts'),
        icon: <FiMessageCircle size={ICON_SIZE} />,
        onClick: () => navigate(goToList('contacts')),
        show: canAccessTo(roles, COLLECTIONS.contact, 'find'),
        type: 'list',
      },
      {
        label: t('common:project.project'),
        icon: <FiPackage size={ICON_SIZE} />,
        onClick: () => navigate(goToAddProject()),
        show: canAccessTo(roles, COLLECTIONS.project, 'create'),
        type: 'add',
      },
      {
        label: t('user:role.rights'),
        onClick: () => navigate(goToList('roles')),
        icon: <FaLockOpen size={ICON_SIZE} />,
        show: canAccessTo(roles, COLLECTIONS.role, 'find'),
        type: 'list',
      },
    ];
  }, [roles, t, navigate]);

  return (
    <div className="flexColumn center flex1 stretchSelf" css={classes.home}>
      <div css={classes.content}>
        {/* map options using mui card */}
        {options.map((option, index) => {
          if (!option.show) return null;
          return (
            <Card
              key={index}
              className="flexColumn center justifyCenter"
              css={classes.card}
              onClick={option.onClick}
            >
              <CardContent>
                <Stack alignItems="center" spacing={1.8}>
                  {option.icon}
                  <Stack
                    alignItems="center"
                    direction="row"
                    justifyContent="center"
                    spacing={0.5}
                  >
                    {option.type === 'list'
                      ? <FiExternalLink color={grey[800]} size={14} />
                      : <FiPlusCircle color={grey[800]} size={14} />}
                    <Typography css={{ lineHeight: 1 }} variant="h6">{option.label}</Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Home;
