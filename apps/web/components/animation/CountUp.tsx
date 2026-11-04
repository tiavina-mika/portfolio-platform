'use client';

import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'framer-motion';
import { useFormatter } from 'next-intl';
import { useEffect, useRef } from 'react';

const DURATION_IN_SECONDS = 1.6;
// ease-out cubic: a fast start that slows down when landing on the final value
const EASE_OUT_CUBIC = [0.33, 1, 0.68, 1] as const;
// share of the number that must be visible before it starts counting
const VISIBLE_AMOUNT = 0.3;

type Props = {
  value: number;
  className?: string;
};

/**
 * A number that counts up from 0 to its value, once, when it enters the viewport.
 * The counting is visual only: assistive technology reads the final value, and the server render and
 * a visitor who prefers reduced motion get the final value at once
 */
const CountUp = ({ value, className }: Props) => {
  const format = useFormatter();
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, amount: VISIBLE_AMOUNT });
  const shouldReduceMotion = useReducedMotion();
  const count = useMotionValue(value);
  const displayed = useTransform(count, latest => format.number(Math.round(latest)));

  useEffect(() => {
    if (shouldReduceMotion) {
      count.set(value);
      return;
    }

    // still below the fold: wait at 0 so the count starts from there when it shows up
    if (!isInView) {
      count.set(0);
      return;
    }

    const controls = animate(count, value, { duration: DURATION_IN_SECONDS, ease: EASE_OUT_CUBIC });

    return () => controls.stop();
  }, [count, isInView, shouldReduceMotion, value]);

  return (
    <span className={className} ref={ref}>
      <span className="sr-only">{format.number(value)}</span>
      <motion.span aria-hidden="true">{displayed}</motion.span>
    </span>
  );
};

export default CountUp;
