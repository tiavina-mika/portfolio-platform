import {
  Card, CardContent, CardHeader, Stack, type Theme,
} from '@mui/material';
import { type ReactNode } from 'react';

const classes = {
  cardHeader: (hasTitle: boolean, hasDescription: boolean) => (theme: Theme) => ({
    paddingTop: hasDescription
      ? 8
      : 18,
    paddingBottom: hasDescription
      ? 8
      : 18,
    borderBottom: hasTitle || hasDescription
      ? '1px solid #e0e0e0'
      : 'none',
    '& .MuiCardHeader-action': {
      alignSelf: 'stretch',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    '& .MuiCardHeader-title': {
      fontSize: 16,
      fontWeight: 500,
    },
    '& .MuiCardHeader-subheader': { fontSize: 14 },
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  }),
  cardContent: (theme: Theme) => ({
    padding: 24,
    [theme.breakpoints.down('sm')]: {
      paddingLeft: 0,
      paddingRight: 0,
    },
  }),
};

type Props = {
  children?: ReactNode;
  title?: string;
  description?: string;
  className?: string;
  rootClassName?: string;
  rightHeader?: ReactNode;
};
const CardFormBlock = ({
  title, description, children, className, rootClassName, rightHeader,
}: Props) => {
  return (
    <Card className={rootClassName} css={{ overflow: 'initial' }}>
      <CardHeader
        action={rightHeader}
        css={classes.cardHeader(!!title, !!description)}
        subheader={description}
        title={title}
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
