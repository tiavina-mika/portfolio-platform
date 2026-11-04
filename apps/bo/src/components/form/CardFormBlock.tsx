import {
  Box, Card, CardContent, CardHeader, Stack, Theme,
} from '@mui/material';
import { ReactNode } from 'react';

import { CARD_ICON_GLYPH_SIZE, CARD_ICON_SLOT_SIZE } from '@/constants/_core/ui/page.constants';
import { RADIUS } from '@/constants/_core/ui/ui.constants';
import { getTintedBackground } from '@/utils/_core/theme/tokens.utils';

const classes = {
  card: { overflow: 'initial' },
  // typography and padding come from the theme's MuiCardHeader override — only structure lives here
  cardHeader: (hasTitle: boolean, hasDescription: boolean) => (theme: Theme) => ({
    ...(!hasTitle && !hasDescription && { borderBottom: 'none' }),
    '& .MuiCardHeader-action': {
      alignSelf: 'stretch',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  }),
  cardContent: (theme: Theme) => ({
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  }),
  icon: (theme: Theme) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: CARD_ICON_SLOT_SIZE,
    height: CARD_ICON_SLOT_SIZE,
    borderRadius: `${RADIUS}px`,
    bgcolor: getTintedBackground(theme, theme.palette.primary.main),
    color: 'primary.main',
    fontSize: CARD_ICON_GLYPH_SIZE,
  }),
};

type Props = {
  children?: ReactNode;
  title?: ReactNode;
  description?: string;
  icon?: ReactNode;
  className?: string;
  rootClassName?: string;
  rightHeader?: ReactNode;
};
const CardFormBlock = ({
  title, description, icon, children, className, rootClassName, rightHeader,
}: Props) => {
  return (
    <Card className={rootClassName} css={classes.card}>
      <CardHeader
        action={rightHeader}
        css={classes.cardHeader(!!title, !!description)}
        subheader={description}
        title={title}
        avatar={icon
          ? <Box sx={classes.icon}>{icon}</Box>
          : undefined}
      />
      {children && (
        <CardContent className={className} css={classes.cardContent}>
          <Stack spacing={2}>
            {children}
          </Stack>
        </CardContent>
      )}
    </Card>
  );
};

export default CardFormBlock;
