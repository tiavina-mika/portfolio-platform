import * as React from 'react';
/** Champ de saisie texte. Utiliser dans un FormField pour le libellé et l'erreur. */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  size?: 'sm' | 'md';
  invalid?: boolean;
  /** Icône 16 px à gauche */
  leading?: React.ReactNode;
  /** Suffixe court à droite (unité, €) */
  trailing?: React.ReactNode;
  forceState?: 'hover' | 'focus';
}
export declare function Input(props: InputProps): JSX.Element;
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { invalid?: boolean; }
export declare function Textarea(props: TextareaProps): JSX.Element;
