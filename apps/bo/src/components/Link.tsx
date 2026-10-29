import MuiLink, { type LinkProps } from '@mui/material/Link';
import { type LinkOptions, type AnyRouter, Link as RouterLink } from '@tanstack/react-router';

type LinkRouterProps<TRouteTree extends AnyRouter = AnyRouter, TTo extends string = ''> =
  LinkOptions<TRouteTree, '/', TTo> & LinkProps;

const Link = <TRouteTree extends AnyRouter = AnyRouter, TTo extends string = ''>(
  props: LinkRouterProps<TRouteTree, TTo>
) => (
  <MuiLink {...props} component={RouterLink as any} />
);

export default Link;
