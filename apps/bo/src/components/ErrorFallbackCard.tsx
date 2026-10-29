import {
  Button, Card, Theme, Typography,
} from '@mui/material';
import { FiHome } from 'react-icons/fi';

import Logo from '@/components/Logo';
import { APP_NAME } from '@/constants/_core/app.constants';
import {
  STATUS_PAGE_ACTION_HEIGHT, STATUS_PAGE_ACTION_HEIGHT_MOBILE, STATUS_PAGE_ACTION_ICON_SIZE,
  STATUS_PAGE_CARD_GAP, STATUS_PAGE_CARD_PADDING_X, STATUS_PAGE_CARD_PADDING_Y, STATUS_PAGE_CARD_WIDTH,
  STATUS_PAGE_CODE_FONT_SIZE, STATUS_PAGE_CODE_FONT_SIZE_MOBILE, STATUS_PAGE_GAP,
  STATUS_PAGE_LOGO_HEIGHT, STATUS_PAGE_PADDING, STATUS_PAGE_PADDING_MOBILE, STATUS_PAGE_PADDING_TABLET,
  STATUS_PAGE_TITLE_FONT_SIZE, STATUS_PAGE_TITLE_FONT_SIZE_MOBILE, STATUS_PAGE_WORD_FONT_SIZE,
  STATUS_PAGE_WORD_FONT_SIZE_MOBILE,
} from '@/constants/_core/ui/page.constants';

const classes = {
  root: (theme: Theme) => ({
    minHeight: '100vh',
    gap: STATUS_PAGE_GAP,
    padding: STATUS_PAGE_PADDING,
    backgroundColor: theme.palette.background.default,
    // from a tablet down the text stands on the paper ground, without a card around it
    [theme.breakpoints.down('lg')]: {
      padding: STATUS_PAGE_PADDING_TABLET,
      backgroundColor: theme.palette.background.paper,
    },
    [theme.breakpoints.down('sm')]: { padding: STATUS_PAGE_PADDING_MOBILE },
  }),
  card: (theme: Theme) => ({
    width: STATUS_PAGE_CARD_WIDTH,
    maxWidth: '100%',
    gap: STATUS_PAGE_CARD_GAP,
    padding: `${STATUS_PAGE_CARD_PADDING_Y}px ${STATUS_PAGE_CARD_PADDING_X}px`,
    textAlign: 'center' as const,
    [theme.breakpoints.down('lg')]: {
      padding: 0,
      border: 0,
      boxShadow: 'none',
      backgroundColor: 'transparent',
    },
    [theme.breakpoints.down('sm')]: { alignSelf: 'stretch', width: 'auto' },
  }),
  code: (theme: Theme, isWord: boolean) => ({
    fontSize: isWord
      ? STATUS_PAGE_WORD_FONT_SIZE
      : STATUS_PAGE_CODE_FONT_SIZE,
    lineHeight: 1,
    fontWeight: 600,
    letterSpacing: '-.02em',
    color: theme.palette.text.disabled,
    [theme.breakpoints.down('sm')]: {
      fontSize: isWord
        ? STATUS_PAGE_WORD_FONT_SIZE_MOBILE
        : STATUS_PAGE_CODE_FONT_SIZE_MOBILE,
    },
  }),
  title: (theme: Theme) => ({
    fontSize: STATUS_PAGE_TITLE_FONT_SIZE,
    lineHeight: 1.35,
    [theme.breakpoints.down('sm')]: { fontSize: STATUS_PAGE_TITLE_FONT_SIZE_MOBILE },
  }),
  action: (theme: Theme) => ({
    height: STATUS_PAGE_ACTION_HEIGHT,
    [theme.breakpoints.down('sm')]: {
      alignSelf: 'stretch',
      height: STATUS_PAGE_ACTION_HEIGHT_MOBILE,
    },
  }),
};

type Props = {
  // the big muted mark over the sentence: a status code ("404") or a word ("Error")
  code: string;
  message: string;
  actionLabel: string;
  onAction: () => void;
  // a word is set smaller than digits so both fill the same width
  isCodeWord?: boolean;
};

/*
 * full-page chrome of the 404 and the crash pages: brand mark, one centred card, copyright line.
 * It may render above the router (ErrorBoundary), so it uses nothing that needs router context.
 */
const ErrorFallbackCard = ({
  code, message, actionLabel, onAction, isCodeWord = false,
}: Props) => {
  return (
    <div className="flexColumn center justifyCenter" css={classes.root}>
      <Logo height={STATUS_PAGE_LOGO_HEIGHT} isLinked={false} />
      <Card className="flexColumn center" css={classes.card}>
        <Typography component="div" css={(theme: Theme) => classes.code(theme, isCodeWord)}>
          {code}
        </Typography>
        <Typography component="h1" css={classes.title} variant="h2">
          {message}
        </Typography>
        <Button
          css={classes.action}
          onClick={onAction}
          startIcon={<FiHome size={STATUS_PAGE_ACTION_ICON_SIZE} />}
          variant="contained"
        >
          {actionLabel}
        </Button>
      </Card>
      <Typography sx={{ color: 'text.disabled' }} variant="caption">
        © {new Date().getFullYear()} {APP_NAME}
      </Typography>
    </div>
  );
};

export default ErrorFallbackCard;
