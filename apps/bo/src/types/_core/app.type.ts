import { useNavigate } from '@tanstack/react-router';
import { MouseEvent, ReactNode } from 'react';
import { z } from 'zod';


import type { IFileCloud } from '@/types/_core/file.type';
import type { IUser } from '@/types/_core/user.type';
import type { DateType } from '@/types/_core/utils.type';

import { Store } from '@/redux/store';
import {
  appMainImagesSchema,
  appSchema,
  autoCompleteOptionSchema,
  confirmDeletionSchema,
  periodRouteSearchParams,
  settingsRouteSearchParams,
  settingsSchema,
  tabAndCategoryRouteSearchParams,
} from '@/validations/_core/app.validations';

export type DefaultMUIColorType =
  | 'default' |
  'primary' |
  'secondary' |
  'error' |
  'info' |
  'success' |
  'warning';
export type ISettingsInput = z.infer<typeof settingsSchema>;
export type ConfirmDeletionInput = z.infer<typeof confirmDeletionSchema>;
export type ITabAndCategorySearchParams = z.infer<typeof tabAndCategoryRouteSearchParams>;
export type ISettingsSearchParams = z.infer<typeof settingsRouteSearchParams>;
export type IPeriodSearchParams = z.infer<typeof periodRouteSearchParams>;
export type IAutocompleteOption = z.infer<typeof autoCompleteOptionSchema>;

export type IAppInput = z.infer<typeof appSchema>;
export type IAppMainImagesInput = z.infer<typeof appMainImagesSchema>;

interface IAppTranslated {
  title: string;
  description: string;
  quote: string;
}

export interface IAppAttributes {
  objectId: string;
  updatedAt?: string;
  createdAt?: string;
  cv?: IFileCloud;
  image?: IFileCloud;
  imageDarkMode?: IFileCloud;
  translated: IAppTranslated;
}

export interface IApp extends Parse.Object<IAppAttributes> {
  id: string;
}
export interface ISelectOption<T = string> {
  label: string;
  value: T;
  icon?: string | ReactNode;
  hide?: boolean;
  /* an option the list still shows because its absence would be unexplained, but cannot be picked */
  disabled?: boolean;
}

// an option of a tree offered as a choice: how many levels under the first one it sits
export interface IChoiceChipOption extends ISelectOption {
  depth?: number;
  // a line under the label, saying why the option is offered the way it is (e.g. why it is disabled)
  hint?: string;
}

/*
 * a tab of a panel strip, which may state how many items its panel holds. The figure is known the
 * moment the strip is drawn — it is what says whether the other tab is worth switching to — so it
 * travels with the option rather than being fetched per tab.
 */
export interface ITabOption<T = string> extends ISelectOption<T> {
  count?: number;
  /*
   * a mark drawn after the label, saying something about the panel behind the tab that a figure
   * cannot — the state of the document a tab opens, where `count` would have nothing to count
   */
  adornment?: ReactNode;
}

/*
 * one block of a detail page: the card it draws, and the name the summary standing next to the
 * page gives it. The label is the card's own title as well — the summary entry and the header of
 * the block it opens have to read as the same thing, so a page states it once.
 */
