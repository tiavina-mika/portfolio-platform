'use client';

import {
  CircleAlert, CircleCheck, Info, LoaderCircle, X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import {
  toast, ToastBar, Toaster, ToastType,
} from 'react-hot-toast';

import { cn } from '@/utils/app.utils';

const TOAST_ICONS: Partial<Record<ToastType, { icon: typeof CircleAlert; className: string }>> = {
  success: { icon: CircleCheck, className: 'text-success' },
  error: { icon: CircleAlert, className: 'text-destructive-text' },
  loading: { icon: LoaderCircle, className: 'animate-spin text-muted-foreground' },
  blank: { icon: Info, className: 'text-muted-foreground' },
};

/** @see https://react-hot-toast.com */
const ToasterProvider = () => {
  const t = useTranslations('Common');

  return (
    <Toaster
      reverseOrder
      gutter={8}
      position="bottom-right"
      toastOptions={{
        duration: 3500,
        // the surface is drawn below, with the theme tokens: the default one stays white in dark mode
        style: {
          width: 380,
          maxWidth: 'calc(100vw - 32px)',
          padding: 0,
          background: 'transparent',
          boxShadow: 'none',
        },
        success: { duration: 3000 },
        error: { duration: 8000 },
      }}
    >
      {toastItem => (
        <ToastBar toast={toastItem}>
          {({ message }) => {
            const status = TOAST_ICONS[toastItem.type];
            const Icon = status?.icon;

            return (
              <div className={`
                pointer-events-auto flex w-full items-start gap-1 rounded-lg border border-border bg-popover
                py-3.5 pr-2 pl-4 text-sm text-popover-foreground shadow-lg
              `}
              >
                {Icon && <Icon aria-hidden className={cn('mt-1 flex-none', status.className)} size={20} />}
                <div className="min-w-0 flex-1">{message}</div>
                {toastItem.type !== 'loading' && (
                  <button
                    aria-label={t('close')}
                    onClick={() => toast.dismiss(toastItem.id)}
                    type="button"
                    className={`
                      flex size-8 flex-none cursor-pointer items-center justify-center rounded-sm
                      text-muted-foreground transition-colors duration-120
                      hover:bg-muted hover:text-foreground
                    `}
                  >
                    <X aria-hidden size={16} />
                  </button>
                )}
              </div>
            );
          }}
        </ToastBar>
      )}
    </Toaster>
  );
};

export default ToasterProvider;
