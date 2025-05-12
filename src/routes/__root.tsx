import { Outlet, createRootRoute } from "@tanstack/react-router";

function Layout() {
  return (
    <>
      <Outlet />
    </>
  );
}

export const Route = createRootRoute({
  component: Layout,
});