export interface IPreviewSection {
  // what the summary marks, and what the page remembers between two renders
  id: string;
  label: string;
  /*
   * the name the summary rail gives the block when its card title is a phrase: the rail is a
   * narrow column read as a list of words, and a title wrapping onto two lines breaks that list
   */
  summaryLabel?: string;
  /*
   * the glyph standing for the block once the rail is collapsed to its icons, where the name is
   * gone and this is all that is left to tell one entry from another. A page whose blocks don't
   * all carry one is never offered the collapse control at all, so it is set on every section of a
   * page or on none of them.
   */
  icon?: ReactNode;
  content: ReactNode;
  /*
   * how many rows the block holds. It is printed next to the block's own title, and again as a
   * small pill on the summary entry that names the block before it is open — the only way a reader
   * scanning the rail knows a block is worth opening rather than skipped
   */
  count?: number;
  /*
   * marks the summary pill in the danger tone instead of the neutral one — for a count that is
   * itself a problem (an active suspension) rather than a plain tally (how many sessions exist)
   */
  alertBadge?: boolean;
  /*
   * clusters this entry with the other sections sharing the same name, under that name as a
   * heading — only once a page's block list has grown long enough that a flat column of names
   * stops reading as one list. Left unset, the entry stands in the flat column every page starts
   * with; a page that sets it on one entry has to set it on all of them, or the ones left unset
   * are read as sharing one nameless group of their own.
   */
  group?: string;
  // the hint sitting next to the block title, for a section whose name does not say what it holds
  helperText?: string;
  // what acts on this block alone, standing on its header row
  rightActions?: ReactNode;
  /*
   * a section that already draws a bordered block of its own (a table card, a translated field) is
   * rendered bare: nesting it inside the section card would outline the same content twice
   */
  disableCard?: boolean;
  hide?: boolean;
  /*
   * the short fact trailing the title, in the muted tone, for a block whose rows add up to
   * something worth reading before they are ("2 vehicles · 1 to verify", "4.8 / 5 · 32 reviews")
   */
  subtitle?: ReactNode;
  /*
   * a block reading rows of its own, apart from the entity the page is about, can still be on its
   * way or have failed while the rest of the page is drawn: the card then keeps its place with a
   * placeholder, or states the failure with a way to read that one block again
   */
  status?: PreviewSectionStatus;
  onRetry?: () => void;
  // the figure of `count` is still on its way: the pill keeps its place as a blank disc
  countLoading?: boolean;
}

export type PreviewSectionStatus = 'loading' | 'error';

/**
 * A cluster of blocks read as one page of the record: the summary names the cluster, opening it
 * draws every block it holds, and the figure it carries is the one worth checking before opening
 * it (the devices signed in, the reports waiting for a decision).
 */
export interface IPreviewGroup {
  // what the sections of the cluster name in their own `group`
  key: string;
  label: string;
  icon?: ReactNode;
  count?: number;
  alertBadge?: boolean;
  countLoading?: boolean;
  /*
   * a cluster holding more blocks than one screen shows also lists them under its own name, so
   * the reader can jump to the one they are after instead of scrolling past the others
   */
  listSections?: boolean;
}

/**
 * One picture handed to the viewer: what to draw, and what to name it while it is open.
 */
export interface ILightboxImage {
  url: string;
  // the field or group the picture came from, shown as the viewer's title
  title: string;
  // the one line under it that is read character by character: the pixel size, or the file name
  meta?: string;
  // what the picture is saved as, extension included
  fileName?: string;
}

// export interface IAutocompleteOption<T extends object> extends Omit<ISelectOption<T>, 'hide'> {}

interface IAppSnackBar {
  open: boolean;
  type: string;
  message: string;
  duration: number;
}
export enum EnvEnum {
  DEVELOPMENT = 'development',
  PREPROD = 'preprod',
  PRODUCTION = 'production'
}

export type IEnv = `${EnvEnum}`;

export type ISeverity = 'success' | 'info' | 'warning' | 'error' | '';
export interface IAlert {
  severity: ISeverity;
  type?: 'accountVerification' | 'resetPassword'; // add another type later
  message?: string;
  title?: string;
  duration?: 'permanent' | 'temporary';
}

export interface IDownloadAlert {
  id: string;
  type?: ISeverity;
  message: string;
  duration?: number;
}

export interface IAppState {
  app: IApp | null;
  loading: boolean;
  // loads still running — `loading` is true while it is above zero
  pendingLoadCount: number;
  error: string;
  message: string;
  infoMessage: string;
  appSnackBar: IAppSnackBar;
  currentUser?: IUser | null;
  accountEmail?: string;
  mfaChallengeToken?: string;
  mfaOtpauthUrl?: string | null;
  mfaBackupCodes?: string[] | null;
  pageTitle: string;
  /**
   * pathname the current `pageTitle` was set for — lets the AppBar breadcrumb tell a fresh title
   * from a stale one left over from the previous route (see `Head.tsx`), so it can show a
   * skeleton instead of the wrong page's title while the next page's entity is still loading
   */
  pageTitlePathname: string;
  notifications: Record<string, number>;
  alert: IAlert | null;
  downloadAlerts: IDownloadAlert[];
}

