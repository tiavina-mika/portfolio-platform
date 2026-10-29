import Card from '@mui/material/Card';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { useTranslation } from 'react-i18next';
import { FiChevronRight } from 'react-icons/fi';

import type { Theme } from '@mui/material/styles';

import {
  DASHBOARD_NO_ACCESS_GAP, DASHBOARD_NO_ACCESS_LINK_ICON_SIZE, DASHBOARD_NO_ACCESS_LINK_MIN_HEIGHT,
  DASHBOARD_NO_ACCESS_LINKS_MAX_WIDTH, DASHBOARD_NO_ACCESS_PADDING, DASHBOARD_NO_ACCESS_PADDING_TOP,
  DASHBOARD_NO_ACCESS_TEXT_MAX_WIDTH,
} from '@/constants/_core/ui/chart.constants';
import { IDashboardLink } from '@/types/_core/dashboard.type';

const classes = {
  message: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: `${DASHBOARD_NO_ACCESS_GAP}px`,
    padding: `${DASHBOARD_NO_ACCESS_PADDING_TOP}px ${DASHBOARD_NO_ACCESS_PADDING}px`,
    paddingBottom: `${DASHBOARD_NO_ACCESS_PADDING}px`,
    textAlign: 'center' as const,
  },
  description: {
    color: 'text.secondary',
    maxWidth: DASHBOARD_NO_ACCESS_TEXT_MAX_WIDTH,
    textWrap: 'pretty' as const,
  },
  links: {
    width: '100%',
    maxWidth: DASHBOARD_NO_ACCESS_LINKS_MAX_WIDTH,
    margin: '0 auto',
    padding: `0 ${DASHBOARD_NO_ACCESS_PADDING}px ${DASHBOARD_NO_ACCESS_PADDING}px`,
  },
  link: (theme: Theme) => ({
    gap: theme.spacing(1.5),
    minHeight: DASHBOARD_NO_ACCESS_LINK_MIN_HEIGHT,
    borderTop: `1px solid ${theme.palette.divider}`,
  }),
  chevron: (theme: Theme) => ({ color: theme.palette.text.disabled, flexShrink: 0 }),
};

type Props = {
  // the pages the account may open, in place of the figures it may not read
  links: IDashboardLink[];
};

/**
 * What the dashboard shows when the account's post gives access to none of its data: the reason,
 * and the pages the account can open instead, so the home page is never a dead end.
 */
const DashboardNoAccess = ({ links }: Props) => {
  const { t } = useTranslation();

  return (
    <Card>
      <div css={classes.message}>
        <Typography component="h2" variant="h5">{t('dashboard:noAccess.title')}</Typography>
        <Typography sx={classes.description} variant="body1">
          {t('dashboard:noAccess.description')}
        </Typography>
      </div>
      <List aria-label={t('dashboard:noAccess.linksLabel')} component="nav" css={classes.links}>
        {links.map((link) => (
          <ListItemButton css={classes.link} key={link.id} onClick={link.onClick}>
            <ListItemText primary={link.label} />
            <FiChevronRight
              aria-hidden
              css={classes.chevron}
              size={DASHBOARD_NO_ACCESS_LINK_ICON_SIZE}
            />
          </ListItemButton>
        ))}
      </List>
    </Card>
  );
};

export default DashboardNoAccess;
