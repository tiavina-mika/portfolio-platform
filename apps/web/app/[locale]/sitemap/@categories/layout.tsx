/**
 * this file is mainly used translate the error messages in the client side
 * every slot should have this file to handle the translated error messages
 */
import { ReactNode } from 'react';

import TranslationClientProvider from '@/components/TranslationClientProvider';

type Props = {
  children: ReactNode;
};
const CategoriesSlotLayout = ({ children }: Props) => {
  return (
    <TranslationClientProvider rootKeys={['Error']}>
      {children}
    </TranslationClientProvider>
  );
};

export default CategoriesSlotLayout;
