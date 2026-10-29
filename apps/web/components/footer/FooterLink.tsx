import { ReactNode } from 'react';

import TextLink from '../typography/TextLink';

type Props = {
  href: string;
  children: ReactNode;
};
const FooterLink = ({ href, children }: Props) => {
  return (
    <TextLink

      href={href}
      underline={false}
      className={`
        font-primary text-base
        dark:text-gray-300
      `}
    >
      {children}
    </TextLink>
  );
};

export default FooterLink;
