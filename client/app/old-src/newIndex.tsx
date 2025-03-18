// We can safely track hydration in memory state
// outside of the component because it is only
// updated once after the version instance of
// `SomeComponent` has been hydrated. From there,
// the browser takes over rendering duties across
// route changes and we no longer need to worry
// about hydration mismatches until the page is

import { useEffect, useState } from "react";

// import render from "./index";

// reloaded and `isHydrating` is reset to true.
let isHydrating = true;

export default function AppRoot() {
  const [isHydrated, setIsHydrated] = useState(!isHydrating);

  useEffect(() => {
    isHydrating = false;
    setIsHydrated(true);
  }, []);

  if (isHydrated) {
    return <AppRootInner />;
  } else {
    return null;
  }
}

function AppRootInner() {
  useEffect(() => {
    // render();
    import("./index").then(({ default: render }) => render());
  }, []);
  return null;
}
