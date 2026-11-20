import * as React from 'react';
export interface TableColumn<T = any> { key: string; header: React.ReactNode; width?: number | string; align?: 'left' | 'right'; /** Mono, chiffres tabulaires, aligné à droite */ numeric?: boolean; render?: (row: T) => React.ReactNode; }
/**
 * Tableau de données du back-office : en-têtes mono, lignes à bordure fine, survol discret.
 * @startingPoint section="Data" subtitle="Tableau d'utilisateurs avec rôles et statuts" viewport="700x360"
 */
export interface TableProps<T = any> {
  columns: TableColumn<T>[];
  rows: T[];
  rowKey?: string;
  dense?: boolean;
  hover?: boolean;
  selected?: Array<string | number>;
  onRowClick?: (row: T) => void;
  empty?: React.ReactNode;
  /** Pied : pagination, total */
  footer?: React.ReactNode;
  caption?: string;
}
export declare function Table(props: TableProps): JSX.Element;
