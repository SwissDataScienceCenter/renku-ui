import { lazy, Suspense, useEffect, type ComponentProps } from "react";

import useAppDispatch from "~/utils/customHooks/useAppDispatch.hook";
import { setReady } from "./toast.slice";

const ToastContainer = lazy(() =>
  import("react-toastify").then((mod) => ({ default: mod.ToastContainer }))
);

type Props = ComponentProps<typeof ToastContainer>;

export default function LazyToastContainer(props: Props) {
  return (
    <Suspense fallback={null}>
      <ToastContainer {...props} />
      <ReadyToToast />
    </Suspense>
  );
}

function ReadyToToast() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(setReady(true));
  }, [dispatch]);

  return null;
}
