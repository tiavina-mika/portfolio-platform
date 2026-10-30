import Box from '@mui/material/Box';

type Props = {
  // 0 to 1 — the share of the track the fill covers
  ratio: number;
  // resolved color of the fill; the track is always the surface's own divider
  color: string;
  width: number | string;
  height: number;
  radius: number;
};

/**
 * A ratio drawn as the same ratio: a recessed track with a fill covering its share of it. Used
 * wherever a table column states a proportion the reader has to compare across rows — a figure
 * alone cannot be scanned that way, a bar of a fixed width can.
 */
const ProgressBar = ({
  ratio, color, width, height, radius,
}: Props) => {
  return (
    <Box
      component="span"
      sx={{
        display: 'block',
        width,
        height,
        borderRadius: `${radius}px`,
        overflow: 'hidden',
        backgroundColor: 'divider',
      }}
    >
      <Box
        component="span"
        sx={{
          display: 'block',
          height: '100%',
          borderRadius: `${radius}px`,
          width: `${Math.round(Math.min(1, Math.max(0, ratio)) * 100)}%`,
          backgroundColor: color,
        }}
      />
    </Box>
  );
};

export default ProgressBar;
