import * as React from 'react';
/** Message persistant dans la page (bandeau d'information, erreur de formulaire globale). */
export interface AlertProps {
  variant?: 'neutral' | 'info' | 'success' | 'warning' | 'destructive';
  title?: React.ReactNode;
  /** Remplace l'icône par défaut de la variante */
  icon?: React.ReactNode;
  /** Bouton(s) alignés à droite */
  action?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
}
export declare function Alert(props: AlertProps): JSX.Element;
