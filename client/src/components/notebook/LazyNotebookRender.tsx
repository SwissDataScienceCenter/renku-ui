import { ComponentProps, Suspense, lazy } from "react";
import { Loader } from "../Loader";

const NotebookRender = lazy(() => import("./index"));

export default function LazyNotebookRender(
  props: ComponentProps<typeof NotebookRender>
) {
  return (
    <Suspense fallback={<Loader />}>
      <NotebookRender {...props} />
    </Suspense>
  );
}
