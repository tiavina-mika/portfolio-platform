import { Outlet } from '@tanstack/react-router';

import PublicSettingsControls from '@/containers/_core/settings/PublicSettingsControls';

const PublicRouteLayout = () => {
  return (
    <>
      <PublicSettingsControls />
      <Outlet />
    </>
  );
};

export default PublicRouteLayout;
