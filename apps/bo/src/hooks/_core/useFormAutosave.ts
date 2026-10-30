import { useEffect, useRef } from 'react';

import type { FieldValues, UseFormWatch } from 'react-hook-form';

type Props<T extends FieldValues> = {
  watch: UseFormWatch<T>;
  onSave: (values: T) => void;
  enabled?: boolean;
  delay?: number;
};

/**
 * debounced autosave for any react-hook-form instance — subscribes to `watch` without
 * triggering a re-render (unlike calling `watch()` directly in the render body), so it is
 * safe to use alongside heavy fields (rich text editors, ...)
 */
export const useFormAutosave = <T extends FieldValues>({
  watch, onSave, enabled = true, delay = 3000,
}: Props<T>): void => {
  const onSaveRef = useRef(onSave);

  onSaveRef.current = onSave;

  useEffect(() => {
    if (!enabled) return;

    let timeoutId: ReturnType<typeof setTimeout>;

    const subscription = watch((values) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        onSaveRef.current(values as T);
      }, delay);
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, [watch, enabled, delay]);
};
