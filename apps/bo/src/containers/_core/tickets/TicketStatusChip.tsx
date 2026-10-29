import Chip from '@mui/material/Chip';

import { TicketStatus, TicketStatusEnum } from '@/types/_core/ticket-message.type';
import { getTicketStatusLabelByValue } from '@/utils/_core/ticket.utils';

const getChipColorByStatus = (status: TicketStatus) => {
  switch (status) {
    case TicketStatusEnum.OPEN:
      return 'info';
    case TicketStatusEnum.IN_PROGRESS:
      return 'primary';
    case TicketStatusEnum.RESOLVED:
      return 'success';
    case TicketStatusEnum.CLOSED:
      return 'default';
    default:
      return 'default';
  }
};

type Props = {
  status: TicketStatus | undefined;
};
const TicketStatusChip = ({ status }: Props) => {
  if (!status) return null;

  return (
    <Chip
      color={getChipColorByStatus(status)}
      label={getTicketStatusLabelByValue(status)}
      size="small"
    />
  );
};

export default TicketStatusChip;
