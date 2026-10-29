'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { ReactNode } from 'react';

// each item starts this long after the previous one, so a row rises as a cascade
const STAGGER_SECONDS = 0.1;

type Props = {
  children: ReactNode;
  /**
   * Position of the item in its list, it sets the delay of the cascade
   */
  index: number;
  /**
   * `false` renders a still item (the reduced motion setting of the device does the same)
   * @default true
   */
  animated?: boolean;
  className?: string;
};

/**
 * A list item that rises 24px and fades in the first time it enters the viewport, after the items
 * before it
 */
const RevealListItem = ({
  children, index, animated = true, className,
}: Props) => {
  const isReducedMotion = useReducedMotion();

  if (!animated || isReducedMotion) {
    return <li className={className}>{children}</li>;
  }

  return (
    <motion.li
      className={className}
      initial={{ opacity: 0, y: 24 }}
      transition={{ duration: 0.5, delay: index * STAGGER_SECONDS, ease: 'easeOut' }}
      viewport={{ once: true, amount: 0.15 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.li>
  );
};

export default RevealListItem;
