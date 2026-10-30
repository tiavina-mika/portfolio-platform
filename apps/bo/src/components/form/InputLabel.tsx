
import {
  Box, SxProps, Theme, Tooltip, Typography,
} from '@mui/material';
import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { FaInfoCircle } from 'react-icons/fa';

import {
  INPUT_FONT_SIZE, INPUT_LABEL_END_GAP, INPUT_LABEL_FONT_SIZE, INPUT_LABEL_HINT_FONT_SIZE,
} from '@/constants/_core/ui.constants';

const classes = {
  /*
   * a label names the field rather than holding its content, but it is what the form is read by
   * before anything has been filled in — so it takes the body size and tone, and what separates it
   * from the value under it is its position, not a smaller size or a fainter tint
   */
  label: (theme: Theme) => ({
    fontSize: INPUT_LABEL_FONT_SIZE,
    fontWeight: theme.typography.fontWeightRegular,
    color: theme.palette.text.primary,
  }),
  /*
   * a label standing beside its control instead of above it is the value being read, not the name
   * of a field, so it takes the body size and tone the control's own value would have
   */
  inlineLabel: (theme: Theme) => ({
    fontSize: INPUT_FONT_SIZE,
    fontWeight: 400,
    color: theme.palette.text.primary,
  }),
  // the "(required)" marker shares the label's size and separates itself by tone alone
  required: (theme: Theme) => ({
    fontSize: INPUT_LABEL_HINT_FONT_SIZE,
    color: theme.palette.text.secondary,
  }),
  tooltipIcon: (theme: Theme) => ({
    display: 'flex',
    color: theme.palette.text.disabled,
  }),
  /*
   * what closes the label's row on the right: a character count, a limit. It is pushed to the far
   * edge rather than following the label, so a column of fields lines its counts up whatever the
   * length of the names on the left
   */
  end: {
    marginLeft: 'auto',
    paddingLeft: `${INPUT_LABEL_END_GAP}px`,
  },
};

type Props = {
  label?: string | ReactNode;
  tooltip?: string;
  sx?: SxProps<Theme>;
  required?: boolean;
  // the label sits beside its control (checkbox, switch) rather than above it
  inline?: boolean;
  /*
   * what the row carries at its right end — the count of what has been typed against the limit the
   * field accepts. It belongs to the label rather than under the control: a count read after the
   * value is a verdict, one read above it is a budget
   */
  end?: ReactNode;
};

const InputLabel = ({
  label, sx, tooltip, required, end, inline = false,
}: Props) => {
  const {
    t,
  } = useTranslation();

  return (
    <Box sx={[{
      mb: '6px',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
    },
    /*
     * a row carrying something at its far end has to span the field it names, otherwise there is
     * nothing for that end to be pushed against: the wrappers these labels sit in are flex columns
     * packing their children to the left (`.flexColumn` in the global styles), so the row would
     * otherwise be only as wide as the words in it
     */
    !!end && { width: '100%' },
    ...(Array.isArray(sx) ? sx : [sx])]}
    >
      <Typography css={inline
        ? classes.inlineLabel
        : classes.label}
      >
        {label}
      </Typography>
      {tooltip && (
        <Tooltip placement="top" title={tooltip}>
          <span css={classes.tooltipIcon}>
            <FaInfoCircle color="currentColor" size={16} />
          </span>
        </Tooltip>
      )}
      {required && <Typography css={classes.required}>({t('required')})</Typography>}
      {end && <Box css={classes.end}>{end}</Box>}
    </Box>
  );
};

export default InputLabel;
