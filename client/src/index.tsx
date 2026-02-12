// We can safely track hydration in memory state
// outside of the component because it is only
// updated once after the version instance of
// `SomeComponent` has been hydrated. From there,
// the browser takes over rendering duties across
// route changes and we no longer need to worry
// about hydration mismatches until the page is

import { useEffect, useState } from "react";

// import type { Route } from "./routes/+types/catchall";
import type { AppParams } from "./utils/context/appParams.types";

// See: https://remix.run/docs/en/main/guides/migrating-react-router-app#client-only-components
let isHydrating = true;

interface AppRootProps {
  params: AppParams;
}

export default function AppRoot({ params }: AppRootProps) {
  const [isHydrated, setIsHydrated] = useState(!isHydrating);

  useEffect(() => {
    isHydrating = false;
    setIsHydrated(true);
  }, []);

  if (isHydrated) {
    return <AppRootInner params={params} />;
  }
  return null;
}

function AppRootInner({ params }: AppRootProps) {
  useEffect(() => {
    import("./wrappedIndex").then(({ default: render }) => render(params));
  }, [params]);
  return null;
}
