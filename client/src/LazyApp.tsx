import { lazy, Suspense, type ComponentProps } from "react";

import PageLoader from "./components/PageLoader";

const App = lazy(() => import("./App"));

type Props = ComponentProps<typeof App>;

export default function LazyApp(props: Props) {
  return (
    <Suspense fallback={<PageLoader />}>
      <App {...props} />
    </Suspense>
  );
}
