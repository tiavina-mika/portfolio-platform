import { ReactNode } from 'react';
import { parse } from 'tiptap-parser';

import { isString } from '@/utils/utils';

import Text from './Text';

type Props = {
  children: ReactNode | string;
};
const PageDescription = ({ children }: Props) => {
  if (!isString<ReactNode>(children)) return children;
  return (

    <Text className={`
      text-lg leading-7 text-dark-400
      md:text-xl md:leading-normal!
    `}
    >
      {parse(children as string)}
    </Text>
  );
};

export default PageDescription;
