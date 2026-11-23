import { Stack, Typography } from '@mui/material';

import { IQuote } from '@/types/_domain/quote.type';

type Props = {
  quote: IQuote;
};

// which quote it is: the number it is referred to by, with what it proposes under it
const QuoteTitleCell = ({ quote }: Props) => (
  <Stack spacing={0.25} sx={{ minWidth: 0 }}>
    <Typography component="span" sx={{ fontWeight: 'fontWeightMedium' }} variant="body2">
      {quote.number}
    </Typography>
    <Typography
      noWrap
      color="text.secondary"
      component="span"
      variant="caption"
    >
      {quote.title}
    </Typography>
  </Stack>
);

export default QuoteTitleCell;
