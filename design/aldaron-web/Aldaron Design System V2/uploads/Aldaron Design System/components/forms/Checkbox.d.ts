import * as React from 'react';
/** Case à cocher avec libellé ; zone cliquable de 44 px de haut. */
export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: React.ReactNode;
  disabled?: boolean;
  invalid?: boolean;
  id?: string;
  forceState?: 'hover' | 'focus';
}
export declare function Checkbox(props: CheckboxProps): JSX.Element;
