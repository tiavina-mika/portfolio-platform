import { Box, Typography, type Theme } from '@mui/material';
import { useTranslation } from 'react-i18next';

import CardFormBlock from '@/components/form/CardFormBlock';
import { MegaphoneIcon } from '@/components/icons/SidebarIcons';
import {
  BROADCAST_PREVIEW_BODY_GAP, BROADCAST_PREVIEW_GAP, BROADCAST_PREVIEW_ICON_SIZE,
  BROADCAST_PREVIEW_ICON_SLOT_SIZE, BROADCAST_PREVIEW_PADDING,
} from '@/constants/_core/ui/broadcast.constants';
import { RADIUS, RADIUS_LG } from '@/constants/_core/ui/ui.constants';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';

const classes = {
  preview: (theme: Theme) => ({
    display: 'flex',
    gap: `${BROADCAST_PREVIEW_GAP}px`,
    padding: `${BROADCAST_PREVIEW_PADDING}px`,
    backgroundColor: getDesignTokens(theme).surfaceSecondary,
    border: `1px solid ${getDesignTokens(theme).border}`,
    borderRadius: `${RADIUS_LG}px`,
  }),
  icon: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 'none',
    width: BROADCAST_PREVIEW_ICON_SLOT_SIZE,
    height: BROADCAST_PREVIEW_ICON_SLOT_SIZE,
    borderRadius: `${RADIUS}px`,
    backgroundColor: getTintedBackground(theme, theme.palette.primary.main),
    color: theme.palette.primary.main,
  }),
  text: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: `${BROADCAST_PREVIEW_BODY_GAP}px`,
    // a long word in a message must wrap inside the card, not widen it
    minWidth: 0,
    overflowWrap: 'anywhere' as const,
  },
  body: { whiteSpace: 'pre-wrap' as const },
};

type Props = {
  title: string;
  body: string;
};

/**
 * The announcement as it will read, in the language the operator has open. An empty field shows the
 * name of the field instead, so the card is never a blank slab and says what is still to write.
 */
const BroadcastPreview = ({ title, body }: Props) => {
  const { t } = useTranslation(['user']);

  return (
    <CardFormBlock title={t('user:notifications.broadcast.preview')}>
      <Box css={classes.preview}>
        <Box css={classes.icon}>
          <MegaphoneIcon size={BROADCAST_PREVIEW_ICON_SIZE} />
        </Box>
        <Box css={classes.text}>
          <Typography variant="subtitle2">
            {title || t('user:notifications.broadcast.messageTitle')}
          </Typography>
          <Typography color="text.secondary" css={classes.body} variant="body2">
            {body || t('user:notifications.broadcast.messageBody')}
          </Typography>
        </Box>
      </Box>
    </CardFormBlock>
  );
};

export default BroadcastPreview;
