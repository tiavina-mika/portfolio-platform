import { useRouterState } from '@tanstack/react-router';
import { useLayoutEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useDispatch } from 'react-redux';

import { setAppPageTitleSlice } from '@/redux/reducers/_core/app.reducer';
import { formatPageTitle } from '@/utils/_core/utils';

type Props = {
  title?: string;
  description?: string;
};

const Head = ({
  title, description,
}: Props) => {
  const dispatch = useDispatch();
  const pathname = useRouterState({ select: state => state.location.pathname });
  const formattedTitle = formatPageTitle(title!);

  /*
   * single source of truth for "what page am I on" — also read by the AppBar's breadcrumb, which
   * pairs `pageTitle` with the pathname it was set for, so it can tell a fresh title from one
   * left over from the previous route and show a skeleton instead while an entity is still
   * loading (useLayoutEffect, not useEffect, so it commits before paint and avoids a stale-title
   * flash on pages whose title doesn't depend on an async fetch)
   */
  useLayoutEffect(() => {
    dispatch(setAppPageTitleSlice({ title: title ?? '', pathname }));
  }, [dispatch, title, pathname]);

  return (
    <Helmet>
      <title>{formattedTitle}</title>
      <meta content={description} property="description" />
    </Helmet>
  );
};

export default Head;
