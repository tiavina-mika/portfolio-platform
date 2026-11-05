import { ReactNode } from 'react';

import TextLink from '../typography/TextLink';

type Props = {
  href: string;
  children: ReactNode;
};
const FooterLink = ({ href, children }: Props) => {
  return (
    <TextLink

      className="text-base"
      href={href}
      underline={false}
    >
      {children}
    </TextLink>
  );
};

export default FooterLink;
