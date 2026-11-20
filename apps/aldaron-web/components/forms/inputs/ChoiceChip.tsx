import { ComponentProps, ReactNode } from 'react';

import { cn } from '@/utils/app.utils';

type Props = {
  /**
   * `checkbox` for a choice among several that can all be picked, `radio` for one choice among a group
   */
  type: 'checkbox' | 'radio';
  label: ReactNode;
  checked: boolean;
  /**
   * @default false
   */
  disabled?: boolean;
  className?: string;
} & Pick<ComponentProps<'input'>, 'name' | 'value' | 'onChange' | 'onClick'>;

/**
 * A choice drawn as a bordered chip, 44px high, the whole chip being the click zone. It stays a native
 * input, so it is sent with the form and read by assistive technologies as a checkbox or a radio.
 */
const ChoiceChip = ({
  type, label, checked, disabled = false, className, ...inputProps
}: Props) => (
  <label
    className={cn(
      `
        flex min-h-11 cursor-pointer items-center gap-2 rounded-md border border-input px-4 text-[15px]
        leading-none font-medium transition-colors duration-120
        hover:bg-muted
        has-disabled:cursor-not-allowed has-disabled:opacity-45
        motion-reduce:transition-none
      `,
      checked ? 'bg-muted' : 'bg-card',
      className
    )}
  >
    <input
      {...inputProps}
      checked={checked}
      className="m-0 size-[18px] cursor-[inherit] accent-brand"
      disabled={disabled}
      type={type}
    />
    {label}
  </label>
);

export default ChoiceChip;
