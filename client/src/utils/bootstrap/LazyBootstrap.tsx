import { lazy, Suspense } from "react";

const Bootstrap = lazy(() => import("./Bootstrap"));

export default function LazyBootstrap() {
  return (
    <Suspense fallback={null}>
      <Bootstrap />
    </Suspense>
  );
}
