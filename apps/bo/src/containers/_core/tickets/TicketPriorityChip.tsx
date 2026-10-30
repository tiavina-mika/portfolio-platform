import Chip from '@mui/material/Chip';

import { TicketPriority, TicketPriorityEnum } from '@/types/_core/ticket-message.type';
import { getTicketPriorityLabelByValue } from '@/utils/_core/ticket.utils';

const getChipColorByPriority = (priority: TicketPriority) => {
  switch (priority) {
    case TicketPriorityEnum.LOW:
      return 'default';
    case TicketPriorityEnum.MEDIUM:
      return 'info';
    case TicketPriorityEnum.HIGH:
      return 'warning';
    case TicketPriorityEnum.URGENT:
      return 'error';
    default:
      return 'default';
  }
};

type Props = {
  priority: TicketPriority | undefined;
};
const TicketPriorityChip = ({ priority }: Props) => {
  if (!priority) return null;

  return (
    <Chip
      color={getChipColorByPriority(priority)}
      label={getTicketPriorityLabelByValue(priority)}
      size="small"
    />
  );
};

export default TicketPriorityChip;
