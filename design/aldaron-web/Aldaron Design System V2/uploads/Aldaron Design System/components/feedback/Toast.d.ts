import * as React from 'react';
/** Notification passagère en bas à droite, après une action (« Invitation envoyée »). */
export interface ToastProps {
  variant?: 'default' | 'inverted' | 'success' | 'destructive' | 'warning' | 'info';
  title: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  onClose?: () => void;
  /** Sans animation d'entrée (documentation) */
  isStatic?: boolean;
  closeLabel?: string;
}
export declare function Toast(props: ToastProps): JSX.Element;
export interface ToasterProps { /** ms avant disparition ; 0 = permanent */ duration?: number; }
/** Monter une fois à la racine, puis appeler Toaster.show({ title, variant, … }). */
export declare function Toaster(props: ToasterProps): JSX.Element;
export declare namespace Toaster { function show(t: ToastProps & { duration?: number }): void; }
