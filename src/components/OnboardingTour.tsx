"use client";

import { TourProvider, useTour } from "@reactour/tour";
import { useEffect, CSSProperties } from "react";

interface GenericTourProps {
  steps: Parameters<typeof TourProvider>[0]["steps"];
  storageKey: string;                 // e.g. "tour_done_vuln"
  maskBg?: string;
}

/* ---------- only-once auto start ---------- */
function AutoStart({ storageKey }: { storageKey: string }) {
  const { setIsOpen } = useTour();

  useEffect(() => {
    if (!localStorage.getItem(storageKey)) {
      setIsOpen(true);
    }
  }, [storageKey, setIsOpen]);

  return null;
}

/* ---------- reusable Tour component ---------- */
export default function OnboardingTour({
  steps,
  storageKey,
  maskBg = "rgba(0,0,0,.85)",
}: GenericTourProps) {
  return (
    <TourProvider
      steps={steps}
      maskBg={maskBg}
      afterClose={() => localStorage.setItem(storageKey, "yes")}
      styles={{
        /* ubble */
        popover: (base: CSSProperties): CSSProperties => ({
          ...base,
          background: "#2563eb",        // blue-600
          color: "#f3f4f6",             // gray-100
          fontFamily: "Inter, sans-serif",
          fontSize: 20,
          borderRadius: 8,
          padding: "16px 40px",
          maxWidth: 400,
        }),
        arrow: (base: CSSProperties): CSSProperties => ({
          ...base, color: "#2563eb",
        }),
        badge: (base: CSSProperties): CSSProperties => ({
          ...base, background: "#3b82f6", fontSize: 20,}),
        buttonNext: (base: CSSProperties): CSSProperties => ({
          ...base,
          background: "#3b82f6",
          fontSize: 20,
          padding: "8px 20px",
              }),

          close: (base) => ({
  ...base,
  width: 20,
  height: 20,
  color: "#cbd5e1",
  right: 20,
  top: 12,
        }),
      }}
      showDots
      showBadge
      disableInteraction
    >
      <AutoStart storageKey={storageKey} />
    </TourProvider>
  );
}

