import { Outlet } from '@tanstack/react-router';

import AuthCardLayout from '@/containers/_core/auth/AuthCardLayout';

const AuthRouteLayout = () => {
  return (
    <AuthCardLayout>
      <Outlet />
    </AuthCardLayout>
  );
};

export default AuthRouteLayout;
