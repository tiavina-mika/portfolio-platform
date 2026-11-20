import * as React from 'react';
/**
 * Bouton d'action Aldaron. Une seule action `primary` (ou `brand`) par zone.
 * @startingPoint section="Actions" subtitle="Boutons : variantes, tailles, états" viewport="700x420"
 */
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** primary = encre (défaut) ; brand = orange Signal, réservé à l'appel principal marketing */
  variant?: 'primary' | 'brand' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'link';
  /** sm 36 px · md 44 px (cible tactile min.) · lg 52 px · icon 44×44 */
  size?: 'sm' | 'md' | 'lg' | 'icon';
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  loading?: boolean;
  block?: boolean;
  href?: string;
  as?: React.ElementType;
  /** Force un état visuel (documentation uniquement) */
  forceState?: 'hover' | 'focus';
  children?: React.ReactNode;
}
export declare function Button(props: ButtonProps): JSX.Element;
