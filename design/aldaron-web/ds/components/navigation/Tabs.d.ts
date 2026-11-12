import * as React from 'react';
export interface TabItem { value: string; label: React.ReactNode; icon?: React.ReactNode; count?: number | string; disabled?: boolean; content?: React.ReactNode; }
/** Onglets : `underline` pour naviguer entre sections d'une page, `pill` pour filtrer une vue. Flèches gauche/droite au clavier. */
export interface TabsProps {
  items: TabItem[];
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  variant?: 'underline' | 'pill';
  className?: string;
}
export declare function Tabs(props: TabsProps): JSX.Element;
