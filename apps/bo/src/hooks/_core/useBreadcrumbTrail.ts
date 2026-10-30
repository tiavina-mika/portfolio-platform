import { useRouterState } from '@tanstack/react-router';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { capitalize } from 'string-ts';

import { IBreadcrumbItem } from '@/types/_core/route.type';

/**
 * ancestor trail for the current route, built from each matched route's
 * `staticData.breadcrumb.labelKey` (never from the raw pathname — route URLs are themselves
 * i18n-translated, so a raw URL segment has no reliable mapping back to a label).
 * Excludes the current route itself — the AppBar breadcrumb appends the live page title (from
 * the `pageTitle` redux slice, set by `Head`) as the trail's final, non-clickable segment.
 */
export const useBreadcrumbTrail = (): IBreadcrumbItem[] => {
  const { t } = useTranslation();
  const pathname = useRouterState({ select: state => state.location.pathname });
  /*
   * only what the trail is built from, compared by value: the matches array itself is replaced on
   * every loading step of a navigation, which re-rendered the whole app bar each time
   */
  const breadcrumbMatches = useRouterState({
    select: state => state.matches
      .filter(match => match.staticData.breadcrumb)
      .map(match => ({ pathname: match.pathname, labelKey: match.staticData.breadcrumb!.labelKey })),
    structuralSharing: true,
  });

  return useMemo(
    (): IBreadcrumbItem[] => breadcrumbMatches
      .filter(match => match.pathname !== pathname)
      .map((match): IBreadcrumbItem => ({
        label: capitalize(t(match.labelKey)),
        to: match.pathname,
      })),
    [breadcrumbMatches, pathname, t]
  );
};
