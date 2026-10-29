import { createContext, useContext } from 'react';

/**
 * The advanced filters are two bands of the list card — a panel folded under the toolbar, and the
 * strip of chips naming what is currently narrowing the list — but the fields they hold are
 * declared by the page, deep inside the node it hands the list through `renderFilter`. This is
 * what lets that node render into the bands the list owns, and share the state the list keeps for
 * them, instead of every page forwarding it down to its own filter form.
 */
export interface IListFilters {
  // where the filter panel renders, between the toolbar and the rows
  panelSlot: HTMLElement | null;
  /*
   * where it renders instead on touch: over the whole card rather than as a band of it. A phone has
   * no room to show the rows behind the fields that narrow them, so the filter set takes the frame
   * and the reader lands back on the list once they accept it
   */
  overlaySlot: HTMLElement | null;
  // where the active-filter chips render, right under the panel
  chipsSlot: HTMLElement | null;
  // how many rows the applied filters leave — the panel states it next to its actions
  resultCount: number;
  isPanelOpen: boolean;
  togglePanel: () => void;
  /*
   * back to the list as it opens: clears the advanced filters, the toolbar search boxes and the
   * page the reader is on alike — more than the filter form can clear on its own
   */
  resetFilters: () => void;
}

export const ListFiltersContext = createContext<IListFilters | null>(null);

/**
 * null outside a list card — a filter form used on its own then renders its panel where it stands
 */
export const useListFilters = (): IListFilters | null => useContext(ListFiltersContext);
