import { cva } from 'class-variance-authority';
import {
  CircleAlert, CircleCheck, Info, TriangleAlert,
} from 'lucide-react';
import { ReactNode } from 'react';

import { cn } from '@/utils/app.utils';

export type AlertVariant = 'neutral' | 'info' | 'success' | 'warning' | 'destructive';

const alertVariants = cva(
  'grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-lg border px-4 py-3.5 text-sm',
  {
    variants: {
      variant: {
        neutral: 'border-border bg-card text-foreground',
        info: 'border-transparent bg-info-subtle text-foreground',
        success: 'border-transparent bg-success-subtle text-foreground',
        warning: 'border-transparent bg-warning-subtle text-foreground',
        destructive: 'border-transparent bg-danger-subtle text-foreground',
      },
    },
  }
);

const ICONS: Record<AlertVariant, typeof CircleAlert> = {
  neutral: Info,
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  destructive: CircleAlert,
};

// the icon and the title carry the status color, the text stays readable on the soft background
const ACCENT_CLASSES: Record<AlertVariant, string> = {
  neutral: 'text-muted-foreground',
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive-text',
};

export type AlertProps = {
  /**
   * @default neutral
   */
  variant?: AlertVariant;
  title?: string;
  /**
   * The message
   */
  children?: ReactNode;
  /**
   * A button or a link, at the end of the alert
   */
  action?: ReactNode;
  className?: string;
};

/**
 * A message that stays on screen: an icon and a text, never the color alone. A warning or an error is
 * announced as an alert, the others as a status, so either is read without moving the focus.
 */
const Alert = ({
  variant = 'neutral',
  title,
  children,
  action,
  className,
}: AlertProps) => {
  const Icon = ICONS[variant];
  const accentClass = ACCENT_CLASSES[variant];

  return (
    <div
      className={cn(alertVariants({ variant }), className)}
      role={variant === 'destructive' || variant === 'warning' ? 'alert' : 'status'}
    >
      <Icon aria-hidden className={cn('mt-px', accentClass)} size={20} />
      <div className="flex flex-col gap-0.5">
        {title && <p className={cn('text-[15px] font-semibold', accentClass)}>{title}</p>}
        {children && <div>{children}</div>}
      </div>
      {action && <div className="flex items-center gap-2">{action}</div>}
    </div>
  );
};

export default Alert;
