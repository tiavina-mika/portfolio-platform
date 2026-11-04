import { Theme, styled } from '@mui/material';
import Divider from '@mui/material/Divider';
import InputBase from '@mui/material/InputBase';
import { ChangeEvent, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSearch } from 'react-icons/fi';

import {
  LIST_SEARCH_WIDTH, SEARCH_ICON_SIZE, SEARCH_ICON_STROKE_WIDTH,
} from '@/constants/_core/ui/list.constants';
import {
  INPUT_ADORNMENT_GAP, INPUT_ADORNMENT_INSET, INPUT_FONT_SIZE, INPUT_HEIGHT, RADIUS,
} from '@/constants/_core/ui/ui.constants';
import { getInputFocusRing } from '@/utils/_core/theme/styles.utils';
import { getDesignTokens } from '@/utils/_core/theme/tokens.utils';

type StyledSearchInputProps = {
  theme?: Theme;
  width: number | string;
};
/*
 * a search box is a filter, not a value to fill in: it sits on the page ground with the softer card
 * border instead of the stronger input outline, so a toolbar of them stays quiet next to the form
 * fields below it — it still snaps to the same row height and focus ring as every control.
 * Its width is a fixed column, not a share of the viewport: a query is a handful of words
 * whatever the screen is, and a box that grows with the window leaves a toolbar mostly empty
 */
const StyledSearchInput = styled('div', { shouldForwardProp: prop => prop !== 'width' })<StyledSearchInputProps>(
  ({
    theme, width,
  }) => {
    const tokens = getDesignTokens(theme);

    return {
      display: 'flex',
      // explicit, not inherited from a utility class: it is what centers the icon and the field
      alignItems: 'center',
      gap: `${INPUT_ADORNMENT_GAP}px`,
      height: INPUT_HEIGHT,
      padding: `0 ${INPUT_ADORNMENT_INSET}px`,
      width,
      border: `1px solid ${tokens.border}`,
      borderRadius: RADIUS,
      backgroundColor: tokens.bodyBg,
      // the glyph inherits it; the typed value keeps the body tone from InputBase
      color: tokens.textMuted,
      transition: theme.transitions.create(['border-color', 'box-shadow'], { duration: 150 }),

      '&:focus-within': {
        borderColor: theme.palette.primary.main,
        boxShadow: getInputFocusRing(theme),
      },

      [theme.breakpoints.down('md')]: { width: '100%' },
    };
  }
);

type Props = {
  onChange: (name: string, value: string) => void;
  placeholder?: string;
  // name is use to identify to use in search (ex: filters.user, filters.text, ...), by default it's text
  name?: string;
  withDivider?: boolean;
  width?: number | string;
};

const SearchInput = ({
  onChange, placeholder, width = LIST_SEARCH_WIDTH, withDivider = false, name = 'text',
}: Props) => {
  const {
    t,
  } = useTranslation();
  const [value, setValue] = useState<string>('');

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    setValue(event.target.value);
    onChange(name, event.target.value);
  };

  return (
    /* the class is what lets the list toolbar compress the box onto its own control row */
    <StyledSearchInput className="SearchInput-root" width={width}>
      {/* a static glyph, not a button: the field searches as you type, there is nothing to submit */}
      <FiSearch
        aria-hidden
        size={SEARCH_ICON_SIZE}
        strokeWidth={SEARCH_ICON_STROKE_WIDTH}
        style={{ flexShrink: 0 }}
      />
      {withDivider && <Divider orientation="vertical" sx={{ height: 28 }} />}
      <InputBase
        onChange={handleChange}
        placeholder={placeholder ?? t('search')}
        value={value}
        sx={{
          flex: 1,
          fontSize: INPUT_FONT_SIZE,
          // the row owns the vertical space; MUI's default 4px/5px input padding skews it
          '& .MuiInputBase-input': { padding: 0 },
        }}
      />
    </StyledSearchInput>
  );
};

export default SearchInput;
