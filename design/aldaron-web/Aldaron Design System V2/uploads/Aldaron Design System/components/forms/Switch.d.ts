import * as React from 'react';
/** Interrupteur pour un réglage à effet immédiat (paramètres, préférences). */
export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  id?: string;
  forceState?: 'hover' | 'focus';
}
export declare function Switch(props: SwitchProps): JSX.Element;
