import {
  Box, List, ListItem, ListItemIcon, type Theme,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import Typography from '@mui/material/Typography';
import { ReactNode } from 'react';

import { ISelectOption } from '@/types/app.type';
import { isStringOrNumber } from '@/utils/utils';


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
    color: theme.palette.mode === 'light'
      ? '#000'
      : grey[400],
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
  li: {
    paddingLeft: 0,
    paddingRight: 0,
  },
  valueFullWidth: (theme: Theme) => ({
    flex: '1 !important',
    [theme.breakpoints.up('md')]: { justifyContent: 'flex-end !important' },
  }),
};

type Props = {
  items: ISelectOption<string | ReactNode | undefined>[];
  alignment?: 'row' | 'column';
  fullWidth?: boolean;
};

const Items = ({
  items, fullWidth = false, alignment = 'row',
}: Props) => {
  return (
    <List sx={{ p: 0 }}>
      {items.map((item: ISelectOption<string | ReactNode | undefined>, index: number) => (
        item.hide
          ? null : (
            <ListItem css={classes.li} key={index}>
              {item.icon && <ListItemIcon>{item.icon}</ListItemIcon>}
              <div
                className="flexRow flex1 spaceBetween"
                css={classes.content(alignment, item.label.length)}
              >
                <Box sx={{ alignItems: 'center', display: 'flex', flex: 1 }}>
                  <Typography variant="body1">
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
                      css={(theme: Theme) => ({ color: theme.palette.grey[400] })}
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
