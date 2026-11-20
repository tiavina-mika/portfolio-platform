// the keys of the lists written in the `Home` translations, in the order they are shown
export const HOME_FACT_KEYS = ['1', '2', '3'] as const;
export const HOME_SUPPORT_KEYS = ['1', '2', '3', '4'] as const;
export const HOME_INCLUDED_KEYS = ['1', '2', '3', '4'] as const;
export const HOME_EXCLUDED_KEYS = ['1', '2'] as const;
export const HOME_PROCESS_STEP_KEYS = ['1', '2', '3', '4'] as const;

/**
 * The projects shown on the home page. The names are brands, so they are not translated; the price is in
 * euros and the supports are keys of `Home.projects.supports`.
 */
export const HOME_PROJECTS = [
  { key: '1', name: 'Tsara Livraison', supports: ['mobile', 'backOffice'], weeks: 8, price: 3500 },
  { key: '2', name: 'Fanilo Santé', supports: ['webApp', 'backOffice'], weeks: 5, price: 2000 },
  { key: '3', name: 'Ravinala Voyages', supports: ['website'], weeks: 3, price: 1500 },
] as const;
