import * as React from 'react';
export interface SelectOption { value: string; label: React.ReactNode; disabled?: boolean; }
/** Liste déroulante à choix unique, navigable au clavier (flèches, Entrée, Échap). */
export interface SelectProps {
  options: SelectOption[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  invalid?: boolean;
  disabled?: boolean;
  id?: string;
  /** Force l'ouverture (documentation) */
  open?: boolean;
  forceState?: 'hover' | 'focus';
  'aria-label'?: string;
}
export declare function Select(props: SelectProps): JSX.Element;