export enum EnvironmentEnum {
  DEV = 'DEV',
  PROD = 'PROD'
}

export type OrderType = 'desc' | 'asc';
export interface IOrderList {
  orderBy: string;
  order: OrderType;
}

export interface IFilterInput {
  filters: Record<string, any>;
  search: Record<string, any>;
}

export interface IQueriesInput extends Partial<IFilterInput> {
  limit?: number;
  skip?: number;
  orderBy?: string;
  order?: string;
  select?: string[];
  include?: string[];
  /*
   * narrows an export down to these rows only (what the reader has ticked). Never reaches the
   * cloud function: the list endpoints take filters, not a set of ids, so the export thunk pulls
   * this out and keeps only the matching rows out of the page it fetched.
   */
  ids?: string[];
}

/** One ordering the list can be read in: the field the database sorts on, and its name. */
export interface ITableSortField {
  id: string;
  label: string;
}

export interface ITableHeadCell<D> {
  disablePadding?: boolean;
  id: D;
  label: string;
  numeric?: boolean;
  disableSorting?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string | number;
  /*
   * overrides which actual DB field(s) this column can be sorted by — needed when the cell
   * renders a combined/derived value (e.g. "createdAt / updatedAt" shown in one column) that has
   * no single matching field. Falls back to this cell's own `id`/`label` when omitted.
   */
  sortFields?: ITableSortField[];
  /*
   * a fact the table already states inside another cell but that a card gives its own line: the
   * cards view lists it, the table view leaves it out (no column, no header, no cell)
   */
  cardOnly?: boolean;
}

export interface IPagination extends IOrderList {
  selected?: any[];
  currentPage: number;
  rowsPerPage: number;
}

// image returned by the upload ap
export interface IDefaultPagination extends Omit<IPagination, 'currentPage'> {
  rowsPerPageOptions?: number[];
}

export interface IIdParams {
  id: string;
}

export interface IRouteContext {
  store: Store | null;
}


export interface ICardRadio<T = string> extends ISelectOption<T> {
  readonly icon?: any;
  readonly description?: string;
}

export type INavigate = ReturnType<typeof useNavigate>;

export interface INotificationMenu {
  objectId: string;
  user?: IUser;
  title: string;
  description: string;
  date: DateType;
  onClick?: () => void; // mainly id
}

export interface IApiError {
  error: string;
  details: {

    /*
     * mainly a translated key
     * @see: middlewares/validation.middleware in the server
     */
    message: string;
    key: string;
  }[];
}

export interface IRenderSearchProps<V extends string | number | unknown = unknown> {
  onSearch: (name: string, value: V) => void;
  onAdvancedSearch: (values: Record<string, any>) => void;
}

export interface ISavedView {
  id: string;
  name: string;
  search: Record<string, any>;
  createdAt: string;
}

export interface IMenu<TOnClick = MouseEvent<HTMLElement>> {
  label: string;
  icon?: ReactNode;
  onClick: (value: TOnClick) => void;
  display?: boolean;
}

export interface ITabSearchParams<T = string> {
  tab: T;
}

export type ListView = 'list' | 'grid';

/*
 * how much air a table row is given. It is a reading preference kept apart from the rendering
 * above: switching to the card grid and back returns to the row height that was last picked.
 */
export type TableDensity = 'compact' | 'comfortable';

/*
 * how the advanced filters of a list are presented. The fields are the same in all three — only
 * what carries them changes with the room the viewport gives and the way the reader is pointing at
 * it: a menu hanging off the toolbar trigger with the list still visible behind, the band folded
 * under that toolbar once the menu no longer clears the card, or the card covered edge to edge on
 * touch, where there is no room to show the rows behind the fields that narrow them.
 */
export type ListFiltersVariant = 'menu' | 'panel' | 'drawer';

/**
 * ex: { key: 'active', value: true, label: 'Active', tab: 'active' }
 * => ?tab=active => { active: true }
 *
 * `string[]` is part of the default so a tab can map to a `containedIn` filter (the reports
 * "disputes" tab groups six reasons), not only to a single `equalTo` value.
 */
