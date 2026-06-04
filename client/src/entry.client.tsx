import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

import { fixExternalDOMMutationsCrashes } from "./utils/helpers/domMutation.utils";

// Prevent crashes from browser extensions like Google Translate
fixExternalDOMMutationsCrashes();

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>,
  );
});
