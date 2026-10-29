import { CircleAlert } from 'lucide-react';
import { ReactNode } from 'react';

type Props = {
  /**
   * The message, next to the icon
   */
  children: ReactNode;
};

/**
 * A list that has nothing to show yet: an icon and a text (never the color alone), announced as a
 * status
 */
const EmptyNotice = ({ children }: Props) => (
  <p className="flex items-center gap-3 text-base font-medium" role="status">
    <CircleAlert aria-hidden className="size-6 flex-none text-muted-foreground" />
    {children}
  </p>
);

export default EmptyNotice;
