import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

import { fixExternalDOMMutationsCrashes } from "./utils/helpers/domMutation.utils";

startTransition(() => {
  // Prevent crashes from browser extensions like Google Translate
  fixExternalDOMMutationsCrashes();

  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});
