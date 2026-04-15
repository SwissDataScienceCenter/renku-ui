import { lazy, Suspense } from "react";

import PageLoader from "../../components/PageLoader";

const DataConnectorSettings = lazy(
  () => import("./show/DataConnectorSettings")
);

export default function LazyDataConnectorSettings() {
  return (
    <Suspense fallback={<PageLoader />}>
      <DataConnectorSettings />
    </Suspense>
  );
}
