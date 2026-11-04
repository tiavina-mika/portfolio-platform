declare module '@tanstack/react-router' {
  // eslint-disable-next-line @typescript-eslint/naming-convention -- must match the augmented library interface's name
  interface StaticDataRouteOption {
    /**
     * fed into the breadcrumb trail (see `useBreadcrumbTrail`) — only set on the "layout" route
     * of a section (ex: articlesLayout, usersLayout) so it's inherited by every route nested
     * under it without having to repeat it on every leaf route
     */
    breadcrumb?: {
      labelKey: string;
    };
  }
}

export interface IBreadcrumbItem {
  label: string;
  to: string;
}
