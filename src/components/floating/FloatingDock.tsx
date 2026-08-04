import { lazy, Suspense } from "react";

const FloatingChat = lazy(() => import("./FloatingChat"));
const CameraCapture = lazy(() => import("./CameraCapture"));

/** Consistent floating controls (AI chat + camera) rendered on every page. */
export default function FloatingDock() {
  return (
    <div className="fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[70] flex flex-col items-end">
      <Suspense fallback={null}>
        <FloatingChat />
        <div className="mt-3">
          <CameraCapture />
        </div>
      </Suspense>
    </div>
  );
}
