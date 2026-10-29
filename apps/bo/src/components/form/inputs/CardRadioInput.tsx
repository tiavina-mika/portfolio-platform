import {
  Box, Stack, styled, type SxProps, type Theme, Typography, useTheme,
} from '@mui/material';

import { ICardRadio } from '@/types/app.type';

type HeaderProps = {
  checked: boolean;
};

const StyledCard = styled('div', { shouldForwardProp: prop => prop !== 'checked' })<HeaderProps>(({
  theme,
}) => ({
  borderRadius: 6,
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: '#e4e5e6',
  backgroundColor: '#fff',
  padding: 20,
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
    (
      <Stack direction="row" spacing={2} sx={sx}>
        {options.map((option: ICardRadio, index: number) => (
          <StyledCard
            key={option.value + index}
            checked={value === option.value}
            className={className}
            onClick={() => onChecked(option.value)}
          >
            <Stack alignItems="center" direction="row">
              {/* --- icon --- */}
              {option.icon && renderIcon(option.icon, value === option.value)}
              {/* --- label --- */}
              <Typography
                sx={[{
                  fontSize: 14,

                  ml: option.icon
                    ? 1
                    : 0,
                }, value === option.value ? {
                  color: theme.palette.primary.main,
                } : {
                  color: '',
                }]}
              >
                {option.label}
              </Typography>
            </Stack>
            {/* ----- description ----- */}
            {option.description && (
              <Box sx={{ mt: 1 }}>
                <Typography sx={{ fontSize: 13, color: '#78777e' }}>{option.description}</Typography>
              </Box>
            )}
          </StyledCard>
        ))}
      </Stack>
    )
  );
};

export default CardRadioInput;
