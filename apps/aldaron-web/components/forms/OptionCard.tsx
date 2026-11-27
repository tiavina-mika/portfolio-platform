import { ComponentProps, ReactNode } from 'react';

import { cn } from '@/utils/app.utils';

type Props = Omit<ComponentProps<'input'>, 'type' | 'children'> & {
  /**
   * `radio` picks one choice among the ones of a group (same `name`), `checkbox` turns one choice on
   * or off
   * @default checkbox
   */
  type?: 'radio' | 'checkbox';
  /**
   * The name of the choice
   */
  label: ReactNode;
  /**
   * A line under the name that tells what the choice means
   */
  hint?: ReactNode;
};

/**
 * A choice drawn as a bordered card: the whole card is the click zone, and a checked one takes the
 * brand border. The native input is kept, so the keyboard and the screen readers work as for any
 * radio or checkbox.
 */
const OptionCard = ({
  type = 'checkbox', label, hint, className, ...props
}: Props) => (
  <label
    className={cn(
      `
        relative flex min-h-11 cursor-pointer items-start gap-3 rounded-md border border-input bg-background
        px-4 py-3 transition-colors duration-120 ease-out
        hover:bg-muted
        has-checked:border-brand has-checked:shadow-[inset_0_0_0_1px_var(--brand)]
        has-focus-visible:ring-2 has-focus-visible:ring-ring has-focus-visible:ring-offset-2
        has-focus-visible:ring-offset-background
        has-disabled:cursor-not-allowed has-disabled:opacity-45
        motion-reduce:transition-none
      `,
      className
    )}
  >
    {/* the native control, which the forms plugin would otherwise redraw in its own blue */}
    <input
      type={type}
      className={`
        mt-0.5 size-5 shrink-0 cursor-pointer appearance-auto accent-brand
        focus:ring-0! focus:ring-offset-0! focus:outline-hidden
      `}
      {...props}
    />
    <span>
      <b className="block leading-[1.3] font-semibold">{label}</b>
      {hint && <small className="mt-0.5 block text-sm leading-[1.4] text-muted-foreground">{hint}</small>}
    </span>
  </label>
);

export default OptionCard;
