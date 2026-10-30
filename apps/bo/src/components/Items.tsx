import {
  Box, List, ListItem, ListItemIcon, Theme,
} from '@mui/material';
import Typography from '@mui/material/Typography';
import { ReactNode } from 'react';

import { FIELD_LABEL_MIN_WIDTH, FIELD_ROW_GAP, FIELD_ROW_PADDING_Y } from '@/constants/_core/ui/ui.constants';
import { ISelectOption } from '@/types/_core/app.type';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';
import { isStringOrNumber } from '@/utils/_core/utils';


const classes = {
  content: (alignment: string, labelLength: number) => {
    const styles: Record<string, string | number> = {
      flexDirection: labelLength > 50
        ? 'column'
        : alignment,
    };

    if (alignment === 'row') {
      if (labelLength > 50) {
        styles.alignItems = 'flex-start';
      }
      else {
        styles.alignItems = 'center';
      }
    }
    else {
      styles.alignItems = 'flex-start';
    }

    return styles;
  },
  value: (theme: Theme) => ({
    color: theme.palette.text.primary,
    fontWeight: 500,
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    [theme.breakpoints.up('md')]: {
      justifyContent: 'flex-start',
      flex: 2,
    },
    '& > p': { fontWeight: 500 },
  }),
  // the filet closes a row against the next one, so the last row of the block does not draw one
  li: (theme: Theme) => ({
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: FIELD_ROW_PADDING_Y,
    paddingBottom: FIELD_ROW_PADDING_Y,
    borderBottom: `1px solid ${getDesignTokens(theme).borderLight}`,
    '&:last-of-type': { borderBottom: 'none', paddingBottom: 0 },
    '&:first-of-type': { paddingTop: 0 },
  }),
  valueFullWidth: (theme: Theme) => ({
    flex: '1 !important',
    [theme.breakpoints.up('md')]: { justifyContent: 'flex-end !important' },
  }),
};

type Props = {
  items: ISelectOption<string | ReactNode | undefined>[];
  alignment?: 'row' | 'column';
  fullWidth?: boolean;
  className?: string;
};

const Items = ({
  items, className, fullWidth = false, alignment = 'row',
}: Props) => {
  return (
    <List className={className} sx={{ p: 0, flex: 1 }}>
      {items.map((item: ISelectOption<string | ReactNode | undefined>, index: number) => (
        item.hide
          ? null : (
            <ListItem css={classes.li} key={index}>
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <div
                className="flexRow flex1 spaceBetween"
                css={[classes.content(alignment, item.label.length), { gap: FIELD_ROW_GAP }]}
              >
                <Box
                  sx={{
                    alignItems: 'center',
                    display: 'flex',
                    flex: 1,
                    minWidth: FIELD_LABEL_MIN_WIDTH,
                  }}
                >
                  <Typography variant="body2">
                    {item.label}
                  </Typography>
                </Box>
                {/* if value is a string, wrap it inside <p></p>, otherwise, no wrapper */}
                <div css={[classes.value, fullWidth
                  ? classes.valueFullWidth
                  : null]}
                >
                  {isStringOrNumber(item.value)
                    ? <Typography>{item.value}</Typography>
                    : item.value}
                  {/* empty value */}
                  {!item.value && (
                    <Typography
                      css={(theme: Theme) => ({ color: theme.palette.text.disabled })}
                    >
                      -
                    </Typography>
                  )}
                </div>
              </div>
            </ListItem>
          )
      ))}
    </List>
  );
};

export default Items;
