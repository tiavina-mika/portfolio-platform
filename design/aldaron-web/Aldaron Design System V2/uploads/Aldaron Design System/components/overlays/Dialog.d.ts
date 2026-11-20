import * as React from 'react';
/** Fenêtre modale : confirmation, formulaire court. Focus piégé, Échap ferme, focus restauré. */
export interface DialogProps {
  open: boolean;
  onClose?: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  /** sm 400 · md 520 · lg 720 px */
  size?: 'sm' | 'md' | 'lg';
  /** Rend la boîte sans voile ni position fixe (documentation, maquettes) */
  inline?: boolean;
  closeLabel?: string;
  children?: React.ReactNode;
}
export declare function Dialog(props: DialogProps): JSX.Element | null;
