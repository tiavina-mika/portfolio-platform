import { cva } from 'class-variance-authority';
import {
  CircleAlert, CircleCheck, Info, TriangleAlert,
} from 'lucide-react';
import { ReactNode } from 'react';

import { cn } from '@/utils/app.utils';

export type AlertVariant = 'neutral' | 'info' | 'success' | 'warning' | 'destructive';

const alertVariants = cva(
  `
    grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 rounded-lg border px-4 py-3.5 text-sm
    leading-[1.5] text-foreground
  `,
  {
    variants: {
      variant: {
        neutral: 'border-border bg-card',
        info: 'border-transparent bg-info-subtle',
        success: 'border-transparent bg-success-subtle',
        warning: 'border-transparent bg-warning-subtle',
        destructive: 'border-transparent bg-danger-subtle',
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
const ICON_CLASSES: Record<AlertVariant, string> = {
  neutral: 'text-muted-foreground',
  info: 'text-info',
  success: 'text-success',
  warning: 'text-warning',
  destructive: 'text-destructive-text',
};

// a neutral title keeps the text color; only a status tints it
const TITLE_CLASSES: Record<AlertVariant, string> = {
  ...ICON_CLASSES,
  neutral: '',
};

// the message of a neutral alert is secondary text, the one of a status stays at full contrast
const BODY_CLASSES: Record<AlertVariant, string> = {
  neutral: 'text-muted-foreground',
  info: 'text-foreground',
  success: 'text-foreground',
  warning: 'text-foreground',
  destructive: 'text-foreground',
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

  return (
    <div
      className={cn(alertVariants({ variant }), className)}
      role={variant === 'destructive' || variant === 'warning' ? 'alert' : 'status'}
    >
      <Icon aria-hidden className={cn('mt-px', ICON_CLASSES[variant])} size={20} />
      <div className="flex flex-col gap-0.5">
        {title && <p className={cn('text-[15px] font-semibold', TITLE_CLASSES[variant])}>{title}</p>}
        {children && <div className={BODY_CLASSES[variant]}>{children}</div>}
      </div>
      {/* the third column always exists, so the text wraps at the same width with or without an action */}
      {action ? <div className="flex items-center gap-2">{action}</div> : <span aria-hidden />}
    </div>
  );
};

export default Alert;
