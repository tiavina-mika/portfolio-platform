import { Outlet } from '@tanstack/react-router';

const AppLayout = () => {
  return (
    <>
      <div>App layout</div>
      <Outlet />
    </>
  );
};

export default AppLayout;
