'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';


type Props = {
  children: ReactNode;
};

/**
 * this is a transition component between pages
 * @see https://dev.to/joseph42a/nextjs-page-transition-with-framer-motion-33dg
 * @returns
 */
const RootTemplate = ({ children }: Props) => {
  return (
    <motion.div
      animate={{ y: 0, opacity: 1 }}
      initial={{ y: 20, opacity: 0 }}
      style={{ display: 'flex', flexDirection: 'column', alignSelf: 'stretch' }}
      transition={{ ease: 'easeInOut', duration: 0.75 }}
    >
      {children}
    </motion.div>
  );
};

export default RootTemplate;
