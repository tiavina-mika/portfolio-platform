
import * as React from 'react';
export interface PaginationLabels { nav?: string; prev?: string; next?: string; page?: string; }
/** Pagination : Précédent / numéros avec ellipses / Suivant. `compact` remplace les numéros par « 2 / 5 » (mobile). Page courante en `aria-current="page"`. */
export interface PaginationProps {
  page?: number;
  pageCount?: number;
  onChange?: (page: number) => void;
  compact?: boolean;
  labels?: PaginationLabels;
  className?: string;
}
export declare function Pagination(props: PaginationProps): JSX.Element;