/**
 * How many rows each tab of a list holds, keyed by the tab's database field (`IListTabValue.key`)
 * with `all` standing for the unscoped tab the strip opens on — e.g. `{ all: 6, deleted: 1 }`.
 *
 * The figures are the totals of each scope, not of the current search: they say how much there is
 * to switch to, so a reader narrowing the list does not watch the tab they are not on shrink with
 * it. A tab whose count is missing shows a placeholder until it lands; a list that supplies no
 * counts at all shows none.
 */
export type IListTabCounts = Record<string, number | undefined>;

export interface IListTabValue<T = string | boolean | string[]> {
  key: string; // key in database (field)
  value: T; // value in database
  label: string; // label to display (translated)
  tab: string; // tab search param (translated)
  /*
   * which entry of `IListTabCounts` states this tab's total. Only needed when several tabs of the
   * same strip scope the same database field to different values (a queue split by what it is
   * about, say) — their shared `key` would then have them all show the same figure.
   */
  countKey?: string;
  forAdmin?: boolean;
  className?: string; // collection name used to check rights
}

/*
 * one bulk action of the band naming the current selection. Each is drawn as a compact labelled
 * button — the band states what is selected and what can be done to it, and a row of bare glyphs
 * makes the reader hover them one by one to find out which is which.
 */
export interface IListSelectionAction {
  // the button's own text, which is what names the action — never a tooltip on a bare glyph
  label: string;
  /**
   * @NOTE not used when the action opens a confirmation of its own through renderActionComponent
   */
  onClick?: ((selectedIds: string[]) => void) | undefined;
  /**
   * if display only for a certain condition
   * @example display only if the user is an admin
   */
  display?: boolean;
  /*
   * the action destroys or removes what is selected, so it is drawn as the danger outline rather
   * than as neutral chrome — findable at a glance, without being the loudest thing in the band
   */
  destructive?: boolean;
  /**
   * mainly display secondary actions when the first action is triggered
   * @example dialog, modal, menu, popover, form, ...
   * @NOTE the action triggered by this component (ex: a dialog's confirm button)
   * is responsible for calling resetSelectedIds once it has actually completed,
   * so the selection toolbar disappears only after the action succeeds
   * @param selectedIds
   * @param resetSelectedIds callback to reset selected ids once the action has completed
   * @returns
   */
  renderActionComponent?: (selectedIds: string[], resetSelectedIds: () => void) => ReactNode;
}

export interface IToFilters {
  tabs: IListTabValue[];
  searchParams: Record<string, string | number | boolean>;
  filters: Record<string, string | number | boolean>;
  acceptedFields?: string[];
}

export interface IAdvancedSearchOption {
  label: string;
  name: string;
  component: ReactNode;
}

export interface ISEOFields {
  slug?: string;
  metaTitle?: string;
  metaDescription?: string;
  tags?: string;
}

/**
 * Options for translated fields generation
 * These options define the properties of each translated field.
 */
export type TranslatedFieldOption = {
  name: string;
  required?: boolean;
  min?: number;
  max?: number;
  transform?: (value: any) => any;
};


export type MiscOption = {
  color: string;
  label: string;
  action: () => void;
  withSeparator?: boolean;
};

// tabs of the "Divers" page — each tab is gated by its own UI right (see UIRoleEnum)
export enum MiscTabEnum {
  MIGRATIONS = 'migrations',
  CRON = 'cron',
  TESTS = 'tests'
}

export type MiscTab = `${MiscTabEnum}`;

export type ExportFormat = 'csv' | 'xlsx';

/*
 * how much of the list an export covers. It is asked alongside the format because the two answer
 * one question — "what am I taking out of here?" — and because the answer is rarely the whole
 * result set: a reader who has just ticked six rows wants those six, not the two thousand behind
 * the current filters.
 */
export type ExportScope = 'currentPage' | 'selection' | 'allFiltered';

// how many rows each scope covers, stated on its own row so the reader picks a size, not a word
export interface IExportScopeCounts {
  currentPage: number;
  selection: number;
  allFiltered: number;
}

/**
 * header + value getter pair used to flatten a raw domain item (ex: IRide) into an export row.
 * @NOTE evaluated against the raw domain items, not the JSX-transformed table rows used on screen
 */
export interface IExportColumn<T> {
  header: string;
  getValue: (item: T) => string | number | null | undefined;
}
