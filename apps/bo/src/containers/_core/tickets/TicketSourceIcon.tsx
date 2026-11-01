import { FiGlobe, FiSmartphone } from 'react-icons/fi';

import { TicketSource, TicketSourceEnum } from '@/types/_core/ticket-message.type';

type Props = {
  source: TicketSource;
  size: number;
};

/** The glyph of where a ticket comes from: the public website or the app */
const TicketSourceIcon = ({ source, size }: Props) => {
  if (source === TicketSourceEnum.APP) return <FiSmartphone size={size} />;

  return <FiGlobe size={size} />;
};

export default TicketSourceIcon;
