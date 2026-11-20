import * as React from 'react';
/** Étiquette courte de statut ou de catégorie. Jamais cliquable. */
export interface BadgeProps {
  variant?: 'default' | 'primary' | 'brand' | 'success' | 'warning' | 'destructive' | 'info' | 'outline';
  size?: 'sm' | 'md';
  /** Pastille de couleur devant le texte (statuts) */
  dot?: boolean;
  /** Texte en IBM Plex Mono (codes, versions, prix) */
  mono?: boolean;
  square?: boolean;
  icon?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}
export declare function Badge(props: BadgeProps): JSX.Element;
