export type GlobalSearchEntityKey =
  | 'article' |
  'category' |
  'page' |
  'contact' |
  'user' |
  'project' |
  'payment' |
  'notification';

export type IGlobalSearchResults = Partial<Record<GlobalSearchEntityKey, Record<string, any>[]>>;

export interface IGlobalSearchState {
  results: IGlobalSearchResults;
  loading: boolean;
}
