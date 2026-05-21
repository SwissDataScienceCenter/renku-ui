import { lazy, Suspense } from "react";

import PageLoader from "../../components/PageLoader";

const DataConnectorShow = lazy(() => import("./show/DataConnectorShow"));

export default function LazyDataConnectorShow() {
  return (
    <Suspense fallback={<PageLoader />}>
      <DataConnectorShow />
    </Suspense>
  );
}
