import {
  Box, Stack, styled, SxProps, Theme, Typography, useTheme,
} from '@mui/material';

import { FONT_SIZE_META, INPUT_FONT_SIZE, RADIUS } from '@/constants/_core/ui/ui.constants';
import { ICardRadio } from '@/types/_core/app.type';
import { getDesignTokens, getTintedBackground } from '@/utils/_core/theme/tokens.utils';

type HeaderProps = {
  checked: boolean;
};

/*
 * a card option is a radio drawn as a slab: the whole card is the target, and selection shows as a
 * primary outline over a tint of the same color — no separate dot to read, so it stays compact
 * enough to sit in a row with the fields around it
 */
const StyledCard = styled('div', { shouldForwardProp: prop => prop !== 'checked' })<HeaderProps>(({
  theme,
}) => ({
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
  // the options share the row evenly — a card is sized by the row, not by its own longest word
  flex: 1,
  borderRadius: RADIUS,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: getDesignTokens(theme).border,
  backgroundColor: theme.palette.background.paper,
  padding: 12,
  cursor: 'pointer',
  transition: 'all 0.15s ease-in',
  '&:hover': { borderColor: theme.palette.primary.main },

  variants: [{
    props: (
      {
        checked,
      }
    ) => checked,

    style: {
      borderColor: theme.palette.primary.main,
      backgroundColor: getTintedBackground(theme, theme.palette.primary.main),
    },
  }],
}));

type Props = {
  onChange: (...event: any[]) => void;
  value?: string;
  options: ICardRadio[];
  sx?: SxProps<Theme>;
  className?: string;
};

const CardRadioInput = ({
  onChange, value, sx, className, options = [],
}: Props) => {
  const theme = useTheme();

  const onChecked = (value: string): void => {
    onChange(value);
  };

  const renderIcon = (icon: any, checked: boolean) => {
    const IconComponent = icon;
    const props = checked
      ? { color: theme.palette.primary.main }
      : {};

    return <IconComponent {...props} />;
  };

  return (
    <Stack direction="row" spacing={1} sx={sx}>
      {options.map((option: ICardRadio, index: number) => (
        <StyledCard
          checked={value === option.value}
          className={className}
          key={option.value + index}
          onClick={() => onChecked(option.value)}
        >
          <Stack
            direction="row"
            sx={{
              alignItems: 'center',
            }}
          >
            {/* --- icon --- */}
            {option.icon && renderIcon(option.icon, value === option.value)}
            {/* --- label --- */}
            <Typography
              sx={{
                fontSize: INPUT_FONT_SIZE,
                fontWeight: 500,

                ml: option.icon
                  ? 1
                  : 0,
              }}
            >
              {option.label}
            </Typography>
          </Stack>
          {/* ----- description ----- */}
          {option.description && (
            <Box>
              {/* the description qualifies the option's own label, so it sits one step under it */}
              <Typography sx={{ fontSize: FONT_SIZE_META, color: getDesignTokens(theme).textSecondary }}>
                {option.description}
              </Typography>
            </Box>
          )}
        </StyledCard>
      ))}
    </Stack>
  );
};

export default CardRadioInput;
