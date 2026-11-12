'use client';

import { motion, useAnimation } from 'framer-motion';
import Image, { ImageProps } from 'next/image';
import { useEffect, useState } from 'react';


const animationVariants = {
  visible: { opacity: 1 },
  hidden: { opacity: 0 },
};

type Props = {
  alt?: string;
  rootClassName?: string;
  className?: string;
} & Omit<ImageProps, 'alt'>;
/**
 * taken from https://stackoverflow.com/questions/65546293/how-can-i-add-a-fade-in-animation-for-nextjs-image-when-it-loads
 */
const FadeInImage = ({
  rootClassName,
  className,
  alt = '',
  ...rest
}: Props) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const animationControls = useAnimation();

  useEffect(() => {
    if (isLoaded) {
      animationControls.start('visible');
    }
  }, [isLoaded, animationControls]);

  return (
    <motion.div
      animate={animationControls}
      className={rootClassName}
      initial="hidden"
      transition={{ ease: 'easeOut', duration: 1 }}
      variants={animationVariants}
    >
      <Image
        alt={alt}
        {...rest}
        className={className}
        onLoad={() => setIsLoaded(true)}
      />
    </motion.div>
  );
};

export default FadeInImage;
