import * as React from 'react';
export type DropdownItem =
  | { type?: 'item'; label: React.ReactNode; icon?: React.ReactNode; shortcut?: string; onSelect?: () => void; destructive?: boolean; disabled?: boolean }
  | { type: 'separator' }
  | { type: 'label'; label: React.ReactNode };
/** Menu d'actions contextuel (ligne de tableau, profil, « plus »). Flèches haut/bas, Échap. */
export interface DropdownMenuProps {
  /** Élément déclencheur, généralement un Button ghost/outline */
  trigger: React.ReactElement;
  items: DropdownItem[];
  align?: 'start' | 'end';
  /** Force l'ouverture (documentation) */
  open?: boolean;
  /** Menu dans le flux, sans position absolue (documentation) */
  staticMenu?: boolean;
}
export declare function DropdownMenu(props: DropdownMenuProps): JSX.Element;
