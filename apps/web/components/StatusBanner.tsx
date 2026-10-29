import { CircleAlert, WifiOff } from 'lucide-react';
import { ReactNode } from 'react';

import { cn } from '@/utils/app.utils';

import Button from './buttons/Button';

export type StatusBannerVariant = 'error' | 'offline';

type Props = {
  /**
   * `error` (solid destructive border, announced as an alert) or `offline` (dashed border, a status:
   * the content comes back by itself on reconnection)
   */
  variant: StatusBannerVariant;
  /**
   * The message, next to the icon
   */
  children: ReactNode;
  /**
   * Shows a retry button with this label (with `onRetry`)
   */
  retryLabel?: string;
  onRetry?: () => void;
  /**
   * `md` replaces a whole block of content, `sm` sits inside a form
   * @default md
   */
  size?: 'md' | 'sm';
  className?: string;
};

const ICONS: Record<StatusBannerVariant, typeof CircleAlert> = {
  error: CircleAlert,
  offline: WifiOff,
};

const VARIANT_CLASSES: Record<StatusBannerVariant, string> = {
  error: 'border-solid border-error',
  offline: 'border-dashed border-foreground',
};

const SIZE_CLASSES = {
  md: 'gap-4 rounded-lg px-6 py-5 text-base',
  sm: 'gap-3 rounded-[14px] px-4 py-3.5 text-sm',
} as const;

/**
 * A message that takes the place of content that could not be shown: an icon and a text (never the
 * color alone), and an optional retry button. An error is an alert, an offline notice a status, so
 * either is announced without moving the focus.
 */
const StatusBanner = ({
  variant, children, retryLabel, onRetry, size = 'md', className,
}: Props) => {
  const isRetryShown = !!retryLabel && !!onRetry;
  const Icon = ICONS[variant];

  return (
    <div
      role={variant === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex flex-wrap items-center border-[1.5px] bg-card text-foreground',
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        className
      )}
    >
      <Icon
        aria-hidden
        className={cn('flex-none', { 'text-error': variant === 'error' })}
        focusable="false"
        size={size === 'md' ? 24 : 22}
      />
      <span className="min-w-45 flex-1 leading-normal font-medium">{children}</span>
      {isRetryShown && (
        <Button
          color="default"
          fullWidth={false}
          onClick={onRetry}
          size="sm"
          variant="outlined"
          className={`
            border-[1.5px] border-foreground px-5 text-base text-foreground
            hover:bg-muted
          `}
        >
          {retryLabel}
        </Button>
      )}
    </div>
  );
};

export default StatusBanner;
