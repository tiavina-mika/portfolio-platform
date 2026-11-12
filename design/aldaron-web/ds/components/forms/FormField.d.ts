import * as React from 'react';
/**
 * Champ de formulaire : libellé, contrôle, aide ou message d'erreur. Équivalent visuel de FormItem/FormLabel/FormMessage de shadcn.
 * @startingPoint section="Forms" subtitle="Formulaire : champs, sélection, cases, interrupteurs" viewport="700x560"
 */
export interface FormFieldProps {
  label?: React.ReactNode;
  htmlFor?: string;
  /** Aide sous le champ (masquée quand une erreur est affichée) */
  description?: React.ReactNode;
  error?: React.ReactNode;
  required?: boolean;
  optional?: boolean;
  children: React.ReactNode;
}
export declare function FormField(props: FormFieldProps): JSX.Element;
export interface LabelProps { htmlFor?: string; required?: boolean; optional?: boolean; children: React.ReactNode; }
export declare function Label(props: LabelProps): JSX.Element;
