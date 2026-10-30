'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export type AnimatedDivProps = {
  children: ReactNode;
  withAnimation?: boolean;
  animation?: Record<string, any>;
  className?: string;
  role?: string;
};
const AnimatedDiv = ({
  children, withAnimation, animation, className, role,
}: AnimatedDivProps) => {
  const Container = withAnimation ? motion.div : 'div';
  const props = withAnimation ? animation : {};

  return (
    <Container
      className={className}
      role={role}
      {...props}
    >
      {children}
    </Container>
  );
};

export default AnimatedDiv;
