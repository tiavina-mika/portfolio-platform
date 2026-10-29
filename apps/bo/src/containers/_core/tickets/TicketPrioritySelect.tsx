import { MenuItem, Select, SelectChangeEvent } from '@mui/material';

import { TICKET_PRIORITY_OPTIONS } from '@/constants/_core/ticket.constants';
import { TicketPriority } from '@/types/_core/ticket-message.type';

type Props = {
  priority: TicketPriority;
  onChange: (priority: TicketPriority) => void;
  disabled?: boolean;
  // inside a side panel the select is a field of the card; on its own it keeps its natural width
  fullWidth?: boolean;
};

const TicketPrioritySelect = ({
  priority, onChange, disabled = false, fullWidth = false,
}: Props) => {
  const handleChange = (event: SelectChangeEvent) => onChange(event.target.value as TicketPriority);

  return (
    <Select
      disabled={disabled}
      fullWidth={fullWidth}
      onChange={handleChange}
      size="small"
      sx={{ minWidth: fullWidth ? undefined : 160 }}
      value={priority}
    >
      {TICKET_PRIORITY_OPTIONS.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </Select>
  );
};

export default TicketPrioritySelect;
