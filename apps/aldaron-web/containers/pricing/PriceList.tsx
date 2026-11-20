import { ReactNode } from 'react';

type Props = {
  /**
   * The lines of the list: `QuoteLine` or `OptionLine`
   */
  children: ReactNode;
};

/**
 * The box that holds a list of priced lines, one under the other, separated by a rule
 */
const PriceList = ({ children }: Props) => (
  <ul className="m-0 flex list-none flex-col overflow-hidden rounded-lg border border-border bg-card p-0">
    {children}
  </ul>
);

export default PriceList;
