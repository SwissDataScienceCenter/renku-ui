import { lazy, Suspense } from "react";

const AuthNotifications = lazy(() => import("./AuthNotifications"));

export default function LazyAuthNotifications() {
  return (
    <Suspense fallback={null}>
      <AuthNotifications />
    </Suspense>
  );
}
