import { useEffect, useState } from 'react';

/**
 * the value, but only once it has stopped changing for `delay` ms — for work too costly to redo
 * on every keystroke (a request, a generated image)
 * @param value the value that changes
 * @param delay quiet time in ms before the new value is returned
 */
export const useDebouncedValue = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timeout = setTimeout(() => setDebouncedValue(value), delay);

    return () => clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
};
