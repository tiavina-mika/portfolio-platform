import { MenuItem, Select, SelectChangeEvent } from '@mui/material';

import { TICKET_STATUS_OPTIONS } from '@/constants/_core/ticket.constants';
import { TicketStatus } from '@/types/_core/ticket-message.type';

type Props = {
  status: TicketStatus;
  onChange: (status: TicketStatus) => void;
  disabled?: boolean;
  // inside a side panel the select is a field of the card; on its own it keeps its natural width
  fullWidth?: boolean;
};

const TicketStatusSelect = ({
  status, onChange, disabled = false, fullWidth = false,
}: Props) => {
  const handleChange = (event: SelectChangeEvent) => onChange(event.target.value as TicketStatus);

  return (
    <Select
      disabled={disabled}
      fullWidth={fullWidth}
      onChange={handleChange}
      size="small"
      sx={{ minWidth: fullWidth ? undefined : 160 }}
      value={status}
    >
      {TICKET_STATUS_OPTIONS.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );
};

export default TicketStatusSelect;
