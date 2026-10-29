import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';

type Props = {
  // what the list was narrowed to, already named for the reader
  message: string;
  // names the way back out — "see all rides", "see all payments"…
  clearLabel: string;
  onClear: () => void;
};

/**
 * Why the list is showing three rows instead of three hundred.
 *
 * A list narrowed by a link the operator followed from somewhere else looks, on arrival, exactly
 * like a list that found almost nothing — and the filter panel that would explain it is empty,
 * because this scope never went through it. So the band states the subject and offers the way
 * back out, which is the one thing a scoped list must never make its reader guess at.
 */
const ListScopeAlert = ({ message, clearLabel, onClear }: Props) => (
  <Alert
    severity="info"
    action={(
      <Button color="inherit" onClick={onClear} size="small">
        {clearLabel}
      </Button>
    )}
  >
    {message}
  </Alert>
);

export default ListScopeAlert;
