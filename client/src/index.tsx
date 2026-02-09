// We can safely track hydration in memory state
// outside of the component because it is only
// updated once after the version instance of
// `SomeComponent` has been hydrated. From there,
// the browser takes over rendering duties across
// route changes and we no longer need to worry
// about hydration mismatches until the page is

import { useEffect, useState } from "react";

import type { Route } from "./routes/+types/catchall";

// See: https://remix.run/docs/en/main/guides/migrating-react-router-app#client-only-components
let isHydrating = true;

interface AppRootProps {
  config: Route.ComponentProps["loaderData"]["config"];
}

export default function AppRoot({ config }: AppRootProps) {
  const [isHydrated, setIsHydrated] = useState(!isHydrating);

  useEffect(() => {
    isHydrating = false;
    setIsHydrated(true);
  }, []);

  if (isHydrated) {
    return <AppRootInner config={config} />;
  }
  return null;
}

function AppRootInner({ config }: AppRootProps) {
  useEffect(() => {
    import("./wrappedIndex").then(({ default: render }) => render(config));
  }, [config]);
  return null;
}
