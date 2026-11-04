import {
  Box, Stack, Typography, type Theme,
} from '@mui/material';
import { Fragment } from 'react';
import { FiCheck } from 'react-icons/fi';

import {
  AUTH_STEP_DOT_SIZE, AUTH_STEP_LINE_HEIGHT, AUTH_STEP_LINE_MIN_WIDTH,
} from '@/constants/_core/ui/ui.constants';

const classes = {
  dot: (isDone: boolean, isCurrent: boolean) => (theme: Theme) => ({
    width: AUTH_STEP_DOT_SIZE,
    height: AUTH_STEP_DOT_SIZE,
    flexShrink: 0,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '50%',
    border: `1px solid ${theme.palette.divider}`,
    fontSize: 12,
    fontWeight: isCurrent ? 600 : 400,
    color: theme.palette.text.secondary,
    ...(isDone && {
      color: theme.palette.success.contrastText,
      backgroundColor: theme.palette.success.main,
      borderColor: theme.palette.success.main,
    }),
    ...(isCurrent && {
      color: theme.palette.primary.contrastText,
      backgroundColor: theme.palette.primary.main,
      borderColor: theme.palette.primary.main,
    }),
  }),
  line: (isDone: boolean) => (theme: Theme) => ({
    flex: 1,
    minWidth: AUTH_STEP_LINE_MIN_WIDTH,
    height: AUTH_STEP_LINE_HEIGHT,
    backgroundColor: isDone ? theme.palette.success.main : theme.palette.divider,
  }),
};

type Props = {
  labels: string[];
  // zero-based index of the step the user is on; the ones before it are drawn as done
  currentIndex: number;
};

/** Numbered strip of a short linear flow; on a phone only the current step keeps its label. */
const AuthSteps = ({ labels, currentIndex }: Props) => {
  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      {labels.map((label, index) => {
        const isDone = index < currentIndex;
        const isCurrent = index === currentIndex;

        return (
          <Fragment key={label}>
            {index > 0 && <Box css={classes.line(isDone || isCurrent)} />}
            <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
              <span aria-current={isCurrent ? 'step' : undefined} css={classes.dot(isDone, isCurrent)}>
                {isDone ? <FiCheck aria-hidden size={14} /> : index + 1}
              </span>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: isCurrent ? 600 : 500,
                  color: isCurrent ? 'text.primary' : 'text.secondary',
                  display: { xs: isCurrent ? 'block' : 'none', sm: 'block' },
                }}
              >
                {label}
              </Typography>
            </Stack>
          </Fragment>
        );
      })}
    </Stack>
  );
};

export default AuthSteps;
