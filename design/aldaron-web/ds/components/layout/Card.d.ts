import * as React from 'react';
/**
 * Conteneur à bordure fine. Pas d'ombre par défaut : la bordure suffit sur fond Papier.
 * @startingPoint section="Layout" subtitle="Cartes : défaut, inversée, sourdine, interactive" viewport="700x380"
 */
export interface CardProps {
  variant?: 'default' | 'muted' | 'inverted' | 'elevated';
  /** Padding interne en px (défaut 24 ; 16 pour les cartes denses du back-office) */
  padding?: number;
  /** Étiquette mono en capitales au-dessus du titre */
  eyebrow?: React.ReactNode;
  title?: React.ReactNode;
  description?: React.ReactNode;
  /** Élément aligné à droite de l'en-tête (Badge, Button ghost) */
  action?: React.ReactNode;
  footer?: React.ReactNode;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export declare function Card(props: CardProps): JSX.Element;
